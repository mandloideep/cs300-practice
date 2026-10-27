---
title: Submit from state and reset
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App, AddProductForm]
required: [submit-is-prevented, submit-sends-product, form-resets]
---

Run the starter, type a title and a price, and press **Add product**.
The result goes blank for a moment and comes back with an empty form.
The browser submitted the form the way it did before JavaScript existed, by loading a new page, and the state went away with the old one.
A React form needs a submit handler for the same reason the Week 5 form did: to stop that navigation and do the work itself.

Write the handler under `handleChange`.
The block starts with `handleChange`, which is already there, so you type the new function below it.

```jsx file="src/App.jsx" action="replace" anchor="  function handleChange(event) {\n    setFields({ ...fields, [event.target.name]: event.target.value });\n  }"
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
```

Three things happen, in order.
`event.preventDefault()` stops the page from reloading, exactly as in Week 5 and in the last topic.
The product is built from state: there is no `form.elements`, no `querySelector`, and no reading the DOM, because the values were in `fields` all along; `trim` drops stray spaces and `Number` turns the price text into a number.
`onAdd` is the callback prop from [Events and lifting state](#/topic/events-and-lifting-state), so the product travels up to `App`, and then `setFields` puts the initial object back, which empties every field, because the inputs show whatever the state holds.
There is no `form.reset()` to call; resetting the state is resetting the form.

Attach the handler to the form, not to the button.

```jsx file="src/App.jsx" action="replace" anchor='    <form className="add-form">'
    <form className="add-form" onSubmit={handleSubmit}>
```

`onSubmit` on the form runs whether the shopper clicks the button or presses Enter in a field.
An `onClick` on the button would miss the Enter key, and the browser would reload the page.

Run the code, type `Kiwi` and `2.49`, choose **Groceries**, and press **Add product**.
The console logs the product object, the form clears, and the page stays put.
Read the flow view: the submit event in `AddProductForm`, the `onAdd` call that `App` passed down, and the `setFields` call that cleared the form, followed by a render of `AddProductForm` alone.
`App` only logged the product, so nothing in `App` changed and the list did not render; Step 5 fixes that.

**Check:** Run the code, fill in the three fields, and press **Add product**.
The page does not reload, the console shows `New product:` with your title, and the fields are empty again.
Press **Run checks** to confirm; the first check watches whether the submit event was prevented.

**If it breaks:** If the result goes blank and comes back, `event.preventDefault()` is missing, or the handler is on the button's `onClick` instead of the form's `onSubmit`.
If the console says `onAdd is not a function`, the form no longer destructures `{ onAdd }` from its props.
If the product logs `price: NaN`, the price is read from the wrong key, or the field's `name` is not `price`.
If the fields keep their text after the submit, `setFields` is called with something other than the initial object.

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
