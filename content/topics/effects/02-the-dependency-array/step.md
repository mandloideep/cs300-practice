---
title: The dependency array
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App]
required: [notice-updates-on-add, notice-ignores-filter, no-runaway-loop]
---

The effect from Step 1 runs after every render of `App`, including the renders where nothing it cares about changed, such as a category click.
`useEffect` takes a second argument, the **dependency array**, that says which values the effect depends on, and React runs the effect only after a render in which one of them changed.
This step turns the log into a notice that says when the list last changed; watch its time after an add and after a category click.

```demo name="effect-timeline"
```

Add the state under the other two.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [items, setItems] = useState(products);"
  const [savedAt, setSavedAt] = useState(null);
```

Now replace the log with a setter, and type the dependency array as `[]` first, because "run it once, when the component appears" is the first instinct most people have.

```jsx file="src/App.jsx" action="replace" anchor='  useEffect(() => {\n    console.log("After render: the page shows", document.querySelectorAll(".product").length, "cards");\n  });'
  useEffect(() => {
    setSavedAt(new Date());
  }, []);
```

Show the notice under the lead sentence.

```predict
With the array as `[]`, you run, wait a few seconds, and add a product; what does the notice do?
- It changes to the time of the add
= It keeps the time the page loaded
- It disappears, because the list changed
```

```jsx file="src/App.jsx" action="insert-after" anchor='      <p className="lead">{items.length} products in stock. Choose a category to narrow the list.</p>'
      {savedAt && <p className="notice" role="status">List changed at {savedAt.toLocaleTimeString()}</p>}
```

Run the code.
The notice appears with the time the page loaded.
Wait a few seconds, add a product, and look at the notice: the time did not move.
An empty array tells React that the effect depends on nothing, so it runs after the first render and never again.

The effect should run when `items` changes, so say so.

```jsx file="src/App.jsx" action="replace" anchor="  }, []);"
  }, [items]);
```

Run again and add a product: the time updates.
Press a category: the time stays, because `category` is not in the array and `items` is the same array as before.

Open the **Flow** view and add a product.
The first trace is the submit: `onAdd`, `setItems`, and a render of `App` and its children.
The second trace has no event at its top, because it started in the effect: `setSavedAt` ran after the render, and React rendered `App` again to show the new time.

## Read more

With `[]`, the list changed and the notice was wrong, with no error anywhere; a wrong dependency array fails silently.

React compares each dependency with its value from the previous render using `Object.is`, the same comparison a setter uses, which is one more reason that `[...items, product]` matters: a pushed-into array would be the same array, and the effect would not run.

An effect that sets state always costs a second render, which is fine here and is why the array must be right.

There are three ways to write the second argument.

| Second argument | The effect runs |
| --- | --- |
| `[items]` | After the first render, and after any render where `items` changed |
| `[]` | After the first render only |
| none | After every render |

Do not try the third one with this effect.
With no array, the effect runs after every render, it calls `setSavedAt` with a new date, that causes a render, the effect runs again, and so on without end.
React logs `Maximum update depth exceeded` and keeps going, and the lab would slow to a crawl.
The check reads the console for that message, and the last step of this topic shows what the loop looks like so that you recognize it when it happens to you.

**If it breaks:** If the notice never changes after an add, the array is still `[]`, or it names something other than `items`.
If the notice changes when you press a category, the array is missing or includes `category`.
If the console fills with `Maximum update depth exceeded`, the array is missing; press **Run** again as soon as you have added it, which throws the runaway run away.

**Check:** Run the code.
The notice shows the load time.
Wait until the clock has moved on, add a product, and the notice shows the new time; press a category, and it does not change.
Press **Run checks** to confirm.

```quiz
Which second argument makes the notice update after an add but not after a category click?
- `[]`
= `[items]`
- `[items, category]`
- No second argument
> The effect runs only after a render in which a listed value changed; a category click changes `category` but leaves `items` the same array, so `[items]` skips it, while `[]` never runs again and no array runs every time.
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
      {savedAt && <p className="notice" role="status">List changed at {savedAt.toLocaleTimeString()}</p>}
      <CategoryFilter category={category} onSelect={handleSelect} />
      <ProductList items={items} category={category} />
      <AddProductForm onAdd={handleAdd} />
    </main>
  );
}
```

</details>
