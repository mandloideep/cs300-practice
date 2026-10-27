---
title: Validate as the user types
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [AddProductForm]
required: [error-while-typing, button-disabled-until-valid, validation-is-derived]
---

With the title in state we can check it on every keystroke, because the component re-renders on every keystroke and can compute anything it likes from the value.
This step adds a length rule, a message under the field, and a button that waits for a valid title.
Watch the inspector tree while you type: the rule changes what the page shows without adding anything to state.

```predict
After you add the `titleTooShort` line and run, how many state values does the inspector show on `AddProductForm`?
- Two: `title` and `titleTooShort`
= One: `title`
- None, because the rule replaced the state
```

Add the rule under the state line.

```jsx file="src/App.jsx" action="insert-after" anchor='  const [title, setTitle] = useState("");'
  const titleTooShort = title.trim().length < 3;
```

This is a plain `const`, not state: it is **derived** from the state and computed fresh on every render.

Show a message under the Title field when the rule fails.
The anchor is the first `</label>` in the form, the one that closes the Title field.

```jsx file="src/App.jsx" action="insert-after" anchor="      </label>"
      {title !== "" && titleTooShort && <p className="form-error">The title needs at least 3 characters.</p>}
```

While the field is empty the message stays away, and once there is text that is too short, it shows.

Disable the button while the rule fails.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="submit">Add product</button>'
      <button type="submit" disabled={titleTooShort}>Add product</button>
```

Run the code with the **Tree and state** view open and select `AddProductForm`.
Type `Ki`: the message appears and the button goes grey.
Type one more letter: the message disappears and the button comes back.
The tree still shows one state value, because nothing new was stored; the message and the button are both described from `title`.

## Read more

In Week 5 we validated a form when it was submitted, by reading each field and checking it.
A controlled field lets us check it on every keystroke instead.

When `title` changes, the component re-renders, the `titleTooShort` line runs again, and the rule is computed fresh.
Storing it in a second `useState` would mean keeping two values in step by hand, which is the bug we could never quite fix in the Week 8 CourseHub when several parts of the page each kept their own copy.
If a value can be computed from state or props, compute it; only store what cannot be computed.

Read the message's condition left to right.
While the field is empty, say nothing, because the shopper has not started.
When it has text that is too short, show the message.
Otherwise the expression is `false`, and React renders nothing for `false`, the `&&` pattern we used for empty lists in Week 10.

**If it breaks:** If the message shows before you type, the `title !== ""` guard is missing from the condition.
If the button never enables, the comparison in `titleTooShort` is reversed, or `disabled` is set to something other than `titleTooShort`.
If the message never appears, the paragraph sits inside the label, or the condition joins its parts with `||` instead of `&&`.

**Check:** Run the code.
With the field empty, there is no message and the button is disabled.
Type `Ki`: the message appears and the button stays disabled.
Type `Kiwi`: the message disappears and the button is enabled.
Press **Run checks** to confirm.

```quiz
With the Title field empty, `titleTooShort` is `true`; why is there no error message?
- The message appears only after the first submit
= The condition starts with `title !== ""`, which is `false`, and React renders nothing for `false`
- `titleTooShort` is not computed until the shopper types
> `&&` stops at the first `false` part, so the whole expression is `false` while the field is empty, and React draws nothing for it; the button still reads `titleTooShort` directly, which is why it is disabled.
```

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
  const [title, setTitle] = useState("");
  const titleTooShort = title.trim().length < 3;

  return (
    <form className="add-form">
      <h2>Add a product</h2>
      <p className="form-note">{title ? "Adding " + title : "Type a title to begin."}</p>
      <label>
        Title
        <input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      {title !== "" && titleTooShort && <p className="form-error">The title needs at least 3 characters.</p>}
      <label>
        Price
        <input name="price" type="number" min="0" step="0.01" />
      </label>
      <label>
        Category
        <select name="category">
          <option value="beauty">Beauty</option>
          <option value="fragrances">Fragrances</option>
          <option value="groceries">Groceries</option>
        </select>
      </label>
      <button type="submit" disabled={titleTooShort}>Add product</button>
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
