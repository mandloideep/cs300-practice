export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const trace = lines.filter((line) => line.startsWith("sum is "));

  return [
    {
      id: "reduce-totals-the-cart",
      title: "reduce gives the same total as the forEach loop",
      pass: has("Total with forEach: 30") && has("Total with reduce: 30"),
      hint: "Use cart.reduce((sum, item) => sum + item.price * item.quantity, 0), with the 0 as the second argument."
    },
    {
      id: "reduce-trace",
      title: "The trace shows the running total before each item",
      pass:
        trace.length === 3 &&
        has("sum is 0, adding Notebook") &&
        has("sum is 9, adding Pens") &&
        has("sum is 12, adding Calculator"),
      hint: `${trace.length} trace line(s) found. Log \`sum is \${sum}, adding \${item.title}\` inside a braced callback that returns the new sum, with 0 as the starting value.`
    },
    {
      id: "reduce-counts-items",
      title: "A second reduce adds up the quantities",
      pass: has("Items in the cart: 4"),
      hint: "Reduce the cart with (count, item) => count + item.quantity and a starting value of 0."
    },
    {
      id: "reduce-builds-an-object",
      title: "reduce tallies the grades into an object",
      pass: has('Grade counts: {"A":3,"B":2,"C":1}'),
      hint: "Start from {} and, for each grade, set tally[grade] = (tally[grade] ?? 0) + 1, then return tally."
    }
  ];
}
