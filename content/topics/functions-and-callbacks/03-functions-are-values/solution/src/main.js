function addCurve(score) {
  return score + 5;
}

console.log("Curved 80:", addCurve(80));

console.log("addCurve is a", typeof addCurve);
console.log("The value itself:", addCurve);

const adjust = addCurve;
console.log("Called through adjust:", adjust(70));

const capAt100 = function (score) {
  return score > 100 ? 100 : score;
};
console.log("Capped 104:", capAt100(104));

const rules = [addCurve, capAt100];
let finalScore = 98;
for (const rule of rules) {
  finalScore = rule(finalScore);
}
console.log("After every rule:", finalScore);
