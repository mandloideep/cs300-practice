---
title: Focus an input on mount
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [AddProductForm]
required: [title-focused-on-load, title-focused-after-submit, ref-is-not-state]
---

**We used this in:** [Effects](#/topic/effects) finished the product page with effects that save the list and clear a notice; this topic starts from that page.

A few browser features need the DOM element itself, not the JSX that describes it: focusing a field, scrolling to a section, measuring a box, playing a video.
This step uses `useRef` to get a handle on the Title input, and an effect to focus it as soon as the page loads; watch where the cursor is after each run and after each submit.

```predict
Once the ref is in place, what does the inspector tree list for `AddProductForm`?
= One state value, the fields object
- Two state values, the fields object and the ref
- No state, because the ref replaces the fields
```

The form should put the cursor in the Title field as soon as the page loads, so that a shopper can start typing.
Import `useRef` next to the other two hooks.

```jsx file="src/App.jsx" action="replace" anchor='import { useEffect, useState } from "react";'
import { useEffect, useRef, useState } from "react";
```

Create the ref in `AddProductForm`, under the two rules.

```jsx file="src/App.jsx" action="insert-after" anchor='  const priceMissing = fields.price === "";'
  const titleRef = useRef(null);
```

`useRef(null)` returns an object with one property, `current`, which starts as `null`.

Attach it to the input.

```jsx file="src/App.jsx" action="replace" anchor='        <input name="title" type="text" value={fields.title} onChange={handleChange} />'
        <input name="title" type="text" value={fields.title} onChange={handleChange} ref={titleRef} />
```

After React creates the input element on the page, it stores that element in `titleRef.current`.

Focus it after the first render.
The fence starts with a blank line, so the effect sits under the ref.

```jsx file="src/App.jsx" action="insert-after" anchor="  const titleRef = useRef(null);"

  useEffect(() => {
    titleRef.current.focus();
  }, []);
```

Run the code.
The Title field shows its focus ring and the cursor is in it, ready to type.
The lab moved your keyboard focus into the result to do that; click the editor to come back.

The cursor should also return to the title after a product is added, because clicking **Add product** moved the focus to the button.
Add one line to the end of `handleSubmit`.

```jsx file="src/App.jsx" action="insert-after" anchor='    setFields({ title: "", price: "", category: "beauty" });'
    titleRef.current.focus();
```

This is an event handler, not an effect, and that is fine: by the time a shopper submits, the input has existed for a long while.

## Read more

React draws the page from JSX, and most of the time we never touch the DOM elements it creates.
`useRef` gives us a handle on an element, and an effect is where we use it, because the element exists only after the render.

Unlike state, a ref is the same object on every render, and changing `current` does not make React render.
That is why the inspector tree still lists one state value on `AddProductForm`: the ref is not state.

`ref` is a special attribute, like `key`: it is not passed as a prop.

Why an effect, and not a line in the body of the component?
During the first render `titleRef.current` is still `null`, because the input does not exist yet; an effect runs after React has put the input on the page.
The empty array is the "after the first render only" row of the table in the last topic.

The second `focus()` call lives in `handleSubmit`, and the rule it follows is only that a ref is never read during render.

**If it breaks:** If the console says `Cannot read properties of null (reading 'focus')`, the `.focus()` call runs in the body of the component, or the `ref` attribute is missing from the input, so `current` is still `null`.
If the console says `useRef is not defined`, the import on the first line does not name it.
If the field is focused on load but not after a submit, the second `focus()` call is missing from `handleSubmit`.

**Check:** Run the code.
The Title field has the focus.
Fill in the form and click **Add product** with the mouse: the product is added and the cursor is back in the Title field.
In the inspector tree, `AddProductForm` still holds one state value; the ref is not state.
Press **Run checks** to confirm, right after running, before clicking inside the result.

```quiz
Why does `titleRef.current.focus()` on load go in an effect rather than in the body of `AddProductForm`?
- The body of a component cannot call methods on DOM elements
= During the first render `titleRef.current` is still `null`, because the input is not on the page yet
- An effect runs before the render, so the field is focused before it is drawn
> React fills in `titleRef.current` only after it has created the input, and an effect runs after that, which is why the same call in the body fails with `Cannot read properties of null (reading 'focus')`.
```

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

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(items));
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
