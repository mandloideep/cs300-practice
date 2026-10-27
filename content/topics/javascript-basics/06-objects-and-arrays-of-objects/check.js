export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const dashboard = lines.filter((line) => /^[A-Z][a-z]+: \d+ \([A-F]\) (passing|failing)$/.test(line));

  return [
    {
      id: "dot-and-bracket",
      title: "Dot and bracket notation read alice, and a grade is added to her",
      pass: has("Name: Alice") && has("Score by variable: 95") && has('With a grade: {"name":"Alice","score":95,"grade":"A"}'),
      hint: "Log alice.name, alice[field] with field holding \"score\", then assign alice.grade = getGrade(alice.score) and log alice."
    },
    {
      id: "map-keeps-the-original",
      title: "map adds a grade to a new object and leaves the original without one",
      pass: has('First with grade: {"name":"Alice","score":95,"grade":"A"}') && has('First original: {"name":"Alice","score":95}'),
      hint: "Build rosterWithGrades with roster.map, returning a new object with name, score, and grade, then log rosterWithGrades[0] and roster[0]."
    },
    {
      id: "filter-groups",
      title: "filter counts the passing students and names the honor roll",
      pass: has("Passing: 5 of 6") && has('Honor roll: ["Alice","Eve"]'),
      hint: 'Filter rosterWithGrades by grade !== "F" and by score >= 90, then log the count and the mapped names.'
    },
    {
      id: "dashboard-lines",
      title: "forEach prints one dashboard line per student",
      pass: dashboard.length === 6 && has("Alice: 95 (A) passing") && has("Frank: 45 (F) failing"),
      hint: `${dashboard.length} dashboard line(s) found. Log \`\${student.name}: \${student.score} (\${student.grade}) \${status}\` for each student.`
    }
  ];
}
