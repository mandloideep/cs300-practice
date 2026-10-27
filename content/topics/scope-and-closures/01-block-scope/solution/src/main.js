const score = 84;

let message = "Below the B line.";
if (score >= 80) {
  message = "Above the B line.";
  console.log("Inside the if:", message);
}
console.log("Outside the if:", message);

const roster = ["Alice", "Bob", "Charlie"];
let lastStudent = "nobody";
for (const student of roster) {
  lastStudent = student;
}
console.log("Last student:", lastStudent);
