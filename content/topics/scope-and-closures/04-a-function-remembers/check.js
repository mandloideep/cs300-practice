export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "remembers-the-line",
      title: "The returned function still knows its line after makeAtLeast returned",
      pass: has("atLeast80 holds [Function check]") && has("Is 85 at least 80? true"),
      hint: has("atLeast80 holds [Function check]")
        ? "atLeast80 is a function. Log atLeast80(85) with the label Is 85 at least 80?."
        : "makeAtLeast should return check itself, with no parentheses, so that atLeast80 holds a function."
    },
    {
      id: "two-checkers",
      title: "Two checkers from one factory keep two different lines",
      pass: has("At least 80: [92,88]") && has("At least 60: [92,78,88,61]"),
      hint: "Make atLeast60 with makeAtLeast(60) and log scores.filter(atLeast80) and scores.filter(atLeast60)."
    },
    {
      id: "reads-the-current-value",
      title: "withCurve reads curve when it runs, not when it was made",
      pass: has("78 with the curve: 83"),
      hint: has("78 with the curve: 78")
        ? "The curve was still 0 when withCurve ran. Assign curve = 5; before the console.log line."
        : "Declare let curve = 0;, then withCurve, then curve = 5;, and log withCurve(78)."
    }
  ];
}
