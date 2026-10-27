---
title: Add an item to a list in the parent from a child form
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App, AddProductForm, ProductList]
required: [items-are-state-in-app, form-receives-onadd, submit-adds-a-product]
---

The same pattern carries a whole object up, not only a category id: this step makes the products state in `App` and lets a child form add one.
The new product goes into a new array, never pushed into the old one, so watch how the setter gets its value.

```demo name="mutation-vs-copy"
```

We added an `AddProductForm` component under the list.
Run the starter, type a title and a price, and press **Add product**.
The console logs the new product object and nothing else happens, because the list is drawn from the `products` constant, which nothing can change.

Read `handleSubmit` in the form before changing it.
`event.preventDefault()` stops the browser from reloading the page, and `form.elements.title.value` reads the field named `title`, so the handler builds a product object from the three fields and then clears the form with `form.reset()`.

The list of products must become state, and it must live in `App`, because `ProductList` shows it and `AddProductForm` changes it.
Add it under the category state.

```jsx file="src/App.jsx" action="insert-after" anchor='  const [category, setCategory] = useState("all");'
  const [items, setItems] = useState(products);
```

`useState(products)` uses the constant as the initial value, so the page starts with the same six products.

Add a handler that appends a product, below `handleSelect`.
The block starts with `handleSelect`, which is already there, so you type the new function under it.

```jsx file="src/App.jsx" action="replace" anchor="  function handleSelect(nextCategory) {\n    setCategory(nextCategory);\n  }"
  function handleSelect(nextCategory) {
    setCategory(nextCategory);
  }

  function handleAdd(product) {
    setItems([...items, product]);
  }
```

`[...items, product]` builds a new array with the old items followed by the new one; a setter always gets a new value.

Draw the page from the state instead of the constant.

```jsx file="src/App.jsx" action="replace" anchor='      <p className="lead">{products.length} products in stock. Choose a category to narrow the list.</p>'
      <p className="lead">{items.length} products in stock. Choose a category to narrow the list.</p>
```

```jsx file="src/App.jsx" action="replace" anchor="      <ProductList items={products} category={category} />"
      <ProductList items={items} category={category} />
```

Pass the handler to the form.

```jsx file="src/App.jsx" action="replace" anchor="      <AddProductForm />"
      <AddProductForm onAdd={handleAdd} />
```

In the form, receive the prop and call it with the product instead of logging.

```jsx file="src/App.jsx" action="replace" anchor="function AddProductForm() {"
function AddProductForm({ onAdd }) {
```

```predict
After the form calls `onAdd` and you add `Kiwi` at `2.49` with **All** chosen, what happens on the page?
- The console logs the product and the list stays at six cards
= A seventh card, Kiwi, appears at the end and the lead sentence says seven
- The page reloads and the list goes back to six cards
```

```jsx file="src/App.jsx" action="replace" anchor='    console.log("New product:", product);'
    onAdd(product);
```

Run the code, choose **All**, type `Kiwi` with the price `2.49` in the groceries category, and press **Add product**.
A seventh card appears at the end of the list, the lead sentence says seven, and the form clears.
Read the flow view.

1. The submit event, on the form inside `AddProductForm`.
2. `onAdd`, passed by `App` to `AddProductForm`, called with the product object.
3. `setItems` in `App`, from an array of 6 to an array of 7.
4. The render set: `App`, then every child, because `App` re-rendered and passed new props down.

## Read more

`event.preventDefault()` matters because reloading the page is what a submitted form does by default; the event object is the same one the DOM gave us in Week 5.
`event.target` is the form, which is why `form.elements` can reach each field by its `name`.

We never push into `items`: React compares the new value with the old one to decide whether anything changed, and a pushed-into array is the same array, so React would see no change and skip the render.

Compare the trace with the one from Step 3.
The shape is identical; only the names differ.
The form never touched the list, and the list never heard about the form; both only talk to `App`, which owns the data.

**If it breaks:** If the page reloads when you press the button, `event.preventDefault()` was removed from `handleSubmit`.
If the console says `onAdd is not a function`, `App` does not pass `onAdd={handleAdd}`, or the form does not destructure it.
If nothing appears and there is no error, `handleAdd` is pushing into `items` instead of calling `setItems` with a new array.
If the new product shows `$NaN`, the price is read as a string; wrap it in `Number(...)`.

**Check:** Run the code, choose **All**, and add a product.
It appears as the last card, the count in the lead sentence goes up by one, and the flow view shows the submit event, the `onAdd` call, the `setItems` call in `App`, and the render set.
Choose the new product's category: it is still there, filtered like the others.
Press **Run checks** to confirm.

```quiz
Why does `handleAdd` call `setItems([...items, product])` instead of `items.push(product)` followed by `setItems(items)`?
- `push` is slower than spreading for a list of six
= A pushed-into array is the same array, so React sees no change and skips the render
- `push` throws an error on an array that came from `useState`
> React decides whether state changed by comparing the new value with the old one; the spread builds a new array, so the comparison sees a change and the list renders the new card.
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
  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const product = {
      id: Date.now(),
      title: form.elements.title.value,
      category: form.elements.category.value,
      price: Number(form.elements.price.value)
    };
    onAdd(product);
    form.reset();
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <h2>Add a product</h2>
      <label>
        Title
        <input name="title" type="text" required />
      </label>
      <label>
        Price
        <input name="price" type="number" min="0" step="0.01" required />
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
