const STRETCH = "Time to stretch.";

export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const before = lines.indexOf("Before runTwice.");
  const after = lines.indexOf("After runTwice.");
  const between = before >= 0 && after > before ? lines.slice(before + 1, after) : [];
  const stretchesBetween = between.filter((line) => line === STRETCH).length;
  const water = lines.filter((line) => line === "Reminder: Drink some water.").length;

  return [
    {
      id: "passes-the-function",
      title: "runTwice receives the function and calls it twice",
      pass: after > before && stretchesBetween === 2,
      hint:
        after < 0
          ? "After runTwice. never printed, so the file stopped at an error. Pass remindToStretch to runTwice without parentheses."
          : `Time to stretch. printed ${stretchesBetween} times between the Before and After lines. The call should read runTwice(remindToStretch);`
    },
    {
      id: "reference-and-result",
      title: "One variable holds the function and the other holds what it returned",
      pass: has("reminder holds: [Function remindToStretch]") && has("result holds: undefined"),
      hint: "Assign const reminder = remindToStretch; and const result = remindToStretch(); and log both with the labels reminder holds: and result holds:."
    },
    {
      id: "wrapped-with-an-argument",
      title: "A wrapper passes an argument and the reminder prints twice",
      pass: water === 2,
      hint:
        water === 1
          ? "The water reminder printed once, so remind ran at once. Wrap the call: runTwice(() => remind(\"Drink some water.\"));"
          : "Declare remind(message) and call runTwice(() => remind(\"Drink some water.\")); as the last line."
    }
  ];
}
