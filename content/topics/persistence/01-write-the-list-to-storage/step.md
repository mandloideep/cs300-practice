---
title: Write the list to storage
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, ProductCard]
required: [storage-written-on-load, storage-follows-toggle]
---

**We used this in:** [Effects](#/topic/effects) wrote the product list to `localStorage` from an effect; this topic makes that write survive a page load, which is the half we skipped.

A saved list that lives only in state is gone on the next load, and this step writes the saved ids to `localStorage` from an effect, the first of the two halves that keep it.
Watch the lead sentence when you run the page again, and the stored string in your browser's developer tools after each save.

```predict
Before any edit, you save two products and press **Run** again; what does the lead sentence say?
- `2 of 6 products saved for later.`
= `0 of 6 products saved for later.`
- Nothing: the page fails because the saved ids are missing
```

Open `src/App.jsx`.
This is a trimmed product page with one feature: a **Save for later** button on each card, and a list of saved ids in `App`.
Run it, save two products, and read the lead sentence: `2 of 6 products saved for later`.
Press **Run** again: the saved products are gone, because `savedIds` started from `[]` as it does on every load.

The plan has two halves: write the ids whenever they change, and read them back when the page loads.
This step is the write, and it is the same effect as in the last topic.
Import `useEffect`.

```jsx file="src/App.jsx" action="replace" anchor='import { useState } from "react";'
import { useEffect, useState } from "react";
```

Add the effect under the state.
The fence starts with a blank line, so the effect sits on its own below the state line.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [savedIds, setSavedIds] = useState([]);"

  useEffect(() => {
    localStorage.setItem("saved-for-later", JSON.stringify(savedIds));
  }, [savedIds]);
```

`JSON.stringify` turns the array into text such as `[1,6]`, and the dependency array makes the write happen after every change to `savedIds`.

Run the code and save a product.
To see the stored string, open your browser's developer tools, choose the Application tab, open Local Storage, and pick this site's address: the key `cs300-lab:sandbox:saved-for-later` holds the ids.

## Read more

Everything a shopper saves lives in state, and state lives exactly as long as the page.
In Week 6 we kept data across page loads with `localStorage`, which stores strings under a key in this browser, for this site, until something removes them.

`localStorage` holds strings only, which is why the effect stringifies the array, and the dependency array means the write happens after every change to `savedIds` and never otherwise.
The effect also runs after the first render, which writes `[]` on load; that is harmless, and the next step makes it correct.

The result page shares storage with this site itself, so the site keeps your code's keys in a scope of their own with that prefix, and clears that scope before each run so that every step starts clean; your code sees the key as `saved-for-later`, and in your own Vite project it would be stored as `saved-for-later` too.

**If it breaks:** If the key never appears, `setItem` is outside the effect, or the key is spelled differently.
If the stored value is `1,6` without brackets, the array was stored without `JSON.stringify`, so the browser turned it into text its own way.
If the value lags one change behind the screen, the dependency array names something other than `savedIds`.

**Check:** Run the code and save two products.
The stored value under `saved-for-later` is a JSON array with their two ids.
Press **Run checks** to confirm; the checks read the key before and after toggling a product.

```quiz
You save Essence Mascara Lash Princess (id 1) and then Calvin Klein CK One (id 6); what string does the effect write under `saved-for-later`?
- `1,6`
= `[1,6]`
- `[object Object]`
> `JSON.stringify` writes the array as JSON, brackets included, which `JSON.parse` can turn back into an array; without it the browser turns the array into `1,6` its own way.
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

export default function App() {
  const [savedIds, setSavedIds] = useState([]);

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
