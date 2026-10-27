---
title: Add to the list without mutating it
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, ProductList]
required: [list-grows, new-product-filters]
---

`App` receives each new product and only logs it, and this step adds it to the list.
Type the mistake first, `push` into the array React holds, because it is the one bug in this session that produces no error anywhere.
Watch the lead sentence and the list when you submit, then again after the fix.

```demo name="mutation-vs-copy"
```

Replace the log in `handleAdd` with the way you would add to an array in Week 3.

```predict
After you replace the log with `push` and `setItems(items)`, run, and add `Kiwi`, what does the page show?
- A seventh card, Kiwi, at the end of the list
- An error in the console about changing state directly
= The form clears, and the lead sentence and the list still show six products
```

```jsx file="src/App.jsx" action="replace" anchor='    console.log("New product:", product);'
    items.push(product);
    setItems(items);
```

Run the code, type `Kiwi` and `2.49`, and press **Add product**.
The form clears, so the submit worked, and then nothing: the lead sentence still says six, there is no seventh card, and the console is empty.
Press **Run checks** and read the first check; it submitted a product too and reports that the screen did not change.
`push` changed the array React already holds, so `setItems(items)` handed React the same array, and React skipped the render.

A setter always gets a new value.
Replace the two lines with a new array.

```jsx file="src/App.jsx" action="replace" anchor="    items.push(product);\n    setItems(items);"
    setItems([...items, product]);
```

Run the code and add the product again.
The seventh card appears, the lead says seven, and the inspector tree shows the new array on `App`.

## Read more

The last topic ended by appending to the list with `[...items, product]`, and we told you why; this step showed what the other way looks like on screen.

Here is what happened.
`push` changed the array that React is already holding, in place.
`setItems(items)` then handed React that same array, React compared the new value with the old one with `Object.is`, found the same array, and skipped the render.
The product is in there; a `console.log(items)` would show seven.
The screen will show it only after something else makes `App` render, which is a bug that appears far from its cause.

The same rule covers every change to an array or an object in state.
Build a new one and hand it over; never change the one React holds.

| Change | Write |
| --- | --- |
| Add to an array | `setItems([...items, product])` |
| Remove from an array | `setItems(items.filter((item) => item.id !== id))` |
| Change one item | `setItems(items.map((item) => (item.id === id ? { ...item, price } : item)))` |
| Change one field of an object | `setFields({ ...fields, title })` |

`push`, `splice`, `sort` on the array itself, and assignment to a property all change the value in place, and React will not notice.

**If it breaks:** If the form clears but the list does not change, `handleAdd` still pushes into `items`; call `setItems` with a new array.
If the console says `items is not iterable`, the spread is applied to something other than the array, or the state line in `App` has changed.
If the new card shows `$NaN`, the form is sending the price as text; check `Number(fields.price)` in `handleSubmit`.

**Check:** Run the code, choose **All**, and add `Kiwi` at `2.49` in the groceries category.
It appears as the last card, the lead sentence goes up by one, and choosing **Groceries** shows it among the groceries.
Press **Run checks** to confirm.

```quiz
Which call removes a product from `items` in a way React will notice?
- `items.splice(index, 1)` and then `setItems(items)`
= `setItems(items.filter((item) => item.id !== id))`
- `delete items[index]` and then `setItems(items)`
> `filter` returns a new array, so `Object.is` sees a different value and React renders; `splice` and `delete` change the array React already holds, and handing back the same array changes nothing on screen.
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
    setItems([...items, product]);
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
