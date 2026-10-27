---
title: Closures and stale state
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [add-three-adds-three, add-one-adds-one, report-is-current]
---

**We used this in:** [Scope and closures](#/topic/scope-and-closures/4), where a function kept reading the variables around it, and [State and useState](#/topic/state-usestate/3), where a setter asked React for the next render instead of changing the value.

This step has two buttons that each seem to misread the quantity, and one idea that explains both: every render is a separate call of the component, and every handler is a closure over that call's values.
Fix them, and you will know why `quantity` inside a handler never changes while the handler runs.
Watch the number on the page and the line the timer prints.

```demo name="closure"
```

Press **Run**.
The quantity starts at `0`, and the checks press each button once to test it, so by the time you look the page reads `Apples in the cart: 2` and the console has one `Quantity a moment later:` line.
The numbers below continue from there.

```predict
You click **Add three** once; what happens to the number?
- It goes up by three
= It goes up by one
- It does not change
```

Run the code again so that the answer can be revealed, click **Add three**, and watch: the number goes up by one, though `addThree` calls the setter three times.

Read the handler as JavaScript.
This render's `quantity` is a `const` that holds `2`, and `addThree` is a closure over it, so each of the three lines computes `2 + 1` and asks React for `3`.
Three requests for `3` give `3`.
Nothing inside the handler can change `quantity`, because it belongs to this call of `App`; the new value arrives in the next call, the next render.

The setter has a second form for this case: pass it a function, and React calls that function with the latest value, in order.

```jsx file="src/App.jsx" action="replace" anchor="    setQuantity(quantity + 1);\n    setQuantity(quantity + 1);\n    setQuantity(quantity + 1);"
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
```

Run it and click **Add three**: up by three.
`(current) => current + 1` is a callback that does not read the closed-over `quantity` at all; React hands each one the result of the one before.

## A timer that remembers the wrong render

**Add one and report** adds one and, a moment later, prints the quantity.

```predict
After **Add one and report**, what does the timer print?
- The number now on the page
- `undefined`
= The number from before the click
```

Click it.
It prints the number from before the click: the page reads `4` and the console says `Quantity a moment later: 3`.

The arrow passed to `setTimeout` is a closure too, created during the click, inside the render where `quantity` was `3`.
When it runs, React has already drawn the next render with `4`, but this arrow still belongs to the old one, and the old `quantity` is `3` forever.
This is called a **stale closure**, and it is the same thing the loop-variable classic showed in [Scope and closures](#/topic/scope-and-closures/6): a function reads the variable it closed over, not the one you meant.

Step through the picture below to see each render keep its own `quantity`, and the timer keep the render it was made in.

```demo name="state-snapshot"
```

When the handler itself needs the next value, compute it once and use that name for both.

```jsx file="src/App.jsx" action="replace" anchor="    setQuantity(quantity + 1);\n    setTimeout(() => {"
    const next = quantity + 1;
    setQuantity(next);
    setTimeout(() => {
```

```jsx file="src/App.jsx" action="replace" anchor='      console.log("Quantity a moment later:", quantity);'
      console.log("Quantity a moment later:", next);
```

Run it and click **Add one and report**: the timer prints the same number the page shows.

## Read more

### Why React works this way

React calls `App` again for every render, so each render has its own `quantity`, its own `addThree`, and its own `addOneAndReport`, the way each call of a counter factory in [Scope and closures](#/topic/scope-and-closures/5) made its own `count`.
That is what makes a render a snapshot: the JSX, the handlers, and any timer started from them all see one consistent set of values, even while the next render is being prepared.
The cost is that a handler cannot read a value that changes while it runs, and the two fixes cover the two cases: the function form of the setter when the next value depends on the last one, and a local `const` when the handler needs the value itself.

**If it breaks:** If **Add three** still adds one, at least one of the three lines still says `quantity + 1`; each must be the function form.
If the timer prints `undefined`, the `console.log` reads a name that is not defined in that scope, such as `nextQuantity`; it must read `next`.
If the result says `next is not defined`, the `const next` line went below the line that uses it.

**Check:** Run the code.
**Add three** adds three, **Add one and report** adds one, and the line the timer prints matches the number on the page.

```quiz
Inside a click handler, `quantity` is 5 and the handler calls `setQuantity(quantity + 1)` twice; what is the next quantity?
- 7
= 6
- 5
> Both calls read this render's `quantity`, which stays 5 for the whole handler, so both ask for 6; the function form `(q) => q + 1` would give 7.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

export default function App() {
  const [quantity, setQuantity] = useState(0);

  function addThree() {
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
    setQuantity((current) => current + 1);
  }

  function addOneAndReport() {
    const next = quantity + 1;
    setQuantity(next);
    setTimeout(() => {
      console.log("Quantity a moment later:", next);
    }, 200);
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">Apples in the cart: {quantity}</p>
      <div className="cart-controls">
        <button type="button" onClick={addThree}>Add three</button>
        <button type="button" onClick={addOneAndReport}>Add one and report</button>
      </div>
    </main>
  );
}
```

</details>
