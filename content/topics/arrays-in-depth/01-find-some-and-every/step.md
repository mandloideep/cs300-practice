---
title: find, some, and every
mode: edit
entry: index.html
required: [find-returns-one, find-misses-with-undefined, some-and-every, empty-array-edge]
---

`filter` answers "which items pass?" with a new array.
Three more methods answer smaller questions with a callback of the same shape: `find` returns the first item that passes, `some` asks whether at least one passes, and `every` asks whether all of them do.
Watch what each returns, because none of them returns an array, and one of them gives a surprising answer for an empty list.

**We used this in:** [JavaScript basics](#/topic/javascript-basics), where `filter` took a callback that returned `true` or `false`, and [Objects and references](#/topic/objects-and-references), where `includes` could not find an object by its contents.

Press **Run**.
The console shows `Products: 4`, a small school store with an id, a title, a price, and a stock flag on each product.

```demo name="array-methods"
```

Find one product by its title.

```js file="src/main.js" action="append"

const pens = products.find((product) => product.title === "Pens");
console.log("Found:", pens);
```

Run the code, and the console shows `Found: {"id":3,"title":"Pens","price":3,"inStock":true}`.
`find` calls the callback with each product in order and stops at the first one for which it returns `true`, and it returns that **item itself**, not an array around it.
This is how you look up an object by its contents, the job `includes` could not do: the callback compares a property, so it does not matter which arrow you hold.

Now ask for a product the store does not sell.
```predict
What does `find` return for a product the store does not sell?
- `Stapler: null`
= `Stapler: undefined`
- `Stapler: []`
```

```js file="src/main.js" action="append"

const stapler = products.find((product) => product.title === "Stapler");
console.log("Stapler:", stapler);
console.log("filter instead:", products.filter((product) => product.title === "Stapler"));
console.log("Stapler price:", stapler?.price ?? "not sold here");
```

Run the code.
`find` returns `undefined` when nothing passes, while `filter` returns an empty array, `[]`.
That difference matters on the next line: `stapler.price` would throw, because `stapler` is `undefined`, so the line uses the `?.` and `??` pair from Objects and references and prints `Stapler price: not sold here`.
Whenever you `find`, decide what happens when nothing is found.

`some` and `every` answer yes or no.

```js file="src/main.js" action="append"

const anyOutOfStock = products.some((product) => !product.inStock);
const allUnderFifty = products.every((product) => product.price < 50);
console.log("Any out of stock?", anyOutOfStock);
console.log("All under $50?", allUnderFifty);
```

`some` returns `true` as soon as one callback returns `true`, here at the backpack, and `every` returns `false` as soon as one returns `false`; both stop early once the answer is known.
Both are `true` for this store: the backpack is out of stock, and every price is under fifty.

Last, the edge case.

```predict
For an empty cart, what do `every` and `some` print?
- `Empty every: true` and `Empty some: true`
- `Empty every: false` and `Empty some: false`
= `Empty every: true` and `Empty some: false`
```

```js file="src/main.js" action="append"

const emptyCart = [];
console.log("Empty every:", emptyCart.every((item) => item.price > 100));
console.log("Empty some:", emptyCart.some((item) => item.price > 100));
```

Run the code.
`every` on an empty array is `true` and `some` is `false`, whatever the callback says, because the callback never runs.
`every` means "no item fails", and an empty cart has no item that fails; `some` means "at least one item passes", and an empty cart has none.
So check `cart.length > 0` first when "every item is paid for" should not be true for a cart with nothing in it.

## Read more

Two relatives are worth knowing.
`findIndex` works like `find` but returns the position instead of the item, and `-1` when nothing passes, so `products.findIndex((product) => product.id === 3)` is `2`.
`includes` is still the right tool for strings and numbers, as in `["A", "B"].includes(grade)`, because those compare by value.

One mistake to try: change the `find` callback for the pens to `(product) => { product.title === "Pens" }`, with braces, and run.
`Found` becomes `undefined`, because a callback with braces returns nothing unless it says `return`, so no product ever passes; take the braces out again.

**If it breaks:** If `Found` prints an array, the line uses `filter` instead of `find`.
If the console shows `TypeError: Cannot read properties of undefined (reading 'price')`, the stapler line reads `stapler.price` without the `?.`.
If `Any out of stock?` is `false`, the callback is missing the `!` in front of `product.inStock`.

**Check:** Run the code.
The console shows the pens as one object, `Stapler: undefined`, `filter instead: []`, `Stapler price: not sold here`, `true` for both store questions, `Empty every: true`, and `Empty some: false`.
Press **Run checks** to confirm.

```quiz
What does `find` return when no item passes?
- `[]`, an empty array
= `undefined`
- `-1`
> `find` returns the item itself or `undefined`; `filter` is the one that returns `[]`, and `findIndex` the one that returns `-1`.
```

```quiz
What is `[].some((item) => true)`?
- `true`
= `false`
> On an empty array the callback never runs, so no item passes, and `some` needs at least one.
```

<details>
<summary>src/main.js after this step</summary>

```js
const products = [
  { id: 1, title: "Notebook", price: 4.5, inStock: true },
  { id: 2, title: "Backpack", price: 39.99, inStock: false },
  { id: 3, title: "Pens", price: 3, inStock: true },
  { id: 4, title: "Calculator", price: 18, inStock: true }
];

console.log("Products:", products.length);

const pens = products.find((product) => product.title === "Pens");
console.log("Found:", pens);

const stapler = products.find((product) => product.title === "Stapler");
console.log("Stapler:", stapler);
console.log("filter instead:", products.filter((product) => product.title === "Stapler"));
console.log("Stapler price:", stapler?.price ?? "not sold here");

const anyOutOfStock = products.some((product) => !product.inStock);
const allUnderFifty = products.every((product) => product.price < 50);
console.log("Any out of stock?", anyOutOfStock);
console.log("All under $50?", allUnderFifty);

const emptyCart = [];
console.log("Empty every:", emptyCart.every((item) => item.price > 100));
console.log("Empty some:", emptyCart.some((item) => item.price > 100));
```

</details>
