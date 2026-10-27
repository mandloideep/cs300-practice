export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const asked = lines.filter((line) => line.startsWith("countWhere asked about "));
  const askedInOrder = asked.join(",") === [92, 78, 55, 88, 61].map((score) => `countWhere asked about ${score}`).join(",");

  return [
    {
      id: "passing-and-honors",
      title: "countWhere counts with isPassing and with isHonors",
      pass: has("Passing: 4") && has("Honors: 1"),
      hint: "Pass isPassing and isHonors to countWhere without parentheses, and call test(item) inside its loop."
    },
    {
      id: "inline-callback-called-per-score",
      title: "countWhere calls the inline callback once per score, then returns 3",
      pass: askedInOrder && has("Below 80: 3") && lines.indexOf("Below 80: 3") > lines.indexOf(asked[asked.length - 1]),
      hint: `The console has ${asked.length} countWhere asked about lines. Pass an arrow function that logs the score and returns score < 80, then log the count as Below 80:.`
    },
    {
      id: "filter-agrees",
      title: "filter with the same callback agrees with countWhere",
      pass: has("Passing with filter: 4"),
      hint: "Log scores.filter(isPassing).length with the label Passing with filter:."
    }
  ];
}
