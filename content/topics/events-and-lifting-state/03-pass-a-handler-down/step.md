---
title: Pass a handler down and call it from the child
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App, CategoryFilter, ProductList]
required: [handler-passed-down, click-filters-list]
---

Data now flows down: `App` owns `category` and both children read it, and what is missing is the way back up.
This step has `App` pass a function down as a prop, and the filter calls it when a button is clicked: **data down, actions up**.
Watch the **Flow** view draw one click as an event, a prop call, a setter, and a re-render.

```predict
When this step is done and you press **Beauty**, which code calls `setCategory`?
- The button's `onClick` in `CategoryFilter`, directly
= `handleSelect` in `App`, called through the `onSelect` prop
- Nothing; React updates the prop on its own when the button changes
```

The buttons live in `CategoryFilter`, the state lives in `App`, and a child must never change a prop, so the filter cannot set `category` itself.

Write the handler in `App`, under the state.
The block starts with the state line and ends with the `return (` line, both already there, so you type the function between them.

```jsx file="src/App.jsx" action="replace" anchor='  const [category, setCategory] = useState("all");\n  return ('
  const [category, setCategory] = useState("all");

  function handleSelect(nextCategory) {
    setCategory(nextCategory);
  }

  return (
```

Pass it to the filter as a prop named `onSelect`.

```jsx file="src/App.jsx" action="replace" anchor="      <CategoryFilter category={category} />"
      <CategoryFilter category={category} onSelect={handleSelect} />
```

The `on` prefix marks the prop as a callback, something for the child to call.

In the child, receive the prop and call it from the click.

```jsx file="src/App.jsx" action="replace" anchor="function CategoryFilter({ category }) {"
function CategoryFilter({ category, onSelect }) {
```

```jsx file="src/App.jsx" action="replace" anchor='        <button key={option.id} type="button" aria-pressed={category === option.id}>'
        <button key={option.id} type="button" aria-pressed={category === option.id} onClick={() => onSelect(option.id)}>
```

`CategoryFilter` does not know what `onSelect` does, and it does not need to: it reports "the shopper chose this id" and lets the owner of the data decide what happens.

Run the code.
The inspector opens on the **Flow** view this time, next to **Boundaries**.
Press **Beauty** and read the trace from the top.

1. The click event, on a button inside `CategoryFilter`.
2. `onSelect`, passed by `App` to `CategoryFilter`, called with `"beauty"`.
3. `setCategory` in `App`, from `"all"` to `"beauty"`.
4. The components that rendered as a result: `App`, `CategoryFilter`, `ProductList`, and the two `ProductCard`s that remain.

Hover a row to see the components it names light up in the result.

## Read more

The answer to the missing way up is the other half of the React rule: **data down, actions up**.
`App` passes a function down as a prop, and the child calls that function when something happens.
The function belongs to `App`, so when it runs it can call `setCategory` even though the click happened two components below.

The names follow the course convention: the parent's function is `handleSomething`, and the prop it travels in is `onSomething`.
The `on` prefix tells whoever reads `CategoryFilter` that this prop is a callback, something to call, not a value to display.

Not knowing what `onSelect` does is what keeps the filter reusable: the same component could drive a different list, or a request to a server, without a change to its code.

The trace is the sequence we drew on the board in Session 1, recorded from a real click.
Every click you make from now on in React follows this shape: an event in a child, a callback up to the owner, a setter, and a re-render that flows back down.

**If it breaks:** If the console says `onSelect is not a function`, `App` does not pass the prop, or passes it under a different name than the child destructures.
If pressing a button filters the list but the trace shows the setter without a prop call, the child received `setCategory` directly; passing `handleSelect` keeps the decision in `App`.
If the list never changes, `handleSelect` is not calling `setCategory`, or the button calls `onSelect` without an argument.

**Check:** Run the code and press **Beauty**.
The list shows the two beauty products, the Beauty button fills in, and the flow view shows the event, the `onSelect` call, the `setCategory` call in `App`, and the render set.
Press **All** and the six products return.
Press **Run checks** to confirm.

```quiz
What does `CategoryFilter` need to know about the `onSelect` prop it receives?
- That it calls `setCategory`, so the filter can call `setCategory` itself
= Only that it is a function to call with the chosen category id
- Which components will render after it runs
> The child reports what happened and leaves the decision to the owner of the data, which is why the same filter could drive a different list without a change to its code.
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

export default function App() {
  const [category, setCategory] = useState("all");

  function handleSelect(nextCategory) {
    setCategory(nextCategory);
  }

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock. Choose a category to narrow the list.</p>
      <CategoryFilter category={category} onSelect={handleSelect} />
      <ProductList items={products} category={category} />
    </main>
  );
}
```

</details>
