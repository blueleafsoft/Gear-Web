// Simple script to demonstrate interactivity
const button = document.getElementById("countBtn");
const countEl = document.getElementById("count");
let count = 0;

if (button && countEl) {
  button.addEventListener("click", () => {
    count += 1;
    countEl.textContent = `Clicked ${count} time${count === 1 ? "" : "s"}`;
  });
}
