function remindToStretch() {
  console.log("Time to stretch.");
}

function runTwice(task) {
  task();
  task();
}

console.log("Before runTwice.");
runTwice(remindToStretch);
console.log("After runTwice.");

const reminder = remindToStretch;
const result = remindToStretch();
console.log("reminder holds:", reminder);
console.log("result holds:", result);

function remind(message) {
  console.log(`Reminder: ${message}`);
}

runTwice(() => remind("Drink some water."));
