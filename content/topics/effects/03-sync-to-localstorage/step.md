---
title: Sync the list to localStorage
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [storage-holds-the-list, storage-follows-add, notice-says-saved]
---

The effect now runs exactly when the list changes, which is exactly when the list should be saved.
In Week 6 we kept data across page loads with `localStorage`, which stores strings under a key in the browser, and `JSON.stringify` turned our arrays into strings.
Writing to it is a side effect, something that reaches outside the component, so it belongs in the effect and nowhere else.

Add the write above the setter.

```jsx file="src/App.jsx" action="insert-before" anchor="    setSavedAt(new Date());"
    localStorage.setItem("products", JSON.stringify(items));
```

Every time `items` changes, React renders the new list, and then the effect writes the whole array under the key `products`.
We write the whole array rather than one product, because `localStorage` holds one string per key, and replacing it is simpler and safer than editing it.
The notice can now tell the truth.

```jsx file="src/App.jsx" action="replace" anchor='      {savedAt && <p className="notice" role="status">List changed at {savedAt.toLocaleTimeString()}</p>}'
      {savedAt && <p className="notice" role="status">Saved at {savedAt.toLocaleTimeString()}</p>}
```

Run the code and add a product.
To see the stored string, open your browser's developer tools, choose the Application tab, open Local Storage, and pick this site's address: the key `products` holds the JSON of the list, including the product you added.
The result page shares the browser's storage with the lab itself, so the key sits next to the lab's own `cs300-lab:` keys.

Nothing reads the value back yet, so a fresh run still starts from the six built-in products.
Reading it back on load is the subject of the persistence topic, and it takes one more idea, a lazy initial state, that we save for there.

**Check:** Run the code and add a product.
The notice says `Saved at` with the current time.
Press **Run checks**: the checks parse the `products` key and compare it with the list on the screen, before and after adding a product of their own.

**If it breaks:** If the stored value is missing, `setItem` is outside the effect, or the key is spelled differently.
If the stored value is `[object Object]` or a list of `[object Object]`, the array was stored without `JSON.stringify`.
If the stored list lags one product behind the screen, the effect depends on something other than `items`, so it ran for an older render.

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
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(items));
    setSavedAt(new Date());
  }, [items]);

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
