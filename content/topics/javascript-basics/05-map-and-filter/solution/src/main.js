const scores = [85, 92, 73, 96, 81];

console.log("Scores:", scores);

const double = (score) => score * 2;
const doubled = scores.map(double);
console.log("Doubled:", doubled);

const passing = scores.filter((score) => score >= 80);
console.log("Passing:", passing);
console.log("Original:", scores);

scores.forEach((score, index) => {
  console.log(`Score ${index + 1}: ${score}`);
});

const passingLabels = scores
  .filter((score) => score >= 80)
  .map((score) => `${score} pass`);
console.log("Passing labels:", passingLabels);
