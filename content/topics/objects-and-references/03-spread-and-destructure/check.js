export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "spread-makes-a-new-object",
      title: "Spread builds a curved copy and leaves student at 85",
      pass:
        has('curved: {"name":"Alice","score":90,"major":"Computer Science"}') &&
        has('student after spread: {"name":"Alice","score":85,"major":"Computer Science"}') &&
        has("Same object? false"),
      hint: "Build curved as { ...student, score: student.score + 5 }, with the spread first, then log curved, student, and curved === student."
    },
    {
      id: "array-spread-adds",
      title: "Array spread adds 96 to a new array and keeps scores at three",
      pass: has("moreScores: [85,92,73,96]") && has("scores after spread: [85,92,73]"),
      hint: "Build moreScores as [...scores, 96] rather than calling scores.push, and log both arrays."
    },
    {
      id: "destructure-pulls-names",
      title: "Destructuring pulls name, major, and the first two scores out",
      pass: has("Alice studies Computer Science") && has("first two scores: 85 92"),
      hint: "Write const { name, major } = student; and const [firstScore, secondScore] = scores; then log them."
    },
    {
      id: "spread-is-one-level",
      title: "The nested advisor is shared after one spread and copied after two",
      pass:
        has('advisee: {"name":"Bob","advisor":{"name":"Lee","office":"Room 310"}}') &&
        has("Same advisor? true") &&
        has("moved: Room 118 advisee: Room 310"),
      hint: "Change copy.advisor.office after a single spread, then build moved with a second spread inside: advisor: { ...advisee.advisor, office: \"Room 118\" }."
    }
  ];
}
