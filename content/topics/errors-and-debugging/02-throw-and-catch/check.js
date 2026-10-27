export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const skipped = lines.indexOf("Skipped: Diana has no scores yet");
  const eve = lines.indexOf("Eve: 91.0");
  const trace = lines.find((line) => /\n\s+at |@src\//.test(line));

  return [
    {
      id: "own-message",
      title: "Diana is skipped with the message reportLine throws",
      pass: skipped !== -1,
      hint: lines.includes("Skipped: undefined")
        ? "The catch logs undefined, so the thrown value has no message. Throw new Error(...) rather than a plain string."
        : 'In reportLine, throw new Error(`${student.name} has no scores yet`) when student.scores is undefined, and log "Skipped:" with error.message in the loop\'s catch.'
    },
    {
      id: "report-continues",
      title: "The report goes on to Eve after skipping Diana",
      pass: skipped !== -1 && eve > skipped,
      hint: "Add Eve after Diana in the students array, and put the try and catch inside the for loop of printReport so that one error skips one student."
    },
    {
      id: "no-trace",
      title: "No error reaches the catch at the bottom, and the script reaches its last line",
      pass: trace === undefined && lines.includes("The script reached its last line."),
      hint: trace
        ? `A stack trace was logged, so an error escaped the loop: ${trace.split("\n")[0]}`
        : "Keep the last line, console.log(\"The script reached its last line.\"), at the end of the file."
    }
  ];
}
