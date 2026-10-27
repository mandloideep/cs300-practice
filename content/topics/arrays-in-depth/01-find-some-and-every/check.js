export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "find-returns-one",
      title: "find returns the pens object itself",
      pass: has('Found: {"id":3,"title":"Pens","price":3,"inStock":true}'),
      hint: "Log products.find((product) => product.title === \"Pens\") with the label \"Found:\"; the callback needs no braces."
    },
    {
      id: "find-misses-with-undefined",
      title: "find gives undefined for a missing product, and ?? supplies the fallback",
      pass:
        has("Stapler: undefined") &&
        has("filter instead: []") &&
        has("Stapler price: not sold here"),
      hint: "Find the \"Stapler\", log it, log the same filter, then log stapler?.price ?? \"not sold here\"."
    },
    {
      id: "some-and-every",
      title: "some finds the out-of-stock backpack and every confirms the prices",
      pass: has("Any out of stock? true") && has("All under $50? true"),
      hint: "Use products.some((product) => !product.inStock) and products.every((product) => product.price < 50)."
    },
    {
      id: "empty-array-edge",
      title: "every is true and some is false on an empty array",
      pass: has("Empty every: true") && has("Empty some: false"),
      hint: "Call every and some on const emptyCart = [] and log both results."
    }
  ];
}
