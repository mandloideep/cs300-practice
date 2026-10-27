export default async function check({ document, console }) {
  const rows = [...document.querySelectorAll("#grades li")].map((item) => item.textContent.trim());
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const settingsRuns = lines.filter((line) => line === "settings.js ran").length;
  const curved = ["Alice: 100 (A)", "Bob: 78 (C)", "Charlie: 93 (A)", "Diana: 67 (D)", "Frank: 50 (F)"];

  return [
    {
      id: "settings-ran-once",
      title: "settings.js runs exactly once",
      pass: settingsRuns === 1,
      hint:
        settingsRuns === 0
          ? 'The console has no "settings.js ran". Replace the placeholder in src/settings.js and import it in src/format.js and src/main.js.'
          : `The console shows "settings.js ran" ${settingsRuns} times; a module runs once however many files import it.`
    },
    {
      id: "curve-applied",
      title: "Every row shows the five-point curve",
      pass: rows.length === 5 && rows.every((row, index) => row === curved[index]),
      hint:
        rows.length === 0
          ? "The list is empty. Read the console for the first red line."
          : `The first row reads "${rows[0]}" but should read "Alice: 100 (A)". Set settings.curve = 5 before renderGradebook, and add settings.curve to the score in formatRow.`
    },
    {
      id: "one-shared-object",
      title: "Both files import settings.js and every file still runs",
      pass: settingsRuns === 1 && lines.includes("format.js ran") && lines.includes("main.js ran"),
      hint: 'The console should show "settings.js ran", "format.js ran", and "main.js ran". Each of src/format.js and src/main.js imports { settings } from "./settings.js".'
    }
  ];
}
