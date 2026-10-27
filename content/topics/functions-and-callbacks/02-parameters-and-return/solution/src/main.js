const quizPoints = 18;
const quizOutOf = 20;

console.log("Quiz:", quizPoints, "out of", quizOutOf);

function toPercent(points, outOf) {
  return (points * 100) / outOf;
}

const quizPercent = toPercent(quizPoints, quizOutOf);
console.log("Quiz percent:", quizPercent);
console.log("Lab percent:", toPercent(42, 50));

function logPercent(points, outOf) {
  console.log((points * 100) / outOf);
}

const logged = logPercent(9, 10);
console.log("logPercent returned:", logged);
