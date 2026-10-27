---
title: Two components that need the same value
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, CategoryFilter, ProductList]
required: [filter-owns-state, pressed-follows-click]
---

**We used this in:** [State and useState](#/topic/state-usestate) gave `ProductCard` a click handler and state of its own; this topic puts the same tools in a component that is not the only one who needs the value.
This step gives a new `CategoryFilter` the chosen category as state, the way the last topic taught, and then shows why that is not enough.
Watch the list under the buttons when you press a category.

```predict
When this step is done and you press **Beauty**, what will the list under the buttons show?
- Only the two beauty products, because the filter remembers Beauty
= All six products, the same as before
- An error, because `ProductList` cannot find `category`
```

Open `src/App.jsx`.
The Week 10 product page has a new `CategoryFilter` component above the list: four buttons, one per category, that do nothing yet.
The plan is simple to say: the shopper presses a category, and the list shows only that category.

Start the way the last topic taught: the filter remembers which category is chosen.
Import `useState` on the first line.

```jsx file="src/App.jsx" action="replace" anchor="const products = ["
import { useState } from "react";

const products = [
```

Give `CategoryFilter` the chosen category as state.

```jsx file="src/App.jsx" action="replace" anchor="function CategoryFilter() {"
function CategoryFilter() {
  const [category, setCategory] = useState("all");
```

Mark the chosen button and let a click choose a different one.

```jsx file="src/App.jsx" action="replace" anchor='        <button key={option.id} type="button">'
        <button key={option.id} type="button" aria-pressed={category === option.id} onClick={() => setCategory(option.id)}>
```

`aria-pressed` is true for exactly one button, the one whose id matches the state, and the arrow function calls `setCategory` with that option's id when the button is clicked.

Run the code and press **Beauty**.
The button fills in, the inspector tree shows `CategoryFilter` with state `"beauty"`, and the list still shows all six products.
Two components need the same value, and it is stored where only one of them can reach it.
Step 2 moves it.

## Read more

`aria-pressed` is what the stylesheet looks for when it fills in the chosen button.
The handler needs to know which button was clicked, so it is an arrow function that calls `setCategory` with that option's id, which is still passing a function to `onClick`, not calling one.

Here is the problem.
`ProductList` should show only the beauty products, so it needs `category`.
But `category` is a local variable inside `CategoryFilter`, and `ProductList` is a different function; neither can see the other's variables.
`App` cannot read it either: data flows down from a parent to its children, and a parent has no way to look into a child's state.

Try it if you like: `items.filter((product) => product.category === category)` inside `ProductList` fails with `category is not defined`, because that name means nothing there.

**If it breaks:** If no button fills in, `aria-pressed` compares `category` with something other than `option.id`, for example `option.label`.
If pressing a button does nothing in the tree, the handler is `onClick={setCategory(option.id)}`, which calls the setter during render; wrap it in an arrow function.
If the console warns about an update inside a render, the same mistake is the cause.

**Check:** Run the code and press each category button in turn.
The pressed button fills in each time, the inspector tree shows `CategoryFilter` with the matching state, and the list below ignores it.
Press **Run checks** to confirm; the last check records the problem rather than a success, which is why it is not required.

```quiz
Why can `ProductList` not read the `category` that `CategoryFilter` holds?
- `ProductList` renders before `CategoryFilter`, so the value is not set yet
= State is a local variable of the component that calls `useState`, and data flows only down from a parent
- `category` is a string, and only objects can be shared between components
> `ProductList` and `CategoryFilter` are siblings: neither can see the other's variables, and their parent `App` cannot look into a child's state either, so the value has to live in `App`.
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

function CategoryFilter() {
  const [category, setCategory] = useState("all");
  return (
    <div className="filter" role="group" aria-label="Category">
      {categories.map((option) => (
        <button key={option.id} type="button" aria-pressed={category === option.id} onClick={() => setCategory(option.id)}>
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

function ProductList({ items }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products in this category.</p>;
  }
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock. Choose a category to narrow the list.</p>
      <CategoryFilter />
      <ProductList items={products} />
    </main>
  );
}
```

</details>
