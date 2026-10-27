---
title: reduce
mode: edit
entry: index.html
required: [reduce-totals-the-cart, reduce-trace, reduce-counts-items, reduce-builds-an-object]
---

`map` turns an array into another array of the same length, and `filter` into a shorter one.
`reduce` turns an array into **one value**: a total, a count, a largest item, or an object of tallies.
This step writes the cart total with `reduce`, prints every stage of it so you can watch the running total grow, and then reduces into something that is not a number.

Press **Run**.
The console shows `Total with forEach: 30`, the cart total computed the way you would have written it so far: a `let` outside the loop, changed once per item.

Write the same total with `reduce`.

```js file="src/main.js" action="append"

const reducedTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
console.log("Total with reduce:", reducedTotal);
```

Run the code, and the console shows `Total with reduce: 30`.
`reduce` takes two arguments: a callback, and a **starting value**, here `0`.
The callback receives the running result so far, which we named `sum`, and the current item, and whatever it returns becomes `sum` for the next item; the value returned for the last item is the answer.
No `let` and no reassignment outside the callback: the running total lives inside `reduce`.

To see it happen, give the callback braces and a log.
Predict before you run: does the first trace line show `sum is 0`, `sum is undefined`, or `sum is 9`?

```js file="src/main.js" action="append"

cart.reduce((sum, item) => {
  console.log(`sum is ${sum}, adding ${item.title}`);
  return sum + item.price * item.quantity;
}, 0);
```

Run the code.
Three lines appear: `sum is 0, adding Notebook`, `sum is 9, adding Pens`, and `sum is 12, adding Calculator`.
The first `sum` is the starting value, `0`; the notebooks add `9`, the pens `3`, and the calculator `18`, which is the `30` the last call returns.
With braces, the callback needs its `return`, as every arrow function with braces does.

The starting value does not have to be a sum of prices.

```js file="src/main.js" action="append"

const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
console.log("Items in the cart:", itemCount);
```

This one adds quantities instead, so the cart holds `4` items: two notebooks, one pack of pens, and one calculator.

It does not even have to be a number.

```js file="src/main.js" action="append"

const grades = ["A", "B", "A", "C", "B", "A"];
const gradeCounts = grades.reduce((tally, grade) => {
  tally[grade] = (tally[grade] ?? 0) + 1;
  return tally;
}, {});
console.log("Grade counts:", gradeCounts);
```

The starting value is an empty object, `{}`, and for each grade the callback adds one to that grade's key, using `?? 0` from Objects and references for a grade it has not seen yet; the console shows `Grade counts: {"A":3,"B":2,"C":1}`.
The bracket notation `tally[grade]` is the one from JavaScript basics, reading the key whose name the variable holds.
Changing `tally` inside the callback is fine here, because it is a fresh object that `reduce` created for this call from the `{}`, and no one else holds an arrow to it.

A mistake to try: delete the `, 0` at the end of the first `reduce` and run.
With no starting value, `reduce` uses the **first item** as the starting `sum`, so `sum` is the whole notebook object, `+` turns it into the text `[object Object]`, and the total comes out as a string that starts with `[object Object]3`; put the `0` back.
Always give `reduce` a starting value.

`reduce` can do what `map` and `filter` do, and that is a reason not to use it for them: when the answer is an array of the same length, write `map`, and when it is a shorter array, write `filter`.
Reach for `reduce` when the answer is one value.

**If it breaks:** If `Total with reduce` shows text that starts with `[object Object]`, the starting value `0` is missing; if it shows `NaN`, a property name in the callback is misspelled, such as `item.qty`.
If the trace prints `sum is undefined` from the second line on, the braced callback is missing `return`.
If `Grade counts` shows `NaN` for each grade, the `?? 0` is missing, so the first count for a grade is `undefined + 1`.

**Check:** Run the code.
The console shows `Total with forEach: 30`, `Total with reduce: 30`, the three trace lines from `sum is 0` to `sum is 12`, `Items in the cart: 4`, and `Grade counts: {"A":3,"B":2,"C":1}`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
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
```

</details>
