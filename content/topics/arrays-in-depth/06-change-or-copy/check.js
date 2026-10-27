export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "changes-group",
      title: "push, sort, splice, pop, and reverse change the array",
      pass: has('Changes the array: ["push","sort","splice","pop","reverse"]'),
      hint: "Add a classify line for sort, toSorted, splice, slice, toSpliced, and filter after the map line, then pop, reverse, toReversed, and concat after the filter line."
    },
    {
      id: "copies-group",
      title: "map, toSorted, slice, toSpliced, filter, toReversed, and concat return a new array",
      pass: has('Returns a new one: ["map","toSorted","slice","toSpliced","filter","toReversed","concat"]'),
      hint: "Each classify callback should call its method on cart, the parameter, in the order the step lists them."
    },
    {
      id: "react-needs-a-copy",
      title: "Only the spread gives React a different array to notice",
      pass: has("push, re-render? false") && has("spread, re-render? true"),
      hint: "Compare items with itself after push, and items with [...items, \"Eraser\"], using wouldRerender."
    }
  ];
}
