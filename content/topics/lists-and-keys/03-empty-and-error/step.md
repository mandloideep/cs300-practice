---
title: An empty state separate from an error
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, ProductList]
required: [list-renders, empty-state, error-state]
---

**We used this in:** [Components and props](#/topic/components-and-props) taught us to move a repeated piece into a component; the list now lives in `ProductList`.

An empty list and a failed load are very different situations, and this step gives each its own message.
The empty check goes in `ProductList`, which can tell when it is empty, and the error check goes in `App`, which knows whether loading failed.
Watch the space under the controls as you choose a category with no products and as you pretend the load failed.

```predict
In the starter, you choose Furniture, then choose All and check Pretend the load failed; what is under the controls each time?
= Nothing, both times
- A no-products message the first time and an error message the second
- An error message both times
```

We moved the list into a `ProductList` component that receives the products as an `items` prop, and added two controls above it.
The category menu filters the products, and the checkbox pretends that loading the data failed, which Step 5 replaces with a real request.
Both controls use `useState`, which we study in Week 11.

Run the starter and try both controls.

1. Choose **Furniture**: no product is in that category, and the page shows nothing under the controls.
2. Choose **All** again, then check **Pretend the load failed**: the page shows nothing again.

Add a guard clause at the top of `ProductList`.

```jsx file="src/App.jsx" action="insert-after" anchor="function ProductList({ items }) {"
  if (items.length === 0) {
    return <p role="status" className="message">No products match this category.</p>;
  }
```

When there are no items, `ProductList` returns the message and never reaches the `ul`, so the page has no empty list in it.

Replace the line in `App` that renders the list with a choice between the error and the list.

```jsx file="src/App.jsx" action="replace" anchor="      <ProductList items={visibleProducts} />"
      {error ? (
        <p role="alert" className="message message--error">{error}</p>
      ) : (
        <ProductList items={visibleProducts} />
      )}
```

When `error` holds a message, the page shows it and does not draw the list at all.

## Read more

Two very different situations looked identical in the starter.
In the first, everything worked and the answer is "none".
In the second, something broke, and the user should know that trying again might help.
A good page gives each its own message, as the status line in our Week 8 CourseHub build did.

A component may return early, like any function.
`role="status"` tells assistive technology that this text reports the result of what the user just did.

The error choice is the conditional operator from the JSX rules topic, split over several lines with parentheses around each branch.
`role="alert"` asks a screen reader to announce the message right away, which suits a failure.

Notice the order of the questions: first "did it fail?", then "is it empty?", then "show the list".
Checking empty first would say "No products match" when in fact we have no products because the load failed.

**If it breaks:** If the empty message appears when the load fails, the error check is missing in `App` or comes after the list.
If the console reports `Cannot read properties of undefined (reading 'length')`, the prop name used in `App` and the one destructured in `ProductList` differ.
If both messages appear at once, the empty check was written in `App` beside the error check instead of inside `ProductList`.

**Check:** Run the code and repeat both experiments.
**Furniture** shows `No products match this category.` with a dashed border.
**Pretend the load failed** shows the error message in the error color, even if Furniture is still selected.
Clear the checkbox and choose **All**, and the six products return.

```quiz
Why does `App` ask whether the load failed before `ProductList` asks whether the list is empty?
- Because a component can return early only once
= Because a failed load also leaves no products, so the empty check would answer first with the wrong message
- Because `role="alert"` must come before `role="status"` on a page
> The questions go in order: did it fail, is it empty, then show the list; asking "is it empty?" first would say no products match when the real answer is that loading failed.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

function ProductList({ items }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products match this category.</p>;
  }
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <span className="product-title">{product.title}</span>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [failed, setFailed] = useState(false);
  const loadedProducts = failed ? [] : products;
  const error = failed ? "The product list could not be loaded. Try again in a moment." : null;
  const visibleProducts = category === "all" ? loadedProducts : loadedProducts.filter((product) => product.category === category);
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Filter by category, or pretend the data failed to load.</p>
      <div className="controls">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={failed} onChange={(event) => setFailed(event.target.checked)} />
          Pretend the load failed
        </label>
      </div>
      {error ? (
        <p role="alert" className="message message--error">{error}</p>
      ) : (
        <ProductList items={visibleProducts} />
      )}
    </main>
  );
}
```

</details>
