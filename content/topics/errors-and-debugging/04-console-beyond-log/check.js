export default async function check({ console }) {
  const at = (level) => console.filter((entry) => entry.level === level).map((entry) => entry.text);
  const logs = at("log");
  const objectLine = 'First student: {"name":"Alice","score":95}';
  const glued = logs.some((line) => line.includes("[object Object]"));

  return [
    {
      id: "info-line",
      title: "The gradebook loads with an info line",
      pass: at("info").includes("Gradebook loaded: 4 students"),
      hint: 'Replace the first log with console.info("Gradebook loaded:", students.length, "students").'
    },
    {
      id: "object-with-comma",
      title: "The first student prints as an object, not as [object Object]",
      pass: logs.includes(objectLine) && !glued,
      hint: glued
        ? "A line still glues an object to a string with +, which prints [object Object]. Use a comma between the label and the object."
        : 'Log "First student:" and students[0] as two arguments, separated by a comma.'
    },
    {
      id: "warn-and-debug",
      title: "Bob is a warning and Alice and Charlie are debug lines",
      pass:
        at("warn").includes("Bob is failing with 54") &&
        at("debug").includes("Alice is fine with 95") &&
        at("debug").includes("Charlie is fine with 88"),
      hint: "In the loop, call console.warn for a score under 60 and console.debug for the rest, with the messages in the step."
    },
    {
      id: "error-impossible",
      title: "Diana's impossible score is an error, and the loop finishes",
      pass: at("error").includes("Diana has an impossible score: 140") && logs.includes("Checked every student."),
      hint: "Test score > 100 first and call console.error for it, then log \"Checked every student.\" after the loop."
    }
  ];
}
