const products = [
  { title: "Notebook", category: "paper", price: 4.5, inStock: true },
  { title: "Backpack", category: "bags", price: 39.99, inStock: true },
  { title: "Pens", category: "writing", price: 3, inStock: true },
  { title: "Calculator", category: "tech", price: 18, inStock: false },
  { title: "Highlighters", category: "writing", price: 6.25, inStock: true },
  { title: "Planner", category: "paper", price: 12, inStock: true }
];

console.log("Products:", products.length);

const affordable = products
  .filter((product) => product.inStock)
  .filter((product) => product.price < 20);
console.log("Affordable:", affordable.length);

const labels = affordable
  .toSorted((a, b) => a.price - b.price)
  .map((product) => `${product.title} $${product.price.toFixed(2)}`);
console.log("Labels:", labels);

const writingTotal = products
  .filter((product) => product.category === "writing" && product.inStock)
  .reduce((sum, product) => sum + product.price, 0);
console.log("Writing supplies total:", writingTotal);

const mapFirst = products
  .map((product) => product.title)
  .filter((title) => title.inStock);
console.log("map first:", mapFirst);
