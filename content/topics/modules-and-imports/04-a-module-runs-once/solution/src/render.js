import { formatRow } from "./format.js";

export default function renderGradebook(list, students) {
  for (const student of students) {
    const item = document.createElement("li");
    item.textContent = formatRow(student);
    list.append(item);
  }
}

export function renderSummary(summary, students) {
  summary.textContent = students.length + " students graded.";
}

console.log("render.js ran");
