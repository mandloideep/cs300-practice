const cart = [
  { title: "Notebook", price: 4, quantity: 3 },
  { title: "Graph paper", price: 6, quantity: 1 },
  { title: "USB drive", price: 12, quantity: 2 }
];

const lineTotal = function (item) {
  return item.price * item.quantity;
};

console.log("Function expression:", lineTotal(cart[0]));

const lineTotalArrow = (item) => {
  return item.price * item.quantity;
};
console.log("Arrow with braces:", lineTotalArrow(cart[0]));

const lineTotalShort = (item) => item.price * item.quantity;
console.log("Arrow without braces:", lineTotalShort(cart[0]));

const forgotReturn = (item) => {
  item.price * item.quantity;
};
console.log("Braces without return:", forgotReturn(cart[0]));

console.log("Line totals:", cart.map(lineTotalShort));

const toSummary = (item) => ({ title: item.title, total: lineTotalShort(item) });
console.log("Summary:", toSummary(cart[2]));
