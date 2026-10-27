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
