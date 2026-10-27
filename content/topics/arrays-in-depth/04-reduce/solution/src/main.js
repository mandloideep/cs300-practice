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

const reducedTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
console.log("Total with reduce:", reducedTotal);

cart.reduce((sum, item) => {
  console.log(`sum is ${sum}, adding ${item.title}`);
  return sum + item.price * item.quantity;
}, 0);

const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
console.log("Items in the cart:", itemCount);

const grades = ["A", "B", "A", "C", "B", "A"];
const gradeCounts = grades.reduce((tally, grade) => {
  tally[grade] = (tally[grade] ?? 0) + 1;
  return tally;
}, {});
console.log("Grade counts:", gradeCounts);
