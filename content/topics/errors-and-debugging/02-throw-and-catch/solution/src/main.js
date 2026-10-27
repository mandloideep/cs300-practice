const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] },
  { name: "Charlie", scores: [88, 91, 79] },
  { name: "Diana" },
  { name: "Eve", scores: [91, 85, 97] }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

function reportLine(student) {
  if (student.scores === undefined) {
    throw new Error(`${student.name} has no scores yet`);
  }
  const value = average(student.scores);
  return `${student.name}: ${value.toFixed(1)}`;
}

function printReport(list) {
  for (const student of list) {
    try {
      console.log(reportLine(student));
    } catch (error) {
      console.log("Skipped:", error.message);
    }
  }
}

try {
  printReport(students);
} catch (error) {
  console.log(error.stack);
}
console.log("The script reached its last line.");
