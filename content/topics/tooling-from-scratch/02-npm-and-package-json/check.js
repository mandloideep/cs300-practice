export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const scripts = lines.filter((line) => line.startsWith("npm run "));

  return [
    {
      id: "reads-the-project",
      title: "The project's name and version are read from package.json",
      pass: has("Project: study-timer 1.0.0"),
      hint: "Keep the import of ../package.json and the first console.log from the starter."
    },
    {
      id: "three-scripts",
      title: "One line per script, including the new preview script",
      pass:
        scripts.length === 3 &&
        has("npm run dev runs: vite") &&
        has("npm run preview runs: vite preview"),
      hint: `The console shows ${scripts.length} npm run line(s). Loop over Object.entries(project.scripts), and add "preview": "vite preview" to the scripts in package.json, with a comma after the build line.`
    },
    {
      id: "two-kinds-of-dependency",
      title: "ms is a dependency and vite a development dependency",
      pass: has('The page needs: ["ms"]') && has('Only the tools need: ["vite"]'),
      hint: 'Add a "devDependencies" object with "vite": "^8.2.4" after "dependencies", then log Object.keys of each.'
    }
  ];
}
