const imported = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: ["73", "80", "69"] },
  { name: "Diana", scores: [] },
  { name: "Frank", scores: "91, 85" }
];

function average(scores) {
  let total = 0;
  for (const score of scores) {
    total += score;
  }
  return total / scores.length;
}

for (const student of imported) {
  const value = average(student.scores);
  console.log(student.name + ":", value.toFixed(1));
}
