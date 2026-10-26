---
title: Several state variables in one component
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [ProductCard]
required: [two-state-values, save-toggles, values-independent]
---

A component can own as many pieces of state as it needs.
The card should also let a shopper save a product for later, which is a yes-or-no value that has nothing to do with the quantity.
We removed the render log from Step 3; the inspector's tree shows the same information.

Add a second state variable under the first.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [quantity, setQuantity] = useState(0);"
  const [saved, setSaved] = useState(false);
```

Each `useState` call is its own slot.
React keeps the slots in the order the calls happen, which is why the next step's rules of hooks say to call `useState` only at the top level of the component, never inside an `if` or a loop.
Updating one slot leaves the others exactly as they were.

Add a handler that flips the value.
The block replaces the `return (` line and ends with it, so you type the function directly above it.

```jsx file="src/App.jsx" action="replace" anchor="  return ("
  function handleSave() {
    setSaved(!saved);
  }

  return (
```

`!saved` is the opposite of the current value, so the same handler saves and unsaves.

Add the button after **Add to cart**, inside the controls.

```jsx file="src/App.jsx" action="insert-after" anchor='        <button type="button" onClick={handleAdd}>Add to cart</button>'
        <button type="button" className="save" aria-pressed={saved} onClick={handleSave}>
          {saved ? "Saved" : "Save for later"}
        </button>
```

The label is described from the state with the conditional operator, and `aria-pressed` tells assistive technology that this is a toggle and whether it is on.
Both are read from `saved` on every render, so there is no code that changes a label; there is only a value and a description of the button for that value.

Why two variables instead of one object such as `{ quantity: 0, saved: false }`?
Both work, but when two values change independently, separate variables keep each setter call to one line, with nothing to copy and nothing to get wrong.
When values always change together, as a form's fields will in the next session, one object can be the better fit.

**Check:** Run the code and select a `ProductCard` in the inspector tree.
It shows two state values, `0` and `false`.
Click **Save for later**: the button reads **Saved**, the second value becomes `true`, and `In cart` has not moved.
Click **Add to cart**: the quantity rises and the button still reads **Saved**.
Press **Run checks** to confirm.

**If it breaks:** If the console says `Rendered more hooks than during the previous render`, a `useState` call is inside a condition or a loop; move it to the top of the component.
If the button never changes, the handler calls `setSaved(saved)` instead of `setSaved(!saved)`.
If saving resets the quantity, the two values are stored in one object and the setter replaced the whole object; keep them as separate variables.

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
  const [saved, setSaved] = useState(false);

  function handleAdd() {
    setQuantity(quantity + 1);
  }

  function handleRemove() {
    setQuantity(quantity - 1);
  }

  function handleSave() {
    setSaved(!saved);
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
        <button type="button" className="save" aria-pressed={saved} onClick={handleSave}>
          {saved ? "Saved" : "Save for later"}
        </button>
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
