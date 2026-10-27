export default async function check({ console }) {
  const at = (level) => console.filter((entry) => entry.level === level).map((entry) => entry.text);
  const logs = at("log");
  const warnings = at("warn");
  const diana = logs.find((line) => line.startsWith("Diana"));
  const frank = [...logs, ...warnings].find((line) => line.startsWith("Frank"));

  return [
    {
      id: "numbers-from-strings",
      title: "Bob's string scores are averaged as numbers",
      pass: logs.includes("Alice: 91.7") && logs.includes("Bob: 74.0"),
      hint: logs.includes("Bob: 246023.0")
        ? "Bob's scores are joined as strings. Add Number(score) to the total instead of score."
        : "Alice should print 91.7 and Bob 74.0; convert each score with Number(score) before adding it."
    },
    {
      id: "empty-is-not-zero",
      title: "Diana's empty list prints no scores yet, not a number",
      pass: diana === "Diana: no scores yet",
      hint: diana
        ? `Diana's line reads "${diana}". Return null from average for an empty list, and log "no scores yet" when the value is null.`
        : "Diana has no line. If the console pane shows a red line about toFixed, check value === null before formatting it."
    },
    {
      id: "wrong-type-is-loud",
      title: "Frank's pasted string is skipped with a warning that names the problem",
      pass: warnings.includes("Frank skipped: expected an array of scores, got string"),
      hint: frank
        ? `Frank's line reads "${frank}". Throw a TypeError when Array.isArray(scores) is false, and console.warn the message in the loop's catch.`
        : "Frank has no line. Wrap the call to average in try, and console.warn(student.name, \"skipped:\", error.message) in the catch."
    }
  ];
}
