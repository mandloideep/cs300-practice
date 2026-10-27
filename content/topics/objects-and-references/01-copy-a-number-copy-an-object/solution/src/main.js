const score = 85;
const student = { name: "Alice", score: 85 };

console.log("score:", score);
console.log("student:", student);

let curvedScore = score;
curvedScore = curvedScore + 5;
console.log("curvedScore:", curvedScore);
console.log("score after the curve:", score);

const sameStudent = student;
sameStudent.score = 90;
console.log("sameStudent:", sameStudent);
console.log("student after the change:", student);
console.log("Same object?", sameStudent === student);

const addBonus = (record) => {
  record.score = record.score + 5;
};
addBonus(student);
console.log("student after addBonus:", student);
