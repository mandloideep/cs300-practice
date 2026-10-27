const DIVIDER = "----------";

export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const dividers = lines.filter((line) => line === DIVIDER).length;
  const expected = ["CS300 gradebook", DIVIDER, "Alice: 92", "Bob: 78", DIVIDER];

  return [
    {
      id: "divider-printed-twice",
      title: "The divider is printed twice",
      pass: dividers === 2,
      hint:
        dividers === 0
          ? "No line of dashes was printed. Declare function printDivider() and call it with printDivider(); in two places."
          : `The dashes were printed ${dividers} times. Call printDivider() once under the title and once after Bob.`
    },
    {
      id: "lines-in-order",
      title: "The dividers sit under the title and after the last student",
      pass: lines.join("\n") === expected.join("\n"),
      hint: "The console should read the title, the dashes, Alice, Bob, and the dashes, in that order."
    }
  ];
}
