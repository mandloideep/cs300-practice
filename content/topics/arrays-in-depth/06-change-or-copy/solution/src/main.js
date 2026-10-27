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
classify("sort", (cart) => cart.sort());
classify("toSorted", (cart) => cart.toSorted());
classify("splice", (cart) => cart.splice(0, 1));
classify("slice", (cart) => cart.slice(0, 1));
classify("toSpliced", (cart) => cart.toSpliced(0, 1));
classify("filter", (cart) => cart.filter((item) => item !== "Pens"));
classify("pop", (cart) => cart.pop());
classify("reverse", (cart) => cart.reverse());
classify("toReversed", (cart) => cart.toReversed());
classify("concat", (cart) => cart.concat(["Ruler"]));

console.log("Changes the array:", changesTheArray);
console.log("Returns a new one:", returnsANewOne);

const wouldRerender = (oldState, newState) => !Object.is(oldState, newState);
const items = ["Pens", "Notebook"];
items.push("Ruler");
console.log("push, re-render?", wouldRerender(items, items));
console.log("spread, re-render?", wouldRerender(items, [...items, "Eraser"]));
