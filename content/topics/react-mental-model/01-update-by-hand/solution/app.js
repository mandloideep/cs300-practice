const statusLine = document.querySelector("#status");
const remainingLine = document.querySelector("#remaining");
const button = document.querySelector("#review");
const total = 3;
let reviewed = 0;

button.addEventListener("click", () => {
  if (reviewed === total) {
    return;
  }
  reviewed = reviewed + 1;
  statusLine.textContent = `Reviewed ${reviewed} of ${total} concepts.`;
  remainingLine.textContent = `${total - reviewed} concepts left.`;
  console.log("reviewed is now", reviewed);
});
