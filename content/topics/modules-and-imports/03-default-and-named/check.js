export default async function check({ document, console }) {
  const rows = [...document.querySelectorAll("#grades li")].map((item) => item.textContent.trim());
  const summary = document.querySelector("#summary")?.textContent.trim();
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const ran = lines.filter((line) => line.endsWith(".js ran"));
  const expected = ["students.js ran", "format.js ran", "render.js ran", "main.js ran"];

  return [
    {
      id: "rows-and-summary",
      title: "The rows and the summary render from render.js",
      pass: rows.length === 5 && rows[2] === "Charlie: 88 (B)" && summary === "5 students graded.",
      hint:
        rows.length === 5
          ? `The list has five rows and the summary reads "${summary}"; it should read "5 students graded.". Call renderSummary with the #summary element.`
          : `The list has ${rows.length} rows; it should have five. Read the console for the first red line, then compare the two calls in src/main.js with the functions in src/render.js.`
    },
    {
      id: "render-module-ran",
      title: "render.js runs",
      pass: lines.includes("render.js ran"),
      hint: 'The console should show "render.js ran". Replace the placeholder in src/render.js and import from it in src/main.js.'
    },
    {
      id: "dependencies-first",
      title: "Each file runs after the files it imports",
      pass: ran.length === 4 && ran.every((line, index) => line === expected[index]),
      hint: `The console shows ${ran.join(", ") || "no file logs"}; it should show ${expected.join(", ")}. render.js imports format.js, and main.js imports students.js and then render.js.`
    }
  ];
}
