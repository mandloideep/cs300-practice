const imported = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: ["73", "80", "69"] },
  { name: "Diana", scores: [] },
  { name: "Frank", scores: "91, 85" }
];

function average(scores) {
  if (!Array.isArray(scores)) {
    throw new TypeError(`expected an array of scores, got ${typeof scores}`);
  }
  if (scores.length === 0) {
    return null;
  }
  let total = 0;
  for (const score of scores) {
    total += Number(score);
  }
  return total / scores.length;
}

for (const student of imported) {
  try {
    const value = average(student.scores);
    if (value === null) {
      console.log(student.name + ": no scores yet");
    } else {
      console.log(student.name + ":", value.toFixed(1));
    }
  } catch (error) {
    console.warn(student.name, "skipped:", error.message);
  }
}
