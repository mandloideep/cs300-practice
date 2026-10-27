const cart = {
  owner: "Alice",
  items: [
    { title: "Notebook", price: 4.5, quantity: 2 },
    { title: "Pens", price: 3, quantity: 1 }
  ]
};

console.log("cart:", cart);

const text = JSON.stringify(cart);
console.log("As text:", text);
console.log("Type of text:", typeof text);
console.log("text.owner:", text.owner);

const restored = JSON.parse(text);
console.log("Restored owner:", restored.owner);
console.log("Same object?", restored === cart);
restored.items[0].quantity = 5;
console.log("cart quantity:", cart.items[0].quantity);

const order = {
  id: 17,
  placed: new Date("2026-10-27T15:00:00Z"),
  coupon: undefined,
  formatTotal: () => "$12.00"
};
const roundTrip = JSON.parse(JSON.stringify(order));
console.log("Keys before:", Object.keys(order));
console.log("Keys after:", Object.keys(roundTrip));
console.log("placed before:", typeof order.placed, "after:", typeof roundTrip.placed);
console.log("placed after:", roundTrip.placed);
