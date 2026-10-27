export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const weeks = lines.filter((line) => /^Week \d$/.test(line));

  return [
    {
      id: "var-leaves-the-block",
      title: "A var declared inside an if is still there after it",
      pass: has("var after the block: Quiz 1"),
      hint: "Declare var lastQuiz = \"Quiz 1\"; inside the if and log it after the closing brace."
    },
    {
      id: "var-is-hoisted",
      title: "A var read before its line is undefined, and CS300 after it",
      pass: has("Before its line: undefined") && has("After its line: CS300"),
      hint: "Log courseCode, then declare var courseCode = \"CS300\";, then log it again."
    },
    {
      id: "loop-counter-leaks",
      title: "The var loop counter is 4 after the loop",
      pass: weeks.join(",") === "Week 1,Week 2,Week 3" && has("week after the loop: 4"),
      hint: `The console has ${weeks.length} Week lines. Loop with for (var week = 1; week <= 3; week++), log each week, and log week after the loop.`
    }
  ];
}
