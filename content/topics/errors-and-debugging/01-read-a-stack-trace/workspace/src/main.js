const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] },
  { name: "Charlie", scores: [88, 91, 79] }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

function reportLine(student) {
  const value = average(student.scores);
  return `${student.name}: ${value.toFixed(1)}`;
}

function printReport(list) {
  for (const student of list) {
    console.log(reportLine(student));
  }
}

printReport(students);
