const cart = [
  { title: "Notebook", price: 4.5, quantity: 2 },
  { title: "Pens", price: 3, quantity: 1 },
  { title: "Calculator", price: 18, quantity: 1 }
];

let total = 0;
cart.forEach((item) => {
  total = total + item.price * item.quantity;
});
console.log("Total with forEach:", total);
