---
title: Move the state up and pass it down
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, CategoryFilter, ProductList]
required: [state-lives-in-app, both-children-receive-it, page-agrees-with-app]
---

When two components need the same value, the value moves up to the closest component that contains both of them.
Here that is `App`, which renders `CategoryFilter` and `ProductList`.
`App` will own the state and pass it down to each child as a prop; React calls this **lifting state up**.

Start by taking the state out of the filter.
Delete the `useState` line inside `CategoryFilter`.

```jsx file="src/App.jsx" action="delete" anchor='  const [category, setCategory] = useState("all");'
```

The filter still needs the value, so it now receives it as a prop.

```jsx file="src/App.jsx" action="replace" anchor="function CategoryFilter() {"
function CategoryFilter({ category }) {
```

The `aria-pressed` comparison keeps working as it is, because `category` is still a name in scope; it is a prop now instead of state.
The click handler, though, called `setCategory`, which no longer exists here, so take it off the button for this step.

```jsx file="src/App.jsx" action="replace" anchor='        <button key={option.id} type="button" aria-pressed={category === option.id} onClick={() => setCategory(option.id)}>'
        <button key={option.id} type="button" aria-pressed={category === option.id}>
```

The buttons will do nothing until Step 3, which gives the child a way to ask for a change.

Now let `ProductList` receive the same prop and use it.
The block starts with the first two lines of the component, which are already there, and adds the `visible` line between them.

```jsx file="src/App.jsx" action="replace" anchor="function ProductList({ items }) {\n  if (items.length === 0) {"
function ProductList({ items, category }) {
  const visible = category === "all" ? items : items.filter((product) => product.category === category);
  if (visible.length === 0) {
```

```jsx file="src/App.jsx" action="replace" anchor="      {items.map((product) => ("
      {visible.map((product) => (
```

`visible` is computed from the props on every render, not stored anywhere.
When the list only needs to derive something from values it already receives, a plain `const` is enough, and it can never fall out of step with the state it was derived from.

Finally, create the state in `App` and pass it to both children.
The block starts with the first line of `App`, which is already there.

```jsx file="src/App.jsx" action="replace" anchor="export default function App() {"
export default function App() {
  const [category, setCategory] = useState("all");
```

```jsx file="src/App.jsx" action="replace" anchor="      <CategoryFilter />\n      <ProductList items={products} />"
      <CategoryFilter category={category} />
      <ProductList items={products} category={category} />
```

Run the code with **Boundaries** and **Tree and state** open.
The tree shows the state on `App` now, and both children list `category` among their props with the same value, `"all"`.
To prove that one value drives both, change the initial value in `App` to `useState("groceries")` and run again: the Groceries button fills in and the list shows Apple and Cooking Oil, with no change to either child.
Put `"all"` back before moving on.

**Check:** Run the code.
In the inspector tree, `App` has one state value, `CategoryFilter` has none, and `category` appears in the props of both `CategoryFilter` and `ProductList`.
The pressed button and the list agree with `App`'s value.
Press **Run checks** to confirm.

**If it breaks:** If the console says `setCategory is not defined`, the `onClick` is still on the button in `CategoryFilter`; remove it for this step.
If the console says `category is not defined` in `ProductList`, the prop is destructured in `CategoryFilter` but not in `ProductList`, or `App` does not pass it to the list.
If every button looks unpressed, `App` passes the prop under a different name than the child destructures.

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

function CategoryFilter({ category }) {
  return (
    <div className="filter" role="group" aria-label="Category">
      {categories.map((option) => (
        <button key={option.id} type="button" aria-pressed={category === option.id}>
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

export default function App() {
  const [category, setCategory] = useState("all");
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock. Choose a category to narrow the list.</p>
      <CategoryFilter category={category} />
      <ProductList items={products} category={category} />
    </main>
  );
}
```

</details>
