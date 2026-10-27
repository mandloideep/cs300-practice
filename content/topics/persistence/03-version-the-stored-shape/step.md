---
title: Version the stored shape
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [stored-shape-is-versioned, ids-match-screen]
---

Stored data outlives the code that wrote it.
A shopper who saved products last week still has `[1,6]` in their browser, and the page they open today may expect something else.
Suppose the next version of this page wants to remember more than the ids, such as when each product was saved.
If it reads `data.ids` from a value that is a plain array, it gets `undefined`, and the lead sentence crashes on `savedIds.length` with `Cannot read properties of undefined (reading 'length')`.
That is the bug this step prevents, and it is cheap to prevent on the first day and expensive to fix later.

Store an object with a version number and the ids inside it.

```jsx file="src/App.jsx" action="replace" anchor='    localStorage.setItem("saved-for-later", JSON.stringify(savedIds));'
    localStorage.setItem("saved-for-later", JSON.stringify({ version: 1, ids: savedIds }));
```

Now the reader has to check the version before it trusts the shape.
That is more than one line, so give it a name above `App`.
The anchor is the first line of `App`, and the fence ends with a blank line so that the function sits above it.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
function readSavedIds() {
  const stored = localStorage.getItem("saved-for-later");
  if (!stored) return [];
  const data = JSON.parse(stored);
  return data.version === 1 ? data.ids : [];
}

```

Read the last line carefully.
A value written by this version of the page has `version: 1`, and its `ids` are what we want.
Anything else, including the plain array from the last step and whatever a future version writes, is treated as nothing saved, which is a worse outcome than reading it but a far better one than a crash.
A later version of the page can add a branch for `version === 1` that converts the old shape instead of discarding it.

Point the state at the function.

```jsx file="src/App.jsx" action="replace" anchor='  const [savedIds, setSavedIds] = useState(() => {\n    const stored = localStorage.getItem("saved-for-later");\n    return stored ? JSON.parse(stored) : [];\n  });'
  const [savedIds, setSavedIds] = useState(readSavedIds);
```

Note that this passes the function itself, `readSavedIds`, not a call, `readSavedIds()`.
It is the same distinction as `onClick={handleAdd}` in [State and useState](#/topic/state-usestate): `useState` will call it, once, when it needs the initial value.

Run the code.
If the plain array from the last step is still in storage, the page starts with nothing saved and no error, and the first toggle overwrites the old value with the new shape.
The lab's own progress file uses the same idea: it carries `version: 1`, and a newer lab refuses a file from the future instead of guessing at it.

**Check:** Run the code and save a product.
The stored value is now an object, `{"version":1,"ids":[...]}`, and the ids match the marked products.
Press **Run checks** to confirm; the lab's own test also loads the page with an old-style array in storage and confirms that it starts clean instead of crashing.

**If it breaks:** If the console says `Cannot read properties of undefined (reading 'length')`, the reader returns `data.ids` without checking the version, and an old array is in storage.
If the saved products no longer survive a reload, the writer and the reader disagree on the shape, such as `ids` on one side and `saved` on the other.
If the console says `readSavedIds is not a function`, the state line calls it with parentheses or the function is declared below `App` inside another function.

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

function readSavedIds() {
  const stored = localStorage.getItem("saved-for-later");
  if (!stored) return [];
  const data = JSON.parse(stored);
  return data.version === 1 ? data.ids : [];
}

export default function App() {
  const [savedIds, setSavedIds] = useState(readSavedIds);

  useEffect(() => {
    localStorage.setItem("saved-for-later", JSON.stringify({ version: 1, ids: savedIds }));
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
