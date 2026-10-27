export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const trace = lines.find((line) => /average[\s\S]*reportLine[\s\S]*printReport/.test(line));
  const errorOnly = lines.find((line) => /^TypeError: /.test(line) && !line.includes("\n"));

  return [
    {
      id: "three-lines-before",
      title: "Alice, Bob, and Charlie are reported before the error",
      pass: has("Alice: 91.7") && has("Bob: 74.0") && has("Charlie: 86.0"),
      hint: "The three original students should still print; check that the students array keeps their scores and that printReport(students) is called inside the try."
    },
    {
      id: "stack-logged",
      title: "The caught error's stack names average, reportLine, and printReport",
      pass: trace !== undefined && /src\/main\.js:\d+/.test(trace),
      hint: errorOnly
        ? "The catch block logs the error itself, which prints only its type and message. Log error.stack instead."
        : 'Add { name: "Diana" } to the students array, wrap printReport(students) in try, and log error.stack in the catch block.'
    },
    {
      id: "last-line",
      title: "The script reaches its last line",
      pass: has("The script reached its last line."),
      hint: "Append console.log(\"The script reached its last line.\"); after the try and catch; it prints only when no error escapes."
    }
  ];
}
