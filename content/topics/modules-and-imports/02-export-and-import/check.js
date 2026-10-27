export default async function check({ document, console }) {
  const rows = [...document.querySelectorAll("#grades li")].map((item) => item.textContent.trim());
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const ran = lines.filter((line) => line.endsWith(".js ran"));
  const expected = ["students.js ran", "format.js ran", "main.js ran"];

  return [
    {
      id: "rows-still-render",
      title: "The five rows still render with their grades",
      pass: rows.length === 5 && rows[1] === "Bob: 73 (C)" && rows[4] === "Frank: 45 (F)",
      hint:
        rows.length === 0
          ? "The list is empty. Read the console for the first red line; main.js imports formatRow from ./format.js."
          : `The second row reads "${rows[1]}" but should read "Bob: 73 (C)".`
    },
    {
      id: "format-module-ran",
      title: "format.js runs",
      pass: lines.includes("format.js ran"),
      hint: 'The console should show "format.js ran". Replace the placeholder in src/format.js with the two functions and the log, and import formatRow in src/main.js.'
    },
    {
      id: "modules-in-order",
      title: "The imported files run before main.js, in import order",
      pass: ran.length === 3 && ran.every((line, index) => line === expected[index]),
      hint: `The console shows ${ran.join(", ") || "no file logs"}; it should show ${expected.join(", ")}. The import of students.js comes first, then format.js.`
    }
  ];
}
