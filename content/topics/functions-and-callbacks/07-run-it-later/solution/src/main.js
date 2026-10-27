console.log("Study timer set.");
setTimeout(() => {
  console.log("Break time.");
}, 200);
console.log("Reading the chapter.");

setTimeout(() => {
  console.log("Zero delay, still after the file.");
}, 0);
console.log("Last line of the file.");

function endSession() {
  console.log("Session over. Good work.");
}

setTimeout(endSession, 300);
