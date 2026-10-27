const scores = [92, 78, 55, 88, 61];

function isPassing(score) {
  return score >= 60;
}

function isHonors(score) {
  return score >= 90;
}

console.log("Scores:", scores);

function countWhere(list, test) {
  let count = 0;
  for (const item of list) {
    if (test(item)) {
      count = count + 1;
    }
  }
  return count;
}

console.log("Passing:", countWhere(scores, isPassing));
console.log("Honors:", countWhere(scores, isHonors));

const belowEighty = countWhere(scores, (score) => {
  console.log("countWhere asked about", score);
  return score < 80;
});
console.log("Below 80:", belowEighty);

console.log("Passing with filter:", scores.filter(isPassing).length);
