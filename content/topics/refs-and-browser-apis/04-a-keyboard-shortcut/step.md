---
title: A keyboard shortcut
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [AddProductForm]
required: [slash-focuses-title, slash-ignored-in-fields]
---

Many sites let you press `/` to jump to their search box, wherever you are on the page.
This step gives the form the same shortcut, and it uses everything in this topic at once: a ref to the field, a listener on the window, and a cleanup.

Add a second effect in `AddProductForm`, under the one that focuses the field on load.
The anchor is the closing line of that effect, and the fence starts with a blank line.

```jsx file="src/App.jsx" action="insert-after" anchor="  }, []);"

  useEffect(() => {
    function handleKey(event) {
      if (event.key !== "/" || event.target.tagName === "INPUT") return;
      event.preventDefault();
      titleRef.current.focus();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);
```

Read the handler line by line.
The listener is on `window`, not on the form, because the shopper can press the key anywhere on the page, and a `keydown` event bubbles up to the window from wherever it started.
The first line ignores every key but `/`, and ignores `/` as well when the shopper is typing in a field, because then it is just a character, as in `1/2 lb apples`.
`event.preventDefault()` stops the browser from treating the key as its own shortcut, which some browsers use for quick find.
Then the ref does what it did in Step 1.

The dependency array is empty because the handler uses only `titleRef`, which is the same object on every render; the listener added after the first render stays correct for the life of the component.
The cleanup removes it, so that a form that leaves the page takes its shortcut with it.

Tell the shopper about the shortcut in the note.

```jsx file="src/App.jsx" action="replace" anchor='      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin."}</p>'
      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin, or press / to jump here."}</p>
```

Run the code, click somewhere in the result that is not a field, such as the heading, and press `/`.
The cursor lands in the Title field.
Type `1/2` into the Price field: the `/` stays a character, because the guard saw that the key was pressed in an input.

**Check:** Run the code, click the heading in the result, and press `/`: the Title field takes the focus.
Click the Price field and press `/`: the focus stays there.
Press **Run checks** to confirm; the checks fire the key events themselves.

**If it breaks:** If `/` does nothing, the listener is on the form instead of `window`, or the comparison is against the wrong key name; `event.key` for the slash is the one-character string `/`.
If pressing `/` in the Price field jumps to the Title, the guard on `event.target.tagName` is missing; tag names are uppercase, so compare with `"INPUT"`.
If the console says `titleRef is not defined`, the effect is in `App` instead of `AddProductForm`.

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

  useEffect(() => {
    function handleKey(event) {
      if (event.key !== "/" || event.target.tagName === "INPUT") return;
      event.preventDefault();
      titleRef.current.focus();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
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
      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin, or press / to jump here."}</p>
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
  const [width, setWidth] = useState(window.innerWidth);
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

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      <p className="viewport">The window is {width}px wide, so the cards {width < 480 ? "stack in one column" : "sit in a grid"}.</p>
      {savedAt && <p className="notice" role="status">Saved at {savedAt.toLocaleTimeString()}</p>}
      <CategoryFilter category={category} onSelect={handleSelect} />
      <ProductList items={items} category={category} />
      <AddProductForm onAdd={handleAdd} />
    </main>
  );
}
```

</details>
