export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "number-is-copied",
      title: "Changing the copied number leaves the original score alone",
      pass: has("curvedScore: 90") && has("score after the curve: 85"),
      hint: "Copy score into let curvedScore, add 5 to curvedScore, and log both with the labels \"curvedScore:\" and \"score after the curve:\"."
    },
    {
      id: "object-is-shared",
      title: "Changing the object through the second variable changes student too",
      pass:
        has('sameStudent: {"name":"Alice","score":90}') &&
        has('student after the change: {"name":"Alice","score":90}') &&
        has("Same object? true"),
      hint: "Assign student to sameStudent, set sameStudent.score = 90, then log sameStudent, student, and sameStudent === student."
    },
    {
      id: "function-changes-the-original",
      title: "A function that changes its parameter changes the caller's object",
      pass: has('student after addBonus: {"name":"Alice","score":95}'),
      hint: "addBonus should add 5 to record.score, and the file should call addBonus(student) before logging student."
    }
  ];
}
