export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "filters-chain",
      title: "Two chained filters keep the four in-stock products under $20",
      pass: has("Affordable: 4"),
      hint: "Chain .filter((product) => product.inStock) and .filter((product) => product.price < 20), then log the length."
    },
    {
      id: "sort-and-label",
      title: "toSorted and map turn the affordable products into labels, cheapest first",
      pass: has('Labels: ["Pens $3.00","Notebook $4.50","Highlighters $6.25","Planner $12.00"]'),
      hint: "Chain .toSorted((a, b) => a.price - b.price) and a map that returns `${product.title} $${product.price.toFixed(2)}`."
    },
    {
      id: "chain-ends-in-reduce",
      title: "A filter and a reduce total the in-stock writing supplies",
      pass: has("Writing supplies total: 9.25"),
      hint: "Filter by category === \"writing\" && inStock, then reduce with (sum, product) => sum + product.price and a starting value of 0."
    },
    {
      id: "order-matters",
      title: "map before filter leaves strings that have no inStock, so nothing passes",
      pass: has("map first: []"),
      hint: "Map the products to their titles first, then filter with (title) => title.inStock, and log the result as \"map first:\"."
    }
  ];
}
