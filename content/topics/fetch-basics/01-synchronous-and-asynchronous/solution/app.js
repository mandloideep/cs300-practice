const status = document.querySelector("#status");

console.log("A");
setTimeout(() => {
  console.log("B");
}, 0);
console.log("C");
setTimeout(() => {
  console.log("D");
  status.textContent = "The one second timer finished, long after the script.";
}, 1000);
console.log("E");
status.textContent = "The script finished. Both timers are still waiting.";
