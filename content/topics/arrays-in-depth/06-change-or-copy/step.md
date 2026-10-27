---
title: Change or copy
mode: edit
entry: index.html
required: [changes-group, copies-group, react-needs-a-copy]
---

This topic has used a dozen array methods, and each one does one of two things to the array it is called on: it **changes the array**, or it leaves it alone and **returns a new one**.
This step sorts every method you have met into those two groups with a small test you can run, and then shows why React cares which group you pick.
Predict each method's group before the console tells you.

**We used this in:** [Objects and references](#/topic/objects-and-references), where `===` on two arrays asked whether they were the same array, not whether they held the same items.

Press **Run**.
The console shows `Changes the array: ["push"]` and `Returns a new one: ["map"]`.
Read `classify` before you add to it.
It makes a fresh three-item cart, and `cart.join(",")` turns the cart into one string, `"Pens,Notebook,Backpack"`, so that the before and after can be compared with `===` as text; comparing the arrays themselves would always say "same array".
Then it calls the method on the cart through the callback `use`, and if the text changed, the method changed the array.

```demo name="mutation-vs-copy"
```

Add the methods from Steps 2 and 3 and the copying partner of each, after the `map` line.

```predict
After the first edit, which methods does the console list as changing the array?
- `Changes the array: ["push","sort","toSorted","splice","toSpliced"]`
= `Changes the array: ["push","sort","splice"]`
- `Changes the array: ["push","sort","splice","slice"]`
```

```js file="src/main.js" action="insert-after" anchor='classify("map", (cart) => cart.map((item) => item.toUpperCase()));'
classify("sort", (cart) => cart.sort());
classify("toSorted", (cart) => cart.toSorted());
classify("splice", (cart) => cart.splice(0, 1));
classify("slice", (cart) => cart.slice(0, 1));
classify("toSpliced", (cart) => cart.toSpliced(0, 1));
classify("filter", (cart) => cart.filter((item) => item !== "Pens"));
```

Run the code.
`sort` and `splice` join `push` in the first group, and `toSorted`, `slice`, `toSpliced`, and `filter` join `map` in the second.
Each pair does the same job, and the copying one returns its answer as a new array and leaves `cart` exactly as it was.

Four more, two from each group.

```js file="src/main.js" action="insert-after" anchor='classify("filter", (cart) => cart.filter((item) => item !== "Pens"));'
classify("pop", (cart) => cart.pop());
classify("reverse", (cart) => cart.reverse());
classify("toReversed", (cart) => cart.toReversed());
classify("concat", (cart) => cart.concat(["Ruler"]));
```

`pop` removes the last item and `reverse` turns the array around in place, so they change it; `toReversed` is the copying partner of `reverse`, and `concat` returns a new array with the extra items on the end, like `[...cart, "Ruler"]`.
The console now shows `Changes the array: ["push","sort","splice","pop","reverse"]` and seven methods that return a new one.

Now the reason this matters.
When React state holds an array, React decides whether to draw the page again by comparing the old state with the new one, using `Object.is`, which for arrays and objects is the same question as `===`: is it the same array?
```predict
After a `push`, would React draw the page again?
= `push, re-render? false`
- `push, re-render? true`
```

```js file="src/main.js" action="append"

const wouldRerender = (oldState, newState) => !Object.is(oldState, newState);
const items = ["Pens", "Notebook"];
items.push("Ruler");
console.log("push, re-render?", wouldRerender(items, items));
console.log("spread, re-render?", wouldRerender(items, [...items, "Eraser"]));
```

Run the code.
`push, re-render?` is `false` and `spread, re-render?` is `true`.
After a `push`, the state you hand back to React is the same array it already has, now with one more item, so React sees no change and the page keeps showing the old list.
A spread, like every method in the second column, gives React a new array, React sees a different array, and the page updates.
**React state needs the second kind**: whenever you update an array or an object in state, build a new one.

Here is the whole sorting in one table, with a few methods this topic did not run.

| Changes the array | Returns a new one |
| --- | --- |
| `push`, `pop`, `shift`, `unshift` | `concat`, or the spread `[...cart, item]` |
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `splice` | `toSpliced`, `slice`, `filter` |
| `cart[0] = item` | `map`, or `cart.with(0, item)` |

`find`, `findIndex`, `some`, `every`, `includes`, and `reduce` belong to neither group: they read the array and return a single value, and they never change it.
`forEach` returns nothing, and changes the array only if your callback does.

You will lean on the second column in [Events and lifting state](#/topic/events-and-lifting-state), where a form adds a product to a list in the parent with `setItems([...items, product])`, and in [Controlled forms](#/topic/controlled-forms), whose step "Add to the list without mutating it" has you type the `push` mistake on purpose, watch the list fail to update, and fix it with a spread.
## Read more

Methods from the first column are still fine on an array you just made yourself and nobody else holds, such as the result of a `filter` or the `tally` object in the reduce step.

**If it breaks:** If `toSorted` or `toSpliced` lands in the first group, the line calls `sort` or `splice` instead; read the method name in the callback, not the label.
If a method lands in the wrong group with the right name, check that the callback calls it on `cart`, the parameter, and not on another array.
If `spread, re-render?` shows `false`, the second argument is `items` instead of `[...items, "Eraser"]`.

**Check:** Run the code.
The console shows `Changes the array: ["push","sort","splice","pop","reverse"]`, `Returns a new one: ["map","toSorted","slice","toSpliced","filter","toReversed","concat"]`, `push, re-render? false`, and `spread, re-render? true`.
Press **Run checks** to confirm.

```quiz
Which update lets React see that the list in state changed?
- `items.push(product); setItems(items);`
= `setItems([...items, product]);`
> The spread makes a new array, and React compares the old and new state by reference, so only a new array counts as a change.
```

```quiz
Which of these changes the array it is called on?
- `toReversed`
= `reverse`
- `slice`
> `reverse` turns the array around in place; `toReversed` and `slice` return a new array and leave the original alone.
```

<details>
<summary>src/main.js after this step</summary>

```js
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
```

</details>
