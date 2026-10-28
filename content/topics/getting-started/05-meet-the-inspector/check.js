function countIn(tally) {
  const match = /Count: (\d+)/.exec(tally?.textContent ?? "");
  return match ? Number(match[1]) : null;
}

export default async function check({ document, inspector, wait }) {
  const tallies = inspector.components.filter((component) => component.name === "Tally");
  const labels = tallies.map((tally) => tally.props?.label);
  const [runs, checks] = document.querySelectorAll("main .counter");
  const before = [countIn(runs), countIn(checks)];
  checks?.querySelector("button")?.click();
  await wait(50);
  const after = [countIn(runs), countIn(checks)];

  return [
    {
      id: "two-tallies",
      title: "The inspector sees two Tally components, Runs and Checks",
      pass: tallies.length === 2 && labels[0] === "Runs" && labels[1] === "Checks",
      hint: `The inspector sees ${tallies.length} Tally component(s). Add <Tally label="Checks" /> on the line after the Runs tally.`
    },
    {
      id: "each-has-state",
      title: "Each tally keeps one state value, a number",
      pass:
        tallies.length === 2 &&
        tallies.every((tally) => tally.state.length === 1 && typeof tally.state[0].value === "number"),
      hint: "Each Tally should keep its count with useState(0); the starter already does, so press Reset to starter if the Tally function changed."
    },
    {
      id: "click-changes-one",
      title: "A click on Checks raises only its own count",
      pass: before[1] !== null && after[1] === before[1] + 1 && after[0] === before[0],
      hint:
        before[1] === null
          ? "There is no second tally on the page to click."
          : `Checks went from ${before[1]} to ${after[1]} and Runs from ${before[0]} to ${after[0]}. Each tally should change only when its own button is pressed.`
    }
  ];
}
