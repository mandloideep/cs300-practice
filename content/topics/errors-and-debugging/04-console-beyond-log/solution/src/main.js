const students = [
  { name: "Alice", score: 95 },
  { name: "Bob", score: 54 },
  { name: "Charlie", score: 88 },
  { name: "Diana", score: 140 }
];

console.info("Gradebook loaded:", students.length, "students");

console.log("First student:", students[0]);

for (const student of students) {
  if (student.score > 100) {
    console.error(`${student.name} has an impossible score: ${student.score}`);
  } else if (student.score < 60) {
    console.warn(`${student.name} is failing with ${student.score}`);
  } else {
    console.debug(`${student.name} is fine with ${student.score}`);
  }
}
console.log("Checked every student.");
