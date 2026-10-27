export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const scoreLines = lines.filter((line) => /^Score \d: \d+$/.test(line));

  return [
    {
      id: "map-with-a-named-callback",
      title: "map with the named callback doubles every score",
      pass: has("Doubled: [170,184,146,192,162]"),
      hint: "Declare const double = (score) => score * 2; and log scores.map(double) with the label Doubled:."
    },
    {
      id: "filter-leaves-the-original",
      title: "filter keeps the passing scores and the original array is unchanged",
      pass: has("Passing: [85,92,96,81]") && has("Original: [85,92,73,96,81]"),
      hint: "Log scores.filter((score) => score >= 80) as Passing: and then scores itself as Original:."
    },
    {
      id: "for-each-prints-each",
      title: "forEach prints one numbered line per score",
      pass: scoreLines.length === 5 && has("Score 1: 85") && has("Score 5: 81"),
      hint: "Call scores.forEach((score, index) => ...) and log `Score ${index + 1}: ${score}`."
    },
    {
      id: "chained-labels",
      title: "The filter and map chain builds the four labels",
      pass: has('Passing labels: ["85 pass","92 pass","96 pass","81 pass"]'),
      hint: "Chain .filter((score) => score >= 80) and .map((score) => `${score} pass`) and log the result as Passing labels:."
    }
  ];
}
