const status = document.querySelector("#status");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
  console.log("X");
  await delay(1000);
  console.log("Y");
  status.textContent = "The wait is over.";
  console.log("Z");
}

console.log("Start");
status.textContent = "Waiting...";
demo();
console.log("End");
