const products = [
  { id: 1, title: "Notebook", price: 4.5, inStock: true },
  { id: 2, title: "Backpack", price: 39.99, inStock: false },
  { id: 3, title: "Pens", price: 3, inStock: true },
  { id: 4, title: "Calculator", price: 18, inStock: true }
];

console.log("Products:", products.length);

const pens = products.find((product) => product.title === "Pens");
console.log("Found:", pens);

const stapler = products.find((product) => product.title === "Stapler");
console.log("Stapler:", stapler);
console.log("filter instead:", products.filter((product) => product.title === "Stapler"));
console.log("Stapler price:", stapler?.price ?? "not sold here");

const anyOutOfStock = products.some((product) => !product.inStock);
const allUnderFifty = products.every((product) => product.price < 50);
console.log("Any out of stock?", anyOutOfStock);
console.log("All under $50?", allUnderFifty);

const emptyCart = [];
console.log("Empty every:", emptyCart.every((item) => item.price > 100));
console.log("Empty some:", emptyCart.some((item) => item.price > 100));
