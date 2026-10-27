---
title: Chain the methods
mode: edit
entry: index.html
required: [filters-chain, sort-and-label, chain-ends-in-reduce, order-matters]
---

Every method in this topic that returns an array can be followed by another one, so a question like "which in-stock items under $20 do we have, cheapest first, as labels?" becomes one chain that reads top to bottom.
This step builds that chain one link at a time, ends another chain with `reduce`, and then puts two links in the wrong order on purpose.
Watch what each link hands to the next: an array of products, a shorter array, the same products in a new order, and then strings.

**We used this in:** [JavaScript basics](#/topic/javascript-basics), where `filter` and `map` were chained to make the passing labels.

Press **Run**.
The console shows `Products: 6`, a store with a category, a price, and a stock flag on each product.

Start with two filters.

```js file="src/main.js" action="append"

const affordable = products
  .filter((product) => product.inStock)
  .filter((product) => product.price < 20);
console.log("Affordable:", affordable.length);
```

Run the code, and the console shows `Affordable: 4`.
Each link starts with a dot on its own line: the first `filter` keeps the five in-stock products, and the second keeps the four of those under $20.
Writing one link per line is a convention, not a rule, and it makes a long chain readable.

Now put the affordable products in price order and turn each into a label.

```js file="src/main.js" action="append"

const labels = affordable
  .toSorted((a, b) => a.price - b.price)
  .map((product) => `${product.title} $${product.price.toFixed(2)}`);
console.log("Labels:", labels);
```

`toSorted` returns a new array of the same four products from cheapest to most expensive, and `map` turns each into a string, so the console shows `Labels: ["Pens $3.00","Notebook $4.50","Highlighters $6.25","Planner $12.00"]`.
`toFixed(2)` from JavaScript basics shows every price with two decimals, and `$${...}` is a dollar sign followed by the template literal's own `${`.
`toSorted` matters here: `sort` would also work, but it would reorder `affordable` itself on the way through.

A chain can end in one value instead of an array.

```js file="src/main.js" action="append"

const writingTotal = products
  .filter((product) => product.category === "writing" && product.inStock)
  .reduce((sum, product) => sum + product.price, 0);
console.log("Writing supplies total:", writingTotal);
```

The `filter` keeps the pens and the highlighters, and `reduce` adds their prices, so the console shows `Writing supplies total: 9.25`.
`reduce` returns a number, so it is always the last link: a number has no `map` or `filter`.

Last, the order of the links.
Predict before you run: does the console show `map first: []`, `map first: ["Notebook","Backpack","Pens","Highlighters","Planner"]`, or a `TypeError`?

```js file="src/main.js" action="append"

const mapFirst = products
  .map((product) => product.title)
  .filter((title) => title.inStock);
console.log("map first:", mapFirst);
```

Run the code.
The console shows `map first: []`.
After the `map`, the array holds only strings such as `"Notebook"`, and a string has no `inStock` property, so `title.inStock` is `undefined` for every one, `filter` keeps none, and nothing complains.
Each link sees only what the link before it returned, so filter while you still have the objects, and map to strings at the end.

When a chain gives the wrong answer, break it apart.
Give each link its own `const` and log it, as the first two edits did with `affordable` and `labels`, and the first log that looks wrong tells you which link to fix.
Chaining also does not change `products`: every link here is a copying method, which is why `Products: 6` stays true for the whole file.

**If it breaks:** If `Affordable` shows `5`, one of the two filters is missing: the labels then include the backpack when the price filter is gone, and the calculator when the stock filter is gone.
If a label shows `$3` instead of `$3.00`, the `toFixed(2)` is missing.
If the labels are in the original order, the `toSorted` link is missing or compares `a.title` instead of `a.price`.
If `Writing supplies total` shows `0`, the category in the filter is misspelled, since `"Writing"` with a capital letter matches no product.

**Check:** Run the code.
The console shows `Affordable: 4`, the four labels from `Pens $3.00` to `Planner $12.00`, `Writing supplies total: 9.25`, and `map first: []`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const products = [
  { title: "Notebook", category: "paper", price: 4.5, inStock: true },
  { title: "Backpack", category: "bags", price: 39.99, inStock: true },
  { title: "Pens", category: "writing", price: 3, inStock: true },
  { title: "Calculator", category: "tech", price: 18, inStock: false },
  { title: "Highlighters", category: "writing", price: 6.25, inStock: true },
  { title: "Planner", category: "paper", price: 12, inStock: true }
];

console.log("Products:", products.length);

const affordable = products
  .filter((product) => product.inStock)
  .filter((product) => product.price < 20);
console.log("Affordable:", affordable.length);

const labels = affordable
  .toSorted((a, b) => a.price - b.price)
  .map((product) => `${product.title} $${product.price.toFixed(2)}`);
console.log("Labels:", labels);

const writingTotal = products
  .filter((product) => product.category === "writing" && product.inStock)
  .reduce((sum, product) => sum + product.price, 0);
console.log("Writing supplies total:", writingTotal);

const mapFirst = products
  .map((product) => product.title)
  .filter((title) => title.inStock);
console.log("map first:", mapFirst);
```

</details>
