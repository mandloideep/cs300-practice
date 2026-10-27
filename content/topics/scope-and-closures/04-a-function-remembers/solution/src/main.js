const scores = [92, 78, 55, 88, 61];

console.log("Scores:", scores);

function makeAtLeast(line) {
  const check = (score) => score >= line;
  return check;
}

const atLeast80 = makeAtLeast(80);
console.log("atLeast80 holds", atLeast80);
console.log("Is 85 at least 80?", atLeast80(85));

const atLeast60 = makeAtLeast(60);
console.log("At least 80:", scores.filter(atLeast80));
console.log("At least 60:", scores.filter(atLeast60));

let curve = 0;
const withCurve = (score) => score + curve;
curve = 5;
console.log("78 with the curve:", withCurve(78));
