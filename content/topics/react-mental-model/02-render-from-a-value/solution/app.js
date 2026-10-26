const panel = document.querySelector("#panel");
const button = document.querySelector("#review");
const total = 3;
let reviewed = 0;

function renderPanel(count) {
  const message = count === total ? "All concepts reviewed." : "Keep going.";
  return `<p>Reviewed ${count} of ${total} concepts.</p><p>${message}</p>`;
}

panel.innerHTML = renderPanel(reviewed);

button.addEventListener("click", () => {
  if (reviewed === total) {
    return;
  }
  reviewed = reviewed + 1;
  panel.innerHTML = renderPanel(reviewed);
});
