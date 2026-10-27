const changesTheArray = [];
const returnsANewOne = [];

const classify = (name, use) => {
  const cart = ["Pens", "Notebook", "Backpack"];
  const before = cart.join(",");
  use(cart);
  if (cart.join(",") === before) {
    returnsANewOne.push(name);
  } else {
    changesTheArray.push(name);
  }
};

classify("push", (cart) => cart.push("Ruler"));
classify("map", (cart) => cart.map((item) => item.toUpperCase()));

console.log("Changes the array:", changesTheArray);
console.log("Returns a new one:", returnsANewOne);
