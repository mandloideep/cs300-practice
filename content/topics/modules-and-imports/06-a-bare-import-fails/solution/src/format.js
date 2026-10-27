import { settings } from "./settings.js";

function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function formatRow(student) {
  const score = student.score + settings.curve;
  return student.name + ": " + score + " (" + letterGrade(score) + ")";
}

console.log("format.js ran");
