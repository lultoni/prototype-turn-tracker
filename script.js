// Load saved turn count from localStorage, or start at 0
let turn = localStorage.getItem("turn") ? parseInt(localStorage.getItem("turn")) : 0;
const turnDisplay = document.getElementById("turn");
const nextBtn = document.getElementById("next");
const resetBtn = document.getElementById("reset");

// Display the current turn
function updateDisplay() {
  turnDisplay.textContent = turn;
  localStorage.setItem("turn", turn); // Save to localStorage
}

// Increment turn
nextBtn.addEventListener("click", () => {
  turn++;
  updateDisplay();
});

// Reset game
resetBtn.addEventListener("click", () => {
  turn = 0;
  updateDisplay();
});

// Initialize
updateDisplay();
