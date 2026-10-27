---
title: What the setter does
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash]
  watch: [ProductCard]
required: [only-clicked-card-renders, render-sees-new-value, remove-one]
---

In Step 2 we wrote `setQuantity(quantity + 1)` and the card updated, and this step looks at what happens in between, because the whole of React rests on it.
A log reports every call of `ProductCard`, and a second button sends the quantity back down.
Watch which card logs after a click and which quantity each call sees.

```demo name="state-snapshot"
```

Calling a setter does two things.
It stores the new value, and it asks React to **re-render** the component: React calls `ProductCard` again, from the top, as if for the first time.

Watch that happen.
Add a log at the top of `ProductCard`, right after the state line, so that the console reports every time the function runs.

```predict
After you add the log, run, and click **Add to cart** on one card, which cards log a new `Rendering` line?
- All six cards, because the page renders again
= Only the card you clicked, with quantity `1`
- None, because the log runs only on the first render
```

```jsx file="src/App.jsx" action="insert-after" anchor="  const [quantity, setQuantity] = useState(0);"
  console.log("Rendering", product.title, "with quantity", quantity);
```

Run the code with **Boundaries** and **Re-render flash** open.
The console shows one line per card, each with quantity `0`, or two lines per card under Strict Mode.
Now click **Add to cart** on one card.
One more line appears, or two under Strict Mode, naming that product with quantity `1`, and only that card's outline flashes.

Now add a way back down, so that the setter is used with a value that goes the other way.
Add a second handler above the `return` of `ProductCard`.
The block replaces the `return (` line and ends with it, so you type the function directly above it.

```jsx file="src/App.jsx" action="replace" anchor="  return ("
  function handleRemove() {
    setQuantity(quantity - 1);
  }

  return (
```

Replace the single button with a pair.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button" onClick={handleAdd}>Add to cart</button>'
      <div className="cart-controls">
        <button type="button" onClick={handleRemove} disabled={quantity === 0}>Remove one</button>
        <button type="button" onClick={handleAdd}>Add to cart</button>
      </div>
```

`disabled={quantity === 0}` is described from the state, so nobody writes code that turns the button off; the next render simply describes it as disabled when the value is `0`.

## Read more

When React calls `ProductCard` again, every line in the function runs again, but this time `useState(0)` returns the stored value instead of `0`.
The function returns new JSX, React compares it with the JSX from last time, and changes only what differs on the page.
That is why, after one click, `App`, `ProductList`, and the other five cards did not run again: nothing they own changed.

Notice the `const`.
Within one call of the function, `quantity` never changes; it is a snapshot of the state for that render.
When you click, React does not change `quantity` from `0` to `1` in place.
It calls the function again, and the new call gets a new `const` holding `1`.

The **Remove one** button is described from the state as the button on the Week 10 study tracker was.

**If it breaks:** If a click logs lines for every card, the state has moved out of `ProductCard` and into `App` or `ProductList`; keep `useState` inside the card.
If the number goes below zero, the `disabled` attribute compares against something other than `0`, or sits on the wrong button.
If the console shows every line twice, that is Strict Mode calling the component twice in development; count the lines per click, not in total.

**Check:** Run the code and click **Add to cart** twice and **Remove one** once on the same card.
The console shows one `Rendering` line per click, all naming that product, with the quantities `1`, `2`, and `1`, and only that card flashes each time.
When a card is back at `0`, its **Remove one** button is disabled.
Press **Run checks** to confirm.

```quiz
A card shows `In cart: 2`, and you click **Remove one**; inside that `handleRemove` call, what is `quantity` right after `setQuantity(quantity - 1)` runs?
- `1`, because the setter changed it
= `2`, because this render's `quantity` is a `const` snapshot
- `0`, because `useState(0)` runs again
> The setter asks for a new render; only the next call of `ProductCard` gets a new `const` holding `1`, and the call that is running keeps the value it started with.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(0);
  console.log("Rendering", product.title, "with quantity", quantity);

  function handleAdd() {
    setQuantity(quantity + 1);
  }

  function handleRemove() {
    setQuantity(quantity - 1);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}, rated {product.rating} of 5</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <p className="product-cart">In cart: {quantity}</p>
      <div className="cart-controls">
        <button type="button" onClick={handleRemove} disabled={quantity === 0}>Remove one</button>
        <button type="button" onClick={handleAdd}>Add to cart</button>
      </div>
    </article>
  );
}

function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock.</p>
      <ProductList items={products} />
    </main>
  );
}
```

</details>
