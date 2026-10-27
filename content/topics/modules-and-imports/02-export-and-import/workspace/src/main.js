import { students } from "./students.js";

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function formatRow(student) {
  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";
}

const list = document.querySelector("#grades");
for (const student of students) {
  const item = document.createElement("li");
  item.textContent = formatRow(student);
  list.append(item);
}
document.querySelector("#summary").textContent = students.length + " students graded.";

console.log("main.js ran");
