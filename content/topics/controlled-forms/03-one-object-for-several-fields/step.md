---
title: One object for several fields
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [AddProductForm]
required: [one-object-state, fields-keep-each-other, select-is-controlled]
---

The Price and Category fields are still uncontrolled: the browser owns them, and React has no idea what they hold.
We could give each one its own `useState` and its own handler, and for two or three fields that is a fine way to write a form.
This form will grow, so we keep every field in one object and write one handler that serves them all.

Replace the title state and its rule with the object and a handler.
The block starts with the state line and ends with the rule, both already there.

```jsx file="src/App.jsx" action="replace" anchor='  const [title, setTitle] = useState("");\n  const titleTooShort = title.trim().length < 3;'
  const [fields, setFields] = useState({ title: "", price: "", category: "beauty" });
  const titleTooShort = fields.title.trim().length < 3;
  const priceMissing = fields.price === "";

  function handleChange(event) {
    setFields({ ...fields, [event.target.name]: event.target.value });
  }
```

Read `handleChange` from the inside out.
`...fields` spreads a copy of every current field into a new object.
`[event.target.name]` is a **computed property name**: the key is not typed in the code but read from the input's `name` attribute when the handler runs, so a keystroke in the field named `price` writes the `price` key.
`event.target.value` is the new text.
The result is a new object with every field as it was and one field changed, and that new object is what we hand to `setFields`.

We never write `fields.title = ...`.
Assigning to a property of the object React already holds would leave it the same object, and React would skip the render; Step 5 shows that mistake on screen.

Now point the note and the three inputs at the object.
The inputs already carry `name="title"`, `name="price"`, and `name="category"`, which is what makes the one handler work.

```jsx file="src/App.jsx" action="replace" anchor='      <p className="form-note">{title ? "Adding " + title : "Type a title to begin."}</p>'
      <p className="form-note">{fields.title ? "Adding " + fields.title : "Type a title to begin."}</p>
```

```jsx file="src/App.jsx" action="replace" anchor='        <input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />'
        <input name="title" type="text" value={fields.title} onChange={handleChange} />
```

```jsx file="src/App.jsx" action="replace" anchor='      {title !== "" && titleTooShort && <p className="form-error">The title needs at least 3 characters.</p>}'
      {fields.title !== "" && titleTooShort && <p className="form-error">The title needs at least 3 characters.</p>}
```

```jsx file="src/App.jsx" action="replace" anchor='        <input name="price" type="number" min="0" step="0.01" />'
        <input name="price" type="number" min="0" step="0.01" value={fields.price} onChange={handleChange} />
```

```jsx file="src/App.jsx" action="replace" anchor='        <select name="category">'
        <select name="category" value={fields.category} onChange={handleChange}>
```

A `<select>` is controlled the same way as a text input: `value` on the `select` element names the chosen option, and `onChange` reports a new choice.
A checkbox is the one exception; it uses `checked` and `event.target.checked`, because a checkbox has no text.

The button now waits for a price as well.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="submit" disabled={titleTooShort}>Add product</button>'
      <button type="submit" disabled={titleTooShort || priceMissing}>Add product</button>
```

Run the code with the **Tree and state** view open and select `AddProductForm`.
The state is one object with three keys.
Type a title, then a price, then choose a category: each keystroke changes one key and leaves the other two alone, because the spread copied them.

**Check:** Run the code and type `Kiwi` as the title and `2.49` as the price, then choose **Groceries**.
All three fields keep their values, the note reads `Adding Kiwi`, and the button is enabled.
In the inspector tree, `AddProductForm` holds one object whose `title`, `price`, and `category` match the fields.
Press **Run checks** to confirm.

**If it breaks:** If the first keystroke makes the result go blank and the console says `Cannot read properties of undefined (reading 'trim')`, the spread `...fields` is missing from `handleChange`, so the new object has only one key and `fields.title` is gone.
If typing in a field does nothing, that field has no `name` attribute, or its `name` does not match a key in the object.
If the console warns about a component changing an input from controlled to uncontrolled, a key is missing from the initial object, so `fields.price` is `undefined` on the first render.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

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

  return (
    <form className="add-form">
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

  function handleSelect(nextCategory) {
    setCategory(nextCategory);
  }

  function handleAdd(product) {
    console.log("New product:", product);
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
