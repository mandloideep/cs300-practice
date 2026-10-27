export default async function check({ console, wait }) {
  const at = (level) => console.filter((entry) => entry.level === level).map((entry) => entry.text);
  for (let i = 0; i < 60 && !at("log").includes("Order 102 done"); i++) await wait(50);

  const logs = at("log");
  const warnings = at("warn");
  const prepared = logs.indexOf("Order 101 prepared");
  const shipped = logs.indexOf("Order 101 shipped");
  const problem = warnings.find((line) => line.startsWith("Problem:"));

  return [
    {
      id: "chain-ships",
      title: "Order 101 is prepared and then shipped",
      pass: prepared !== -1 && shipped > prepared,
      hint:
        prepared === -1
          ? "Order 101 was not prepared; track(first) should still be called."
          : "Return ship(prepared) from the first then, and log the shipped order in a second then."
    },
    {
      id: "catch-handles-the-rejection",
      title: "Order 102's rejection is caught and reported as a warning",
      pass: problem === "Problem: Order 102 has no address" && !logs.includes("Order 102 shipped"),
      hint: problem
        ? `The warning reads "${problem}". The first then should return ship(prepared), so that ship's rejection reaches the catch.`
        : 'Call track(second), and end the chain with .catch((error) => { console.warn("Problem:", error.message); }).'
    },
    {
      id: "finally-runs-for-both",
      title: "finally prints a done line for both orders",
      pass: logs.includes("Order 101 done") && logs.includes("Order 102 done"),
      hint: 'Add .finally after the catch, logging "Order", order.id, "done"; it runs for the shipped order and the failed one.'
    }
  ];
}
