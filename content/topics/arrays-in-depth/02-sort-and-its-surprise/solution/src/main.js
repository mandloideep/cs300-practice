const scores = [88, 9, 100, 72, 95];
const roster = [
  { name: "Diana", score: 62 },
  { name: "Alice", score: 95 },
  { name: "Bob", score: 73 }
];

console.log("scores:", scores);

console.log("[10, 9, 1].sort():", [10, 9, 1].sort());

const lowToHigh = scores.sort((a, b) => a - b);
console.log("Low to high:", lowToHigh);

console.log("scores now:", scores);
console.log("Same array?", lowToHigh === scores);

const byScore = roster.toSorted((a, b) => b.score - a.score);
console.log("By score:", byScore.map((student) => student.name));
console.log("roster still:", roster.map((student) => student.name));
