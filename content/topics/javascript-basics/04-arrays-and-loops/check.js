export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const numbered = lines.filter((line) => /^\d+\. /.test(line));
  const greetings = ["Alice", "Bob", "Charlie", "Diana"].filter((name) => has(`Hello, ${name}!`));

  return [
    {
      id: "index-and-length",
      title: "The last item is at length - 1 and the index past the end is undefined",
      pass: has("Last: Diana") && has("Past the end: undefined"),
      hint: "Log names[names.length - 1] and names[names.length] with the labels Last: and Past the end:."
    },
    {
      id: "loop-stops-at-the-end",
      title: "The numbered loop prints four lines and no undefined",
      pass: numbered.length === 4 && has("1. Alice") && has("4. Diana") && !has("5. undefined"),
      hint:
        numbered.length > 4
          ? "The loop prints one line too many: its condition should be i < names.length, not <=."
          : `The numbered list has ${numbered.length} line(s); it should print 1. Alice through 4. Diana.`
    },
    {
      id: "for-of-greets",
      title: "A for...of loop greets every name",
      pass: greetings.length === 4,
      hint: "Loop with for (const name of names) and log `Hello, ${name}!` for each."
    },
    {
      id: "push-and-includes",
      title: "push adds Eve and includes finds her",
      pass: has("Count now: 5") && has("Has Eve: true"),
      hint: 'Call names.push("Eve"), then log names.length and names.includes("Eve").'
    }
  ];
}
