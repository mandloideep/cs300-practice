---
title: Clean up a timer
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App]
required: [notice-clears, timer-cleaned-up]
---

The `Saved at` notice stays on the page forever, which makes it easy to ignore.
It should disappear two seconds after it appears, the way a toast message does, so this step starts a timer in an effect and then stops it in a cleanup.
Watch what happens to the notice when you add two products within two seconds of each other, before the cleanup and after it.

```demo name="effect-timeline"
```

Add a second effect under the first one.
The fence starts with a blank line, so the new effect sits below the closing line of the old one.

```predict
After you add this effect and run, you add two products one second apart; when does the notice disappear?
= About one second after the second add, when the first timer fires
- Two seconds after the second add
- Never, because a second timer is still waiting
```

```jsx file="src/App.jsx" action="insert-after" anchor="  }, [items]);"

  useEffect(() => {
    if (!savedAt) return;
    const timer = setTimeout(() => setSavedAt(null), 2000);
  }, [savedAt]);
```

When a save sets a new date, this effect starts a two-second timer, and when the timer fires it sets `savedAt` back to `null`, which hides the notice.

Run the code and add a product.
The notice appears and goes away two seconds later.
Now add two products within two seconds of each other.
The second notice disappears early, because the first timer was still running and it cleared whatever notice was on the page when it fired.

An effect can return a **cleanup function**, and React calls it before the effect runs again and when the component goes away.
Return one that stops the timer.

```jsx file="src/App.jsx" action="insert-after" anchor="    const timer = setTimeout(() => setSavedAt(null), 2000);"
    return () => clearTimeout(timer);
```

Open the **Flow** view and add one product.
After the submit trace and the effect trace from Step 2 comes a third trace, two seconds later, with no event at its top: `setSavedAt` called from the timer, and a render of `App` that removes the notice.

## Read more

A timer is a side effect with a second half: something you start must also be stopped.

This effect depends on `savedAt`.
When the notice is cleared, `savedAt` is `null`, and the effect returns at once because there is nothing to time.
Before the cleanup, every save started a timer, and nothing ever stopped one.

Read the sequence for two quick saves.
The first save sets `savedAt`, the effect runs and starts timer A.
The second save sets `savedAt` again; before running the effect for the new value, React calls the cleanup from the previous run, which clears timer A, and then the effect starts timer B.
Only the latest timer is ever alive, so the notice always gets its full two seconds.

The third trace in the Flow view is what a cleanup protects, a setter that fires later, from a render that has already moved on.

The same shape covers every effect that starts something: `setInterval` and `clearInterval`, `addEventListener` and `removeEventListener`, and the `AbortController` whose `abort` we called in Week 10's fetch step.
Start it in the effect, stop it in the cleanup.

**If it breaks:** If the notice never disappears, the timer is not started, or the setter inside it is called with something other than `null`.
If the notice disappears early after two quick saves, the effect does not return a cleanup, or the cleanup clears a different variable than the one the timer was stored in.
If the console says `savedAt is not defined` inside the effect, the effect is outside `App`.

**Check:** Run the code and add a product.
The notice shows for two seconds and disappears.
Add two products one second apart: the notice stays until two seconds after the second one.
Press **Run checks** to confirm; the checks add two products a second apart and watch the notice, so they take about four seconds.

```quiz
When does React call the function an effect returns?
= Before the effect runs again, and when the component goes away
- Right after the effect runs, before the timer can fire
- Only when the browser tab is closed
> That timing is what makes two quick saves safe: the second save's effect is preceded by the first run's cleanup, so timer A is cleared before timer B starts.
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
