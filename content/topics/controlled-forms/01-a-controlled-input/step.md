---
title: A controlled input
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [AddProductForm]
required: [title-is-state, typing-updates-note, no-readonly-warning]
---

**We used this in:** [Events and lifting state](#/topic/events-and-lifting-state) ended with a form that read its fields from the DOM at submit time; this topic makes React own the fields instead.

Open `src/App.jsx`.
The product page still has the `AddProductForm` under the list, but its submit handler is gone, so the button does nothing useful yet; Step 4 writes a new one.
If the result goes blank and comes back empty while you work, you pressed Enter in a field: the browser submitted the form the old way and reloaded the page, which is exactly what Step 4 fixes.

In Week 5 the browser owned what was in an input, and we read `input.value` whenever we needed it.
In React the component's **state** owns the value, and the input only displays it.
That is a **controlled input**, and it takes two attributes: `value`, which tells the input what to show, and `onChange`, which updates the state on every keystroke.

Give the form a `title` state at the top of `AddProductForm`.
The block starts with the first line of the component and ends with its `return (` line, both already there, so you type the state line between them.

```jsx file="src/App.jsx" action="replace" anchor="function AddProductForm({ onAdd }) {\n  return ("
function AddProductForm({ onAdd }) {
  const [title, setTitle] = useState("");

  return (
```

The initial value is the empty string, not `null` or nothing at all, because an input's value is always a string, and React warns when a controlled input starts without one.

Now connect the state to the input.
Type the `value` attribute first, on its own, because this is the mistake we see most in this session and you should see what it does.

```jsx file="src/App.jsx" action="replace" anchor='        <input name="title" type="text" />'
        <input name="title" type="text" value={title} />
```

Run the code and try to type in the Title field.
Nothing appears.
The console has a warning from React: you provided a `value` prop without an `onChange` handler, which renders a read-only field.
Here is why.
The input shows whatever `title` holds, `title` is `""`, and nothing ever changes it, so React puts `""` back after every keystroke.

Add the other half.

```jsx file="src/App.jsx" action="replace" anchor='        <input name="title" type="text" value={title} />'
        <input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
```

`onChange` is an event handler like the `onClick` from [State and useState](#/topic/state-usestate), and it receives the same kind of event object.
`event.target` is the input, and `event.target.value` is what the field holds after the keystroke.
Each keystroke now runs the handler, the handler stores the new text in state, React re-renders the form, and the input displays the stored text.
The round trip takes less than a frame, so it feels like an ordinary text field.

Because the value is in state, any part of the component can use it.
Show it above the fields.

```jsx file="src/App.jsx" action="insert-after" anchor="      <h2>Add a product</h2>"
      <p className="form-note">{title ? "Adding " + title : "Type a title to begin."}</p>
```

Run the code with the **Tree and state** view open and select `AddProductForm`.
Type `Kiwi` in the Title field: the note reads `Adding Kiwi`, and the state in the tree changes with every letter.
Nothing queried the DOM to find out what was typed.
The state is the single source of truth, and the input and the note are two views of it.

**Check:** Run the code.
The note reads `Type a title to begin.`
Type `Kiwi` in the Title field: the field shows it, the note reads `Adding Kiwi`, and `AddProductForm` in the inspector tree holds the string `"Kiwi"`.
Press **Run checks** to confirm; the last check reads the console for React's read-only warning.

**If it breaks:** If you cannot type in the field, the input has `value` without `onChange`, or the handler calls `setTitle` with something other than `event.target.value`.
If the console says `title is not defined`, the state line is outside `AddProductForm` or below its `return`.
If the field works but the note stays at `Type a title to begin.`, the note reads something other than `title`.

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

  return (
    <form className="add-form">
      <h2>Add a product</h2>
      <p className="form-note">{title ? "Adding " + title : "Type a title to begin."}</p>
      <label>
        Title
        <input name="title" type="text" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
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
      <button type="submit">Add product</button>
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
