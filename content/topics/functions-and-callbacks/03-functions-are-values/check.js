export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "function-is-a-value",
      title: "addCurve is logged as a function, not called",
      pass: has("addCurve is a function") && has("The value itself: [Function addCurve]"),
      hint: "Log typeof addCurve and then addCurve itself, with no parentheses after the name."
    },
    {
      id: "second-name",
      title: "The same function is called through a second name and a function expression",
      pass: has("Called through adjust: 75") && has("Capped 104: 100"),
      hint: "Assign const adjust = addCurve; and log adjust(70), then store the cap in const capAt100 = function (score) { ... } and log capAt100(104)."
    },
    {
      id: "rules-in-an-array",
      title: "Both rules from an array turn 98 into 100",
      pass: has("After every rule: 100"),
      hint: has("After every rule: 103")
        ? "Only the curve ran. The array should be [addCurve, capAt100]."
        : "Put [addCurve, capAt100] in an array, with no parentheses, and call each rule on finalScore in a for...of loop."
    }
  ];
}
