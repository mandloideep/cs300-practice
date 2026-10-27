---
title: Stable keys
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [six-rows, no-key-warning, quantity-follows-product]
---

We turned the list into an order sheet: each row has a quantity field, and a button switches between lowest price first and highest price first.
The `li` still has no key, and this step shows the bug that causes before fixing it with the product's `id`.
Watch where a typed quantity goes when the rows change order.

```demo name="reconcile-keys"
```

The button uses `useState`, which we study in Week 11; for now read it as "remember which order is chosen and draw the list again when it changes".
The console shows the same key warning as in Step 1.

```predict
You type 3 in Apple's quantity field, the first row, and press Show highest price first; where is the 3 now?
= Still in the first row, which is now Dior J'adore
- With Apple, at the bottom of the list
- Gone, because every field resets to 0
```

Reproduce the bug before fixing it.

1. Run the code.
   Apple is the first row, because it has the lowest price.
2. Type 3 in Apple's quantity field.
3. Press **Show highest price first**.

The titles and prices move, but the 3 stays in the first row, which is now Dior J'adore.
Someone just ordered three bottles of perfume instead of three apples.

Give each row the product's `id` as its key.

```jsx file="src/App.jsx" action="replace" anchor="          <li>"
          <li key={product.id}>
```

The key goes on the outermost element the `map` callback returns, here the `li`.

## Read more

Here is why the quantity stayed behind.
After every render, React compares the new list of elements with the old one to decide which DOM nodes to keep.
Without a key, React matches them by position: the first new `li` updates the first old `li`, and so on.
React updates the text of each row in place, but the input element in row one is the same DOM node as before, so the value the user typed stays where it was.

A key gives each element an identity that survives reordering.
**A key must be unique among its siblings and stable: the same item gets the same key on every render.**
The product's `id` from the data is exactly that.
React reads the key to match elements and does not pass it to the element as a prop.

Try one experiment after the check passes, and then undo it.
Change the key to the array index: `{sorted.map((product, index) => (` on the map line and `key={index}` on the `li`.
The warning disappears, because every index is unique, but the bug comes back, because the index describes a position, not a product.
An index key is only safe for a list that never reorders, never filters, and never inserts or deletes in the middle; when in doubt, use an id from the data.
Put `key={product.id}` back before moving on.

**If it breaks:** If the warning remains, the key is on an inner element such as the `span` instead of the `li`.
If the console warns `Encountered two children with the same key`, two products share an id, or the key uses a value that repeats, such as `product.category`.
If the quantity still stays in place, check that the key is `product.id` and not `index`.

**Check:** Run the code and repeat the three steps.
Now the 3 travels with Apple to the bottom of the list, and the console has no key warning.
Behind the scenes, React moved each existing `li`, input included, instead of rewriting the text inside it.

```quiz
Why does `key={index}` bring the bug back even though the warning goes away?
- Indexes are not unique, so React mixes up the rows
= An index names a position, so after a reorder the same key belongs to a different product
- React ignores numeric keys and falls back to matching by position
> Every index is unique, which silences the warning, but it is not stable: the row at index 0 is Apple before the reorder and Dior J'adore after it, so the input with the 3 stays at index 0.
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

export default function App() {
  const [lowestFirst, setLowestFirst] = useState(true);
  const sorted = [...products].sort((a, b) => (lowestFirst ? a.price - b.price : b.price - a.price));
  return (
    <main>
      <h1>Order sheet</h1>
      <p className="lead">Type a quantity next to any product, then change the order.</p>
      <div className="controls">
        <button type="button" onClick={() => setLowestFirst(!lowestFirst)}>
          {lowestFirst ? "Show highest price first" : "Show lowest price first"}
        </button>
      </div>
      <ul className="product-list">
        {sorted.map((product) => (
          <li key={product.id}>
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
            <input type="number" min="0" defaultValue="0" aria-label={`Quantity of ${product.title}`} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

</details>
