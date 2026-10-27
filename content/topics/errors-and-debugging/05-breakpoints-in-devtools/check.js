export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const nan = lines.filter((line) => line.includes("NaN"));

  return [
    {
      id: "alice-average",
      title: "Alice's average prints as 91.7",
      pass: has("Alice: 91.7"),
      hint: "Alice's three scores add up to 275, and 275 / 3 is 91.7. If it prints NaN, the loop reads one index past the end."
    },
    {
      id: "bob-average",
      title: "Bob's average prints as 74.0",
      pass: has("Bob: 74.0"),
      hint: "Bob's three scores add up to 222, and 222 / 3 is 74.0. Both students go through the same average function."
    },
    {
      id: "no-nan",
      title: "No line prints NaN",
      pass: nan.length === 0 && lines.length > 0,
      hint:
        nan.length > 0
          ? `${nan.length} line(s) print NaN. The loop test should be i < scores.length, so that i stops at the last index.`
          : "Nothing printed yet; run the code."
    }
  ];
}
