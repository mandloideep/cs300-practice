export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "default-sort-compares-text",
      title: "sort with no compare function puts 10 before 9",
      pass: has("[10, 9, 1].sort(): [1,10,9]"),
      hint: "Log [10, 9, 1].sort() with the label \"[10, 9, 1].sort():\" and no compare function."
    },
    {
      id: "compare-function-sorts-numbers",
      title: "A compare function sorts the scores from low to high",
      pass: has("Low to high: [9,72,88,95,100]"),
      hint: "Sort with scores.sort((a, b) => a - b) and log the result as \"Low to high:\"."
    },
    {
      id: "sort-changes-the-array",
      title: "sort changed scores itself and returned the same array",
      pass: has("scores now: [9,72,88,95,100]") && has("Same array? true"),
      hint: "After sorting, log scores and lowToHigh === scores."
    },
    {
      id: "to-sorted-copies",
      title: "toSorted returns a new order and leaves the roster alone",
      pass: has('By score: ["Alice","Bob","Diana"]') && has('roster still: ["Diana","Alice","Bob"]'),
      hint: "Use roster.toSorted((a, b) => b.score - a.score), then log the names of byScore and of roster with map."
    }
  ];
}
