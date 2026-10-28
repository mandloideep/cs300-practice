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
This step wraps the stored ids in an object with a version number, and gives the reader a check that refuses any shape it does not recognize.
Watch the page start cleanly, with nothing saved and no error, when the value in storage has a shape the reader does not know.

```demo name="json-roundtrip"
```

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
A value written by this version of the page has `version: 1`, and its `ids` are what we want; anything else is treated as nothing saved.

Point the state at the function.

```predict
After this change, the page loads with the plain array `[1,6]` from the last step still in storage; what does the lead sentence say?
- `2 of 6 products saved for later.`
= `0 of 6 products saved for later.`
- Nothing: the console shows `Cannot read properties of undefined (reading 'length')`
```

```jsx file="src/App.jsx" action="replace" anchor='  const [savedIds, setSavedIds] = useState(() => {\n    const stored = localStorage.getItem("saved-for-later");\n    return stored ? JSON.parse(stored) : [];\n  });'
  const [savedIds, setSavedIds] = useState(readSavedIds);
```

Note that this passes the function itself, `readSavedIds`, not a call, `readSavedIds()`.

Run the code.
If the plain array from the last step is still in storage, the page starts with nothing saved and no error, and the first toggle overwrites the old value with the new shape.

## Read more

A shopper who saved products last week still has `[1,6]` in their browser, and the page they open today may expect something else.
Suppose the next version of this page wants to remember more than the ids, such as when each product was saved.
If it reads `data.ids` from a value that is a plain array, it gets `undefined`, and the lead sentence crashes on `savedIds.length` with `Cannot read properties of undefined (reading 'length')`.
That is the bug this step prevents, and it is cheap to prevent on the first day and expensive to fix later.

Anything other than a `version: 1` object, including the plain array from the last step and whatever a future version writes, is treated as nothing saved, which is a worse outcome than reading it but a far better one than a crash.
A later version of the page can add a branch for `version === 1` that converts the old shape instead of discarding it.

Passing `readSavedIds` without parentheses is the same distinction as `onClick={handleAdd}` in [State and useState](#/topic/state-usestate): `useState` will call it, once, when it needs the initial value.

CS300 Practice's own progress file uses the same idea: it carries a `version` number, and a newer release of the site refuses a file from the future instead of guessing at it.

**If it breaks:** If the console says `Cannot read properties of undefined (reading 'length')`, the reader returns `data.ids` without checking the version, and an old array is in storage.
If the saved products no longer survive a reload, the writer and the reader disagree on the shape, such as `ids` on one side and `saved` on the other.
If the console says `readSavedIds is not defined`, the function is declared inside another function where `App` cannot see it; declare it at the top level of the file.
Writing `useState(readSavedIds())` raises no error at all, but it reads storage on every render instead of once, which is why the state line passes the function itself.

**Check:** Run the code and save a product.
The stored value is now an object, `{"version":1,"ids":[...]}`, and the ids match the marked products.
Press **Run checks** to confirm; this site's own test also loads the page with an old-style array in storage and confirms that it starts clean instead of crashing.

```quiz
Why is the state line `useState(readSavedIds)` rather than `useState(readSavedIds())`?
= Passing the function lets `useState` call it once, for the first render, while the call would read storage on every render
- `readSavedIds()` returns the function itself, not the ids
- `useState` accepts only functions declared with the `function` keyword
> It is the lazy initial state from the last step under a name: `useState` calls the function it is given when it needs the starting value, and an argument written as a call runs before every call of `useState`.
```

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
