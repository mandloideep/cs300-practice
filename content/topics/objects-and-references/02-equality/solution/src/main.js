const cartA = { item: "Notebook", quantity: 2 };
const cartB = { item: "Notebook", quantity: 2 };

console.log("cartA:", cartA);
console.log("cartB:", cartB);

console.log("Same item?", cartA.item === cartB.item);
console.log("Same quantity?", cartA.quantity === cartB.quantity);

console.log("cartA === cartB:", cartA === cartB);
const cartC = cartA;
console.log("cartA === cartC:", cartA === cartC);

const sameContents = (first, second) =>
  first.item === second.item && first.quantity === second.quantity;
console.log("Same contents?", sameContents(cartA, cartB));

const savedCarts = [cartA];
console.log("includes cartA?", savedCarts.includes(cartA));
console.log("includes cartB?", savedCarts.includes(cartB));
