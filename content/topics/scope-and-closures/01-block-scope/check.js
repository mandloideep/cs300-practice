export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "inside-the-block",
      title: "The if block prints the message",
      pass: has("Inside the if: Above the B line."),
      hint: "Keep the console.log inside the braces of the if, after the line that sets message."
    },
    {
      id: "outer-variable-updated",
      title: "The line after the if reads the outer message that the block changed",
      pass: has("Outside the if: Above the B line."),
      hint: has("Outside the if: Below the B line.")
        ? "The block still declares its own message. Remove const from the line inside the if."
        : "Declare let message = \"Below the B line.\"; above the if, assign it inside without const, and log it after the closing brace."
    },
    {
      id: "last-student",
      title: "A variable declared before the loop keeps the last student",
      pass: has("Last student: Charlie"),
      hint: "Declare let lastStudent before the for...of loop, assign each student to it inside, and log it after the loop."
    }
  ];
}
