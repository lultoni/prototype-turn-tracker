// ---------- Utilities ----------
const $ = sel => document.querySelector(sel);

const defaultState = {
  round: 1,
  currentPlayer: 1, // 1 or 2
  p1: { runes: 5, guards: 6, champs: 5 },
  p2: { runes: 5, guards: 6, champs: 5 },
  roundsSinceCapture: 0,
  captureThisRound: false,
  notes: ""
};

const LS_KEY = "turn-tracker-v1";

function loadState(){
  try{ const s = JSON.parse(localStorage.getItem(LS_KEY)); if(s) return s; }catch(e){}
  return structuredClone(defaultState);
}
function saveState(){ localStorage.setItem(LS_KEY, JSON.stringify(state)); }

let state = loadState();

// ---------- Derived values ----------
function runeGainForRound(round){
  // +1 base; increases by +1 every 7 rounds: +2 at 7..13, +3 at 14..20, ...
  return 1 + Math.floor(round / 7);
}
function skillSlotsForRound(round){
  // Start 2; +1 every 10 rounds: 3 at 10..19, 4 at 20..29, ...
  return 2 + Math.floor((round) / 10);
}

// ---------- Rendering ----------
function render(){
  $('#round').textContent = state.round;
  $('#currentPlayer').textContent = state.currentPlayer === 1 ? 'P1' : 'P2';
  $('#rsc').textContent = state.roundsSinceCapture;
  $('#p1Runes').textContent = state.p1.runes;
  $('#p2Runes').textContent = state.p2.runes;
  $('#p1Guards').textContent = state.p1.guards;
  $('#p1Champs').textContent = state.p1.champs;
  $('#p2Guards').textContent = state.p2.guards;
  $('#p2Champs').textContent = state.p2.champs;
  $('#notes').value = state.notes;

  const runeGain = runeGainForRound(state.round);
  $('#runeGain').textContent = `+${runeGain}`;

  const slotsNow = skillSlotsForRound(state.round);
  $('#skillSlotsNow').textContent = slotsNow;

  // Capture toggle button label
  const capBtn = $('#toggleCapture');
  capBtn.textContent = state.captureThisRound ? 'Capture happened ✔' : 'No capture this round';
  capBtn.className = state.captureThisRound ? 'ok' : 'secondary';

  // Draw checks
  const dc1 = $('#dc1');
  const dc2 = $('#dc2');
  const dc1Trig = state.roundsSinceCapture >= 10;
  const onlyKingsRemain = (state.p1.guards + state.p1.champs + state.p2.guards + state.p2.champs) === 0;

  dc1.textContent = dc1Trig ? 'DC1: DRAW (no capture for 10 rounds)' : `DC1: ${10 - state.roundsSinceCapture} rounds until draw`;
  dc1.className = 'pill ' + (dc1Trig ? 'warn' : '');

  dc2.textContent = onlyKingsRemain ? 'DC2: DRAW (only Kings remain)' : 'DC2: OK';
  dc2.className = 'pill ' + (onlyKingsRemain ? 'warn' : '');
}

// ---------- Interactions ----------
// Rune +/-
document.querySelectorAll('[data-rune-delta]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const p = btn.getAttribute('data-player') === '1' ? state.p1 : state.p2;
    const d = parseInt(btn.getAttribute('data-rune-delta'));
    p.runes = Math.max(0, p.runes + d);
    saveState(); render();
  });
});

// Piece +/-
document.querySelectorAll('[data-piece]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const key = btn.getAttribute('data-piece');
    const d = btn.getAttribute('data-delta') === '+1' ? 1 : -1;
    const [player, prop] = key.startsWith('p1') ? [state.p1, key === 'p1Guards' ? 'guards':'champs'] : [state.p2, key === 'p2Guards' ? 'guards':'champs'];
    player[prop] = Math.max(0, player[prop] + d);
    saveState(); render();
  });
});

// Notes auto-save
$('#notes').addEventListener('input', (e)=>{ state.notes = e.target.value; saveState(); });

// Toggle capture flag for this round
$('#toggleCapture').addEventListener('click', ()=>{
  state.captureThisRound = !state.captureThisRound; saveState(); render();
});

// End Turn logic
$('#endTurn').addEventListener('click', ()=>{
  // next player or next round
  if(state.currentPlayer === 1){
    state.currentPlayer = 2;
  } else {
    state.currentPlayer = 1;
    // Round advances
    // Capture tracking for DC1
    if(state.captureThisRound){
      state.roundsSinceCapture = 0;
    } else {
      state.roundsSinceCapture += 1;
    }
    state.captureThisRound = false; // reset toggle for next round

    // Rune gain for BOTH players
    const gain = runeGainForRound(state.round);
    state.p1.runes += gain;
    state.p2.runes += gain;

    state.round += 1;
  }
  saveState(); render();
});

// Reset game
$('#resetGame').addEventListener('click', ()=>{
  if(confirm('Reset game and clear all saved data?')){
    localStorage.removeItem(LS_KEY);
    state = structuredClone(defaultState);
    render();
  }
});

// Initial paint
render();