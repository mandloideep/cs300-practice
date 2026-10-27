const cart = [
  { title: "Notebook", price: 4, quantity: 3 },
  { title: "Graph paper", price: 6, quantity: 1 },
  { title: "USB drive", price: 12, quantity: 2 }
];

const lineTotal = function (item) {
  return item.price * item.quantity;
};

console.log("Function expression:", lineTotal(cart[0]));
