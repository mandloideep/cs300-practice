---
title: Read the window size on resize
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [width-shown, width-follows-resize, width-is-state]
---

The browser knows plenty that React does not: the window size, the scroll position, whether the tab is visible, the time.
This step shows the window width on the page and then keeps it current with a `resize` listener added in an effect.
Watch the number as you make the browser window narrower and wider, before the listener and after it.

```predict
After you show the width and run, what happens to the number when you make the browser window narrower?
- It follows the window, because the cards reflow
= It stays the same, even though the cards reflow
- The page throws an error, because the width changed during a render
```

Suppose the page should say how wide the window is and how the cards are laid out at that width.
Start by reading the width once, as the initial value of a state.

```jsx file="src/App.jsx" action="insert-after" anchor="  const [savedAt, setSavedAt] = useState(null);"
  const [width, setWidth] = useState(window.innerWidth);
```

Show it under the lead sentence.

```jsx file="src/App.jsx" action="insert-after" anchor='      <p className="lead">{items.length} products in stock. Choose a category to narrow the list.</p>'
      <p className="viewport">The window is {width}px wide, so the cards {width < 480 ? "stack in one column" : "sit in a grid"}.</p>
```

Run the code.
The sentence shows the width of the result pane, which is the window as far as the code inside it is concerned.
Now make your browser window narrower, or wider.
The cards reflow, because CSS follows the window, but the number does not move.

The browser announces a change of size with a `resize` event on `window`.
Listening for it is a side effect with a second half, exactly like the timer in the last topic, so it goes in an effect with a cleanup.
Add it under the timer effect.

```jsx file="src/App.jsx" action="insert-after" anchor="  }, [savedAt]);"

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
```

The listener reads the new width and stores it with `setWidth`, and that setter is what brings the change into React: the state changes, `App` renders, the sentence updates.

Run the code and resize the window again.
The number follows the window, and below 480 pixels the sentence changes to one column.

## Read more

Reading one of the browser's values is easy.
The work is in hearing about it when it changes, because the window is outside React and will not re-render anything on its own.
Before the listener, `window.innerWidth` was read once, on the first render, and nothing had asked React to render since.

The effect adds the listener after the first render and never again, which is what the empty array says.
The cleanup removes the same function it added, so that if `App` ever leaves the page, or Strict Mode runs the effect twice, no stray listener keeps calling a setter on a component that is gone.

**If it breaks:** If the sentence never changes, the listener is not added, or it calls `setWidth` with the old value instead of reading `window.innerWidth` again.
If the console warns that `handleResize is not defined` in the cleanup, the function is declared outside the effect; keep both lines inside so that they share it.
If the sentence shows `undefined`, the state is read under a different name than `width`.

**Check:** Run the code and make the window narrower and wider: the sentence follows.
Press **Run checks**; the checks pretend the window is 777 pixels wide, fire a `resize` event, and read the sentence.

```quiz
Why does the cleanup pass `handleResize` to `removeEventListener`, the same function the effect added?
= The browser removes a listener only when it is given the very function that was added
- Any function with the same body removes it
- `removeEventListener("resize")` with no function removes every resize listener
> A listener is identified by the event name and the function object, so the cleanup must name the same `handleResize`; that is why both lines live inside the one effect.
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
