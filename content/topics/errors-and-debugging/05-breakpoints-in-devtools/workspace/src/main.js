const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i <= scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

for (const student of students) {
  console.log(`${student.name}: ${average(student.scores).toFixed(1)}`);
}
