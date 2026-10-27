export default async function check({ document, console }) {
  const rows = [...document.querySelectorAll("#grades li")].map((item) => item.textContent.trim());
  const summary = document.querySelector("#summary")?.textContent.trim();
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const studentsAt = lines.indexOf("students.js ran");
  const mainAt = lines.indexOf("main.js ran");

  return [
    {
      id: "five-rows",
      title: "The gradebook shows one row per student",
      pass: rows.length === 5 && rows[0] === "Alice: 95 (A)" && rows[4] === "Frank: 45 (F)",
      hint:
        rows.length === 0
          ? "The list is empty. Read the console for an error; main.js needs the import line to see students."
          : `The list has ${rows.length} rows starting with "${rows[0]}"; it should have five, from "Alice: 95 (A)" to "Frank: 45 (F)".`
    },
    {
      id: "summary-line",
      title: "The summary counts the students",
      pass: summary === "5 students graded.",
      hint: `The summary reads "${summary}". It is set from students.length at the end of main.js.`
    },
    {
      id: "students-module-ran",
      title: "students.js runs before main.js",
      pass: studentsAt !== -1 && mainAt !== -1 && studentsAt < mainAt,
      hint: 'The console should show "students.js ran" above "main.js ran". Export the array from src/students.js and import it at the top of src/main.js.'
    }
  ];
}
