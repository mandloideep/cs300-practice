const getGrade = (score) => {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

const alice = { name: "Alice", score: 95 };

const roster = [
  { name: "Alice", score: 95 },
  { name: "Bob", score: 73 },
  { name: "Charlie", score: 88 },
  { name: "Diana", score: 62 },
  { name: "Eve", score: 91 },
  { name: "Frank", score: 45 }
];

console.log("One student:", alice);
console.log("Total students:", roster.length);

console.log("Name:", alice.name);
const field = "score";
console.log("Score by variable:", alice[field]);
alice.grade = getGrade(alice.score);
console.log("With a grade:", alice);

const rosterWithGrades = roster.map((student) => {
  return { name: student.name, score: student.score, grade: getGrade(student.score) };
});
console.log("First with grade:", rosterWithGrades[0]);
console.log("First original:", roster[0]);

const passing = rosterWithGrades.filter((student) => student.grade !== "F");
const honorRoll = rosterWithGrades.filter((student) => student.score >= 90);
console.log(`Passing: ${passing.length} of ${roster.length}`);
console.log("Honor roll:", honorRoll.map((student) => student.name));

rosterWithGrades.forEach((student) => {
  const status = student.grade === "F" ? "failing" : "passing";
  console.log(`${student.name}: ${student.score} (${student.grade}) ${status}`);
});
