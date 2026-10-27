---
title: Callbacks and onClick
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [ProductCard]
required: [nothing-before-a-click, two-buttons-per-card, each-click-passes-its-quantity]
---

**We used this in:** [Functions and callbacks](#/topic/functions-and-callbacks/5), where `runTwice(remind)` and `runTwice(remind())` meant different things, and [State and useState](#/topic/state-usestate/1), where `onClick={handleAdd}` made a button log.

This step starts with a bug that every React class meets in its first week, and explains it with the JavaScript rule you already know.
`onClick` wants a function, the way `addEventListener` and `runTwice` did, and React calls that function later, when the button is clicked.
Watch the console before you click anything.

Press **Run**, and read the console before touching the page.
It already shows six lines, two for each product, `Added to the cart: Essence Mascara Lash Princess` and so on, and nobody has clicked.
Click **Add to cart** on any card: nothing more is printed.

Predict before you read the explanation: is the bug in `handleAdd`, in the parentheses after `handleAdd` on the button, or in `products.map`?
It is the parentheses.
`onClick={handleAdd()}` runs `handleAdd` right now, while React draws the card, and hands `onClick` whatever it returned, which is `undefined`, so the button has no handler at all.
That is the parentheses mistake from [Functions and callbacks](#/topic/functions-and-callbacks/5), with React's `onClick` in place of `runTwice`.
Each line appears twice because the step runs React in Strict Mode, which draws every component two times in development to bring out exactly this kind of code that does something while drawing.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button" onClick={handleAdd()}>Add to cart</button>'
      <button type="button" onClick={handleAdd}>Add to cart</button>
```

Run it.
The console is empty until you click, and each click prints one line for that card's product.
`onClick={handleAdd}` hands React the function itself, a **callback**, and React calls it once per click.

## When the callback needs an argument

Now give the card two buttons, one that adds one and one that adds three.
The handler takes the quantity as a parameter.

```jsx file="src/App.jsx" action="replace" anchor='  function handleAdd() {\n    console.log("Added to the cart:", product.title);\n  }'
  function handleAdd(quantity) {
    console.log("Added to the cart:", quantity, "x", product.title);
  }
```

The tempting way to pass the quantity is `onClick={handleAdd(3)}`, and it is the same mistake again: the parentheses call it now.
The fix is a new, small function whose only job is to make the call later, an arrow function with no parameters.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button" onClick={handleAdd}>Add to cart</button>'
      <div className="cart-controls">
        <button type="button" onClick={() => handleAdd(1)}>Add one</button>
        <button type="button" onClick={() => handleAdd(3)}>Add three</button>
      </div>
```

Run it, and click **Add three** on the apple card: `Added to the cart: 3 x Apple`.
Read `() => handleAdd(3)` as "a function that, when called, calls `handleAdd` with 3".
React stores that function and calls it on the click, and only then does `handleAdd(3)` run.

## Why React works this way

A component is a function that React calls every time it draws the card, and everything inside its `return` runs during that call.
So anything written as a call inside the JSX, `handleAdd()` included, runs while drawing, once per card and twice in Strict Mode.
An event, though, happens later, after drawing has finished, possibly never.
The only way to describe "do this later" in JavaScript is to hand over a function and let someone else call it, which is why every event prop in React, `onClick`, `onChange`, `onSubmit`, takes a function, the way `addEventListener` did in [DOM and events](#/topic/dom-events).

The arrow version creates a new function each time the card draws, which is normal and cheap; you do not need to avoid it.
And if a handler takes no arguments, `onClick={handleAdd}` and `onClick={() => handleAdd()}` do the same thing; the first is shorter.

**If it breaks:** If the console fills with lines before any click again, one of the buttons has `onClick={handleAdd(1)}`; wrap it as `onClick={() => handleAdd(1)}`.
If a click prints `Added to the cart: undefined x Apple`, the button calls `handleAdd()` with no quantity, or the handler's parameter is missing.
If the result says `Too many re-renders`, a handler written with parentheses calls a state setter while drawing, which draws again, which calls it again; the fix is the same arrow.

**Check:** Run the code.
The console stays empty until a click, every card has **Add one** and **Add three**, and each click prints its own quantity and product.
The checks press **Add one** on the first card and **Add three** on the second, so those two lines are already in the console when you look.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
const products = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
  { id: 16, title: "Apple", price: 1.99 },
  { id: 20, title: "Cooking Oil", price: 4.99 }
];

function ProductCard({ product }) {
  function handleAdd(quantity) {
    console.log("Added to the cart:", quantity, "x", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <div className="cart-controls">
        <button type="button" onClick={() => handleAdd(1)}>Add one</button>
        <button type="button" onClick={() => handleAdd(3)}>Add three</button>
      </div>
    </article>
  );
}

export default function App() {
  return (
    <main>
      <h1>Cart</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

</details>
