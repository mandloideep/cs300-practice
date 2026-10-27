export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const errors = console.filter((entry) => entry.level === "error").map((entry) => entry.text);

  return [
    {
      id: "typeof-printed",
      title: "The console shows the type of each variable",
      pass: has("studentName is a string") && has("score is a number"),
      hint: 'Log typeof studentName and typeof score with the labels "studentName is a" and "score is a".'
    },
    {
      id: "score-reassigned",
      title: "score is reassigned to 90 and printed",
      pass: has("Score after the retake: 90") && errors.length === 0,
      hint:
        errors.length > 0
          ? `The console has an error: ${errors[0]}. Only a let variable can be reassigned.`
          : 'Assign score = 90; and log it with the label "Score after the retake:".'
    },
    {
      id: "empty-values",
      title: "A boolean, a null, and an undefined are printed",
      pass: has("isPassing: true boolean") && has("selectedTopic: null") && has("lastResult: undefined"),
      hint: "Declare isPassing from score >= 60, selectedTopic as null, and lastResult with no value, then log each."
    },
    {
      id: "template-literal",
      title: "A template literal prints the sentence",
      pass: has("Alice scored 90."),
      hint: "Log `${studentName} scored ${score}.` in backticks as the last line."
    }
  ];
}
