export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "same-total-three-ways",
      title: "The function expression and both arrow forms return 12",
      pass:
        has("Function expression: 12") &&
        has("Arrow with braces: 12") &&
        has("Arrow without braces: 12"),
      hint: has("Arrow with braces: undefined")
        ? "lineTotalArrow has braces and no return. Keep return item.price * item.quantity; inside the braces."
        : "Write lineTotalArrow as (item) => { return ... } and lineTotalShort as (item) => item.price * item.quantity, and log each for cart[0]."
    },
    {
      id: "braces-need-return",
      title: "An arrow with braces and no return gives undefined",
      pass: has("Braces without return: undefined"),
      hint: "Add forgotReturn with braces around item.price * item.quantity; and no return, and log it for cart[0]."
    },
    {
      id: "map-and-object",
      title: "map collects the line totals and toSummary returns an object",
      pass: has("Line totals: [12,6,24]") && has('Summary: {"title":"USB drive","total":24}'),
      hint: "Log cart.map(lineTotalShort), then return the object from toSummary inside parentheses: (item) => ({ ... })."
    }
  ];
}
