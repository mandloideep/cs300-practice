const cart = {
  owner: "Alice",
  items: [
    { title: "Notebook", price: 4.5, quantity: 2 },
    { title: "Pens", price: 3, quantity: 1 }
  ],
  describe() {
    return `${this.owner} has ${this.items.length} items in the cart`;
  }
};

console.log("Items in the cart:", cart.items.length);

console.log(cart.describe());

const bobsCart = { owner: "Bob", items: [], describe: cart.describe };
console.log(bobsCart.describe());

const describeLater = () => cart.describe();
console.log("Later:", describeLater());
