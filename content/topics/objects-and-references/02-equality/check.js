export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "primitives-compare-by-value",
      title: "=== on the strings and numbers inside the carts is true",
      pass: has("Same item? true") && has("Same quantity? true"),
      hint: "Log cartA.item === cartB.item and cartA.quantity === cartB.quantity with the labels \"Same item?\" and \"Same quantity?\"."
    },
    {
      id: "objects-compare-by-reference",
      title: "=== on two separate carts is false and on the same cart is true",
      pass: has("cartA === cartB: false") && has("cartA === cartC: true"),
      hint: "Log cartA === cartB, then make const cartC = cartA and log cartA === cartC."
    },
    {
      id: "contents-compared-by-hand",
      title: "sameContents compares the two carts property by property",
      pass: has("Same contents? true"),
      hint: "sameContents should return first.item === second.item && first.quantity === second.quantity, and the log calls it with cartA and cartB."
    },
    {
      id: "includes-uses-the-reference",
      title: "includes finds cartA in the array and not the look-alike cartB",
      pass: has("includes cartA? true") && has("includes cartB? false"),
      hint: "Put only cartA in savedCarts, then log savedCarts.includes(cartA) and savedCarts.includes(cartB)."
    }
  ];
}
