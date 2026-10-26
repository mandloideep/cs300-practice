const panel = document.querySelector("#panel");
const button = document.querySelector("#review");
const total = 3;
let reviewed = 0;

panel.innerHTML = "<p>Reviewed 0 of 3 concepts.</p>";

button.addEventListener("click", () => {
  if (reviewed === total) {
    return;
  }
  reviewed = reviewed + 1;
});
