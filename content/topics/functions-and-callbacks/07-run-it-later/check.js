const ORDER = [
  "Study timer set.",
  "Reading the chapter.",
  "Last line of the file.",
  "Zero delay, still after the file.",
  "Break time.",
  "Session over. Good work."
];

export default async function check({ console, wait }) {
  const lines = () => console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const done = () => lines().includes("Break time.") && lines().includes("Session over. Good work.");
  for (let i = 0; i < 40 && !done(); i++) await wait(50);
  await wait(50);

  const seen = lines();
  const at = (text) => seen.indexOf(text);
  const fileLast = at("Last line of the file.");

  return [
    {
      id: "break-after-the-file",
      title: "The 200 millisecond break prints after every line of the file",
      pass: at("Break time.") > fileLast && fileLast > at("Reading the chapter.") && at("Reading the chapter.") > at("Study timer set."),
      hint:
        at("Break time.") < 0
          ? "Break time. never printed. Wrap its console.log in an arrow function and pass it to setTimeout with a delay of 200."
          : "Break time. should come after Last line of the file. Keep its console.log inside the arrow function that setTimeout receives."
    },
    {
      id: "zero-delay-waits",
      title: "The zero delay callback runs after the file and before the break",
      pass: at("Zero delay, still after the file.") > fileLast && at("Zero delay, still after the file.") < at("Break time."),
      hint: "Append a setTimeout with a delay of 0 and then console.log(\"Last line of the file.\"); the timer line should print after it."
    },
    {
      id: "named-callback-later",
      title: "endSession runs last, once, from its own timer",
      pass: seen.join("\n") === ORDER.join("\n"),
      hint: at("Session over. Good work.") >= 0 && at("Session over. Good work.") < at("Zero delay, still after the file.")
        ? "Session over. printed too early, so endSession ran at once. Pass it without parentheses: setTimeout(endSession, 300);"
        : `Declare endSession and pass it to setTimeout with a delay of 300. The console reads: ${seen.join(" | ")}`
    }
  ];
}
