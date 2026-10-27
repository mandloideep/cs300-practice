export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "counts-packages",
      title: "The lockfile records 41 packages for the 2 that were asked for",
      pass: has('package.json asks for: ["ms","vite"]') && has("The lockfile records 41 packages"),
      hint: 'Filter out the "" key of lock.packages, which is the project itself, and log the length of what is left.'
    },
    {
      id: "range-and-version",
      title: "The range in package.json and the exact version in the lockfile are printed",
      pass:
        has("vite: package.json allows ^8.2.4 and npm chose 8.3.5") &&
        has('vite brings along: ["lightningcss","picomatch","postcss","rolldown","tinyglobby"]'),
      hint: 'Read lock.packages["node_modules/vite"], then log its version beside project.devDependencies.vite, and Object.keys of its dependencies.'
    },
    {
      id: "optional-packages",
      title: "The packages for other systems are counted apart",
      pass: has("Installed on every computer: 14") && has("Installed only on matching systems: 27"),
      hint: "Keep the paths whose entry has no optional: true, and subtract their count from the total for the rest."
    }
  ];
}
