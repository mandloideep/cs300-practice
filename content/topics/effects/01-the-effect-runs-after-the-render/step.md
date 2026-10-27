---
title: The effect runs after the render
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash]
  watch: [App, ProductList]
required: [effect-logs-after-render, count-matches-screen]
---

**We used this in:** [Controlled forms](#/topic/controlled-forms) finished the product page with a form that adds to the list; this topic starts from that page.

Everything a component has done so far happens inside React: state in, JSX out.
Sometimes a component has to reach outside, to the console, to `localStorage`, to a timer, or to the browser window, and the question is always when.
The answer is **after the render**, and this step lets you see why it cannot be during.

Suppose we want to log how many cards are on the page each time it changes.
Import `useEffect` next to `useState`, because we will need it in a moment.

```jsx file="src/App.jsx" action="replace" anchor='import { useState } from "react";'
import { useEffect, useState } from "react";
```

Now try the obvious thing: count the cards in the body of `App`, under the state.
The fence starts with a blank line, so the log sits on its own below the state lines.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [items, setItems] = useState(products);"

  console.log("Rendering: the page shows", document.querySelectorAll(".product").length, "cards");
```

Run the code with **Boundaries** and **Re-render flash** open.
The console says the page shows `0` cards, twice under Strict Mode, while six cards are right there in the result.
Add a product: `App` flashes, a seventh card appears, and the console says `6`.
The count is always one step behind, because the body of `App` runs while React is still working out what the page should look like.
When the line runs, React has not touched the DOM yet; the cards it describes do not exist until the function has returned and React has committed the result.

That is what `useEffect` is for.
Replace the log with an effect.

```jsx file="src/App.jsx" action="replace" anchor='  console.log("Rendering: the page shows", document.querySelectorAll(".product").length, "cards");'
  useEffect(() => {
    console.log("After render: the page shows", document.querySelectorAll(".product").length, "cards");
  });
```

`useEffect` takes a function and asks React to run it after the component has rendered and the page has been updated.
It is a hook, like `useState`, so the same rules apply: call it at the top level of the component, in the same order every time.

Run the code again.
The console now says `6` on load, and `7` after you add a product.
Watch the order of things on a click: the flash marks the render, the new card is on the page, and only then does the effect run and count it.
React draws first and runs your effect after, every time.

**Check:** Run the code and press **Beauty**.
The flash shows `App` and the list rendering, two cards remain, and the console gets one `After render` line that says `2`.
Press **All**, and the line says `6`.
Press **Run checks** to confirm; the checks click a category and compare the number in the newest log line with the cards on the screen.

**If it breaks:** If the console says `useEffect is not defined`, the import on the first line still names only `useState`.
If the number in the log is one step behind the screen, the log is still in the body of `App` rather than inside the effect.
If no line appears after a click, the effect has a second argument; leave it out for now, because the next step is about that argument.

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
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2>Add a product</h2>
      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin."}</p>
      <label>
        Title
        <input name="title" type="text" value={fields.title} onChange={handleChange} />
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

  useEffect(() => {
    console.log("After render: the page shows", document.querySelectorAll(".product").length, "cards");
  });

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
      <CategoryFilter category={category} onSelect={handleSelect} />
      <ProductList items={items} category={category} />
      <AddProductForm onAdd={handleAdd} />
    </main>
  );
}
```

</details>
