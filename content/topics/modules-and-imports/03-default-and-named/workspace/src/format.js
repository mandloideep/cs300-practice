function letterGrade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

export function formatRow(student) {
  return student.name + ": " + student.score + " (" + letterGrade(student.score) + ")";
}

console.log("format.js ran");
