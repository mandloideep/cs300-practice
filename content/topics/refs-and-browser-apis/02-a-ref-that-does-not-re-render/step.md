---
title: A ref that does not re-render
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash]
  watch: [App]
required: [save-count-climbs, no-extra-state]
---

A ref can hold more than an element.
It can hold any value that a component needs to remember between renders without showing it, and this step finds out why neither a plain variable nor state does that job.

Suppose we want the console to say how many times the save effect has run, as a debugging aid.
Try the obvious thing, a variable in the body of `App`.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [savedAt, setSavedAt] = useState(null);"
  let saves = 0;
```

Count in the effect, right after the write.

```jsx file="src/App.jsx" action="insert-after" anchor='    localStorage.setItem("products", JSON.stringify(items));'
    saves += 1;
    console.log("Save", saves, "wrote", items.length, "products");
```

Run the code and add two products.
The load logs `Save 1` and `Save 2`, because Strict Mode ran the first render's effect twice, and then every product you add logs `Save 1` again.
Each render is a fresh call of `App`, and `let saves = 0` runs again on every call, so a variable in the body lives for exactly one render and then starts over.

State would remember the number, but a setter also re-renders the component, and nobody displays this number.
Watch the flash view while you add a product: `App` already renders twice, once for the new item and once for `setSavedAt` in the effect, and a `setSaves` would add a third render for a value that never reaches the page.

A ref is the third option: remembered across renders, like state, and silent when it changes, like a plain variable.
Replace the variable with a ref.

```jsx file="src/App.jsx" action="replace" anchor="  let saves = 0;"
  const saves = useRef(0);
```

```jsx file="src/App.jsx" action="replace" anchor="    saves += 1;"
    saves.current += 1;
```

```jsx file="src/App.jsx" action="replace" anchor='    console.log("Save", saves, "wrote", items.length, "products");'
    console.log("Save", saves.current, "wrote", items.length, "products");
```

Run the code again.
The console says `Save 1` and `Save 2` on load, because Strict Mode runs the effect twice and the ref survives the double run, and each product you add logs the next number.
`App` still flashes twice per add, no more: the ref changed in between and asked for nothing.
Open the **Tree and state** view: `App` lists three state values and no `saves`, because a ref is not part of what React watches.

| | Plain variable | State | Ref |
| --- | --- | --- | --- |
| Survives a re-render? | No | Yes | Yes |
| Changing it re-renders? | No | Yes | No |
| Use it for | A value needed during this render only | A value the page shows | A value to remember that the page does not show |

Timer ids, the previous value of a prop, and whether a request is still in flight are the usual tenants of a ref.
A value the shopper can see belongs in state, because a ref change would leave the screen stale.

**Check:** Run the code and add two products.
The `Save` lines count up, and `App` flashes twice per add.
Press **Run checks** to confirm.

**If it breaks:** If every line says `Save 1`, the counter is still a plain variable in the body of `App`.
If the console says `saves.current is not a function` or `Cannot read properties of undefined`, the ref is read without `.current`, or `useRef` is called outside `App`.
If `App` gained a fourth state value, the counter went into `useState`; it belongs in `useRef`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useEffect, useRef, useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99 }
];

const categories = [
  { id: "all", label: "All" },
  { id: "beauty", label: "Beauty" },
  { id: "fragrances", label: "Fragrances" },
  { id: "groceries", label: "Groceries" }
];

function CategoryFilter({ category, onSelect }) {
  return (
    <div className="filter" role="group" aria-label="Category">
      {categories.map((option) => (
        <button key={option.id} type="button" aria-pressed={category === option.id} onClick={() => onSelect(option.id)}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ProductCard({ product }) {
  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items, category }) {
  const visible = category === "all" ? items : items.filter((product) => product.category === category);
  if (visible.length === 0) {
    return <p role="status" className="message">No products in this category.</p>;
  }
  return (
    <ul className="product-list">
      {visible.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

function AddProductForm({ onAdd }) {
  const [fields, setFields] = useState({ title: "", price: "", category: "beauty" });
  const titleTooShort = fields.title.trim().length < 3;
  const priceMissing = fields.price === "";
  const titleRef = useRef(null);

  useEffect(() => {
    titleRef.current.focus();
  }, []);

  function handleChange(event) {
    setFields({ ...fields, [event.target.name]: event.target.value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onAdd({
      id: Date.now(),
      title: fields.title.trim(),
      category: fields.category,
      price: Number(fields.price)
    });
    setFields({ title: "", price: "", category: "beauty" });
    titleRef.current.focus();
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2>Add a product</h2>
      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin."}</p>
      <label>
        Title
        <input name="title" type="text" value={fields.title} onChange={handleChange} ref={titleRef} />
      </label>
      {fields.title !== "" && titleTooShort && <p className="form-error">The title needs at least 3 characters.</p>}
      <label>
        Price
        <input name="price" type="number" min="0" step="0.01" value={fields.price} onChange={handleChange} />
      </label>
      <label>
        Category
        <select name="category" value={fields.category} onChange={handleChange}>
          <option value="beauty">Beauty</option>
          <option value="fragrances">Fragrances</option>
          <option value="groceries">Groceries</option>
        </select>
      </label>
      <button type="submit" disabled={titleTooShort || priceMissing}>Add product</button>
    </form>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [items, setItems] = useState(products);
  const [savedAt, setSavedAt] = useState(null);
  const saves = useRef(0);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(items));
    saves.current += 1;
    console.log("Save", saves.current, "wrote", items.length, "products");
    setSavedAt(new Date());
  }, [items]);

  useEffect(() => {
    if (!savedAt) return;
    const timer = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(timer);
  }, [savedAt]);

  function handleSelect(nextCategory) {
    setCategory(nextCategory);
  }

  function handleAdd(product) {
    setItems([...items, product]);
  }

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{items.length} products in stock. Choose a category to narrow the list.</p>
      {savedAt && <p className="notice" role="status">Saved at {savedAt.toLocaleTimeString()}</p>}
      <CategoryFilter category={category} onSelect={handleSelect} />
      <ProductList items={items} category={category} />
      <AddProductForm onAdd={handleAdd} />
    </main>
  );
}
```

</details>
