export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "percent-returned",
      title: "toPercent returns the quiz percentage",
      pass: has("Quiz percent: 90"),
      hint: has("Quiz percent: undefined")
        ? "quizPercent is undefined, so toPercent has no return. Its body should be return (points * 100) / outOf;"
        : "Store toPercent(quizPoints, quizOutOf) in quizPercent and log it with the label Quiz percent:."
    },
    {
      id: "lab-percent",
      title: "A second call with other arguments returns 84",
      pass: has("Lab percent: 84"),
      hint: "Log toPercent(42, 50) with the label Lab percent:, points first and the total second."
    },
    {
      id: "log-is-not-return",
      title: "logPercent prints 90 and returns undefined",
      pass: has("90") && has("logPercent returned: undefined"),
      hint: "Declare logPercent with console.log in its body and no return, call it with 9 and 10, and log what it returned."
    }
  ];
}
