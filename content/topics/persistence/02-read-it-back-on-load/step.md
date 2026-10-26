---
title: Read it back on load
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [screen-matches-storage-on-load, screen-matches-storage-after-toggle]
---

The ids are written, and nothing reads them.
The place to read them is the initial value of the state, because that is the one moment the component decides what it starts with.

`useState([])` starts from an empty array on every load.
We could write `useState(JSON.parse(localStorage.getItem("saved-for-later")))`, and it would work the first time, but it has two problems.
The argument is computed on every render, because JavaScript evaluates arguments before the call, even though `useState` only looks at it on the first render; reading and parsing storage on every keystroke is waste.
And when nothing is stored yet, `getItem` returns `null`, `JSON.parse(null)` is `null`, and `savedIds.length` in the lead sentence crashes with `Cannot read properties of null (reading 'length')`.

`useState` accepts a function instead of a value, and it calls that function once, on the first render only, to get the initial value.
That is a **lazy initial state**.
Replace the state line with one.

```jsx file="src/App.jsx" action="replace" anchor="  const [savedIds, setSavedIds] = useState([]);"
  const [savedIds, setSavedIds] = useState(() => {
    const stored = localStorage.getItem("saved-for-later");
    return stored ? JSON.parse(stored) : [];
  });
```

Read it as a tiny function: fetch the string, and if there is one, parse it, otherwise start empty.
`JSON.parse` undoes the `JSON.stringify` of the last step, so the array comes back as an array of numbers, the same shape the effect wrote.
The write effect does not change; it still runs after the first render and writes back what was just read, which is now the right value.

Run the code and save two products.
Then run the code again, keeping the result's storage, which is what a real page reload does.
The two products are still marked and the lead sentence still says `2 of 6`.
In the inspector tree, `App` holds those two ids from the first commit on; nothing clicked them, the initializer read them.

This pair, a lazy initial state that reads and an effect that writes, is the whole of persistence, and it is the pattern every Assignment 4 option uses.

**Check:** Run the code, save two products, and run it again with the storage kept.
The same two products are marked.
Press **Run checks**: the checks compare the marked products with the stored ids on load and after a toggle, and the lab's own test reloads the page to confirm the ids survive.

**If it breaks:** If the console says `Cannot read properties of null (reading 'length')`, the initializer returns `null` when nothing is stored; keep the `stored ? ... : []` fallback.
If the products come back unmarked after a reload, the function is missing its `return`, or `useState` is called with the result of the function instead of the function itself.
If the console warns that the initial state changed between renders, the parse runs outside the arrow function.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useEffect, useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99 }
];

function ProductCard({ product, saved, onToggle }) {
  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button type="button" className="save" aria-pressed={saved} onClick={() => onToggle(product.id)}>
        {saved ? "Saved for later" : "Save for later"}
      </button>
    </article>
  );
}

function ProductList({ items, savedIds, onToggle }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} saved={savedIds.includes(product.id)} onToggle={onToggle} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [savedIds, setSavedIds] = useState(() => {
    const stored = localStorage.getItem("saved-for-later");
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem("saved-for-later", JSON.stringify(savedIds));
  }, [savedIds]);

  function handleToggle(id) {
    setSavedIds(savedIds.includes(id) ? savedIds.filter((savedId) => savedId !== id) : [...savedIds, id]);
  }

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{savedIds.length} of {products.length} products saved for later.</p>
      <ProductList items={products} savedIds={savedIds} onToggle={handleToggle} />
    </main>
  );
}
```

</details>
