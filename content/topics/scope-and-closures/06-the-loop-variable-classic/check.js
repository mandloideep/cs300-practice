const REMINDERS = [
  "Reminder 1 goes to Alice.",
  "Reminder 2 goes to Bob.",
  "Reminder 3 goes to Charlie."
];

export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const reminders = () => lines().filter((line) => line.startsWith("Reminder "));
  for (let i = 0; i < 40 && reminders().length < 3; i++) await wait(50);
  await wait(50);

  const seen = lines();
  const varLines = seen.filter((line) => line.startsWith("var i is "));
  const letLines = seen.filter((line) => line.startsWith("let j is "));
  const reminderLines = reminders();

  return [
    {
      id: "var-prints-three-threes",
      title: "The var loop's three callbacks all print 3",
      pass: varLines.length === 3 && varLines.every((line) => line === "var i is 3"),
      hint: `The var lines read: ${varLines.join(", ") || "none"}. Keep the starter loop with var i and its 50 millisecond timer.`
    },
    {
      id: "let-prints-each",
      title: "The let loop's callbacks print 0, 1, and 2",
      pass: letLines.join(",") === "let j is 0,let j is 1,let j is 2",
      hint: letLines.includes("let j is 3")
        ? "The j lines print 3, so the counter is shared. Declare it as let j = 0 inside the parentheses of the for."
        : "Append a for loop with let j that sets a 100 millisecond timer logging \"let j is\" and j."
    },
    {
      id: "reminders-for-the-roster",
      title: "Each student gets their own reminder",
      pass: reminderLines.join("\n") === REMINDERS.join("\n"),
      hint: reminderLines.some((line) => line.includes("undefined"))
        ? "A reminder names undefined, so the callbacks share one index. Declare it with let index in the for."
        : "Loop with let index over roster.length and log a reminder for roster[index] from a 150 millisecond timer."
    }
  ];
}
