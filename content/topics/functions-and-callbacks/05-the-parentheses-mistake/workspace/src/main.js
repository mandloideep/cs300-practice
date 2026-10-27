function remindToStretch() {
  console.log("Time to stretch.");
}

function runTwice(task) {
  task();
  task();
}

console.log("Before runTwice.");
runTwice(remindToStretch());
console.log("After runTwice.");
