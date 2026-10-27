import { students } from "./students.js";
import { formatRow } from "./format.js";

const list = document.querySelector("#grades");
for (const student of students) {
  const item = document.createElement("li");
  item.textContent = formatRow(student);
  list.append(item);
}
document.querySelector("#summary").textContent = students.length + " students graded.";

console.log("main.js ran");
