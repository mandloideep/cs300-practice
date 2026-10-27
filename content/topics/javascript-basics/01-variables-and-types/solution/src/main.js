const studentName = "Alice";
let score = 85;

console.log("Student:", studentName);
console.log("Score:", score);

console.log("studentName is a", typeof studentName);
console.log("score is a", typeof score);

score = 90;
console.log("Score after the retake:", score);

const isPassing = score >= 60;
let selectedTopic = null;
let lastResult;
console.log("isPassing:", isPassing, typeof isPassing);
console.log("selectedTopic:", selectedTopic);
console.log("lastResult:", lastResult);

console.log(`${studentName} scored ${score}.`);
