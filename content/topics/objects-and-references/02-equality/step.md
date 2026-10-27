---
title: Two objects that look equal
mode: edit
entry: index.html
required: [primitives-compare-by-value, objects-compare-by-reference, contents-compared-by-hand, includes-uses-the-reference]
---

This step compares two carts that hold exactly the same thing and asks JavaScript whether they are equal.
The answer depends on whether you compare the values inside or the objects themselves, and `===` only ever does one of those for an object.
Watch for the line that says `false` when everything on the screen says it should be `true`.

Press **Run**.
The console shows `cartA` and `cartB` as the same text, `{"item":"Notebook","quantity":2}`, because they were written with the same keys and values.

Compare what is inside first.

```js file="src/main.js" action="append"

console.log("Same item?", cartA.item === cartB.item);
console.log("Same quantity?", cartA.quantity === cartB.quantity);
```

Run the code.
Both lines show `true`.
`cartA.item` and `cartB.item` are strings and the quantities are numbers, all primitive values, so `===` compares the values themselves: same type, same value, `true`.
That is the `===` you met in JavaScript basics, where `5 === "5"` was `false` because the types differ.

Now compare the carts.
Predict before you run: does the console show `cartA === cartB: true`, `cartA === cartB: false`, or an error?

```js file="src/main.js" action="append"

console.log("cartA === cartB:", cartA === cartB);
const cartC = cartA;
console.log("cartA === cartC:", cartA === cartC);
```

Run the code.
`cartA === cartB` is `false`, and `cartA === cartC` is `true`.
For two objects, `===` does not look inside at all; it asks whether both sides are arrows to the **same object**.
`cartA` and `cartB` were made by two separate pairs of braces, so they are two objects that happen to hold the same things, and `cartC` is a second arrow to the object `cartA` points to, as in Step 1.
`==` gives the same answers here, because it too compares objects by reference.

When you want to know whether two objects hold the same things, compare the parts you care about yourself.

```js file="src/main.js" action="append"

const sameContents = (first, second) =>
  first.item === second.item && first.quantity === second.quantity;
console.log("Same contents?", sameContents(cartA, cartB));
```

`sameContents` compares the two properties one at a time, each with `===` on a primitive, and joins them with `&&`, so it is `true` only when both match.
It prints `true` for `cartA` and `cartB`, the answer most people expected from `===`.

The same rule hides inside array methods.
`includes` checks each element with what is, for objects, the same comparison as `===`.

```js file="src/main.js" action="append"

const savedCarts = [cartA];
console.log("includes cartA?", savedCarts.includes(cartA));
console.log("includes cartB?", savedCarts.includes(cartB));
```

`savedCarts` holds an arrow to `cartA`, so `includes(cartA)` finds it and `includes(cartB)` does not, even though the console prints `cartB` exactly like the cart in the array.
To find an object by its contents, you need a method that takes a callback, such as `find` or `some`, and the next topic, Arrays in depth, starts with those two.

Arrays follow the same rule, since they are objects: `[1, 2] === [1, 2]` is `false`.
Try it: add `console.log("Two arrays:", [1, 2] === [1, 2]);`, run, see `false`, and delete the line.
A shortcut you will see online is to compare `JSON.stringify(cartA) === JSON.stringify(cartB)`; it works for small plain objects, but two objects with the same keys in a different order give different text, so write the comparison yourself when it matters.

React asks this question every time state changes.
It compares the old state and the new state with a comparison very close to `===`, so a new object with the same contents counts as a change, and the same object changed in place counts as no change at all.

**If it breaks:** If `Same contents?` shows `false`, one of the two comparisons inside `sameContents` compares `first` with `first`, or uses a property name that is misspelled and therefore `undefined` on one side only.
If the console shows a `ReferenceError` that names `cartC`, the `const cartC = cartA;` line is missing or comes after the line that logs it.
If `includes cartB?` shows `true`, the line passes `cartA` twice.

**Check:** Run the code.
The console shows `true` for the item and the quantity, `cartA === cartB: false`, `cartA === cartC: true`, `Same contents? true`, `includes cartA? true`, and `includes cartB? false`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
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
```

</details>
