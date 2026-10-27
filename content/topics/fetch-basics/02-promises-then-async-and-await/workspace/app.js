const status = document.querySelector("#status");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log("Start");
status.textContent = "Waiting...";
console.log("End");
