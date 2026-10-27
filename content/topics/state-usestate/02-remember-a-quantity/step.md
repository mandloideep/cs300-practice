---
title: Remember a quantity with useState
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [ProductCard]
required: [card-has-state, click-adds-one, cards-independent]
---

The handler from Step 1 can see a click, but the page cannot show it: nothing on the card changes.
This step gives each card a value of its own that it can change, how many of this product are in the cart, with `useState`.
Watch the inspector at the end: one click changes one card's number, and React calls only that card again.

```demo name="render-cycle"
```

That is **state**: data a component owns and can change.
When state changes, React calls the component again and updates the page, the way it did in [The React mental model](#/topic/react-mental-model).
The function that gives a component state is `useState`, and it comes from the `react` package, so import it on the first line of the file.
The block replaces the first line and ends with that same line, so you type the import and a blank line above it.

```jsx file="src/App.jsx" action="replace" anchor="const products = ["
import { useState } from "react";

const products = [
```

Forgetting this import is the most common `useState` error in our class, so check the first line whenever the console says `useState is not defined`.

Now give `ProductCard` a quantity, at the top of the component, before the handler.

```jsx file="src/App.jsx" action="replace" anchor="  function handleAdd() {"
  const [quantity, setQuantity] = useState(0);

  function handleAdd() {
```

`useState(0)` starts the state at `0` and returns a pair: `quantity` is the current value, and `setQuantity` is the updater function that asks React for a new one.

Change the handler so that it updates the value instead of logging.

```jsx file="src/App.jsx" action="replace" anchor='    console.log("Added to the cart:", product.title);'
    setQuantity(quantity + 1);
```

We never assign to `quantity`; it is a `const`.
`setQuantity(quantity + 1)` hands React the next value, and React takes it from there.

Finally, show the value on the card, under the price.

```predict
After you show the quantity, run, and click **Add to cart** once on the first card, what do the other five cards show?
- `In cart: 1`, because every card runs the same `ProductCard` code
= `In cart: 0`
- No `In cart` line until each of them is clicked
```

```jsx file="src/App.jsx" action="insert-after" anchor='      <p className="product-price">${product.price.toFixed(2)}</p>'
      <p className="product-cart">In cart: {quantity}</p>
```

Run the code with the inspector's **Tree and state** view open and select a `ProductCard`.
Its state reads `0`.
Click **Add to cart** on that card: the number on the card and the value in the tree both become `1`, and the changed value is marked in the inspector.
Click **Add to cart** on a different card: only that card's number changes.

## Read more

Props could not have held the quantity, because props are read-only and come from the parent, and the parent did not click anything.
A card needs a value of its own that it can change, and that is what state is for.

Read the `useState` line in three parts.
`useState(0)` creates the state with the initial value `0`.
It returns an array of two things, and the square brackets unpack them by position: array destructuring, which works like the object destructuring we use for props, but by position instead of by name.
`quantity` is the current value, and `setQuantity` is the updater function that asks React for a new one.
The names are ours; the convention is `[thing, setThing]`.

Each `ProductCard` called `useState` itself, so each one has its own quantity, and the others are untouched when one card is clicked.

**If it breaks:** If the console says `useState is not defined`, the import on the first line is missing or misspelled.
If the number never changes, check that the handler calls `setQuantity` and not `quantity`, and that the button still has `onClick={handleAdd}` from Step 1.
If every card changes together, the `useState` line is outside `ProductCard`; move it inside the component, before the `return`.

**Check:** Run the code.
Every card shows `In cart: 0`.
Click **Add to cart** three times on one card and once on another: the first reads 3, the second reads 1, and the rest still read 0.
In the inspector tree, each `ProductCard` shows its own state value.
Press **Run checks** to confirm.

```quiz
Why does the handler call `setQuantity(quantity + 1)` instead of writing `quantity = quantity + 1`?
- Both work; the setter is only shorter
= The setter stores the new value and asks React to call the component again
- `quantity` is a prop, so only the parent may change it
> `quantity` is a `const` snapshot for this render, so assigning to it fails, and even a `let` would change a local variable React never looks at; only the setter stores the value and starts a new render.
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

function ProductCard({ product }) {
  const [quantity, setQuantity] = useState(0);

  function handleAdd() {
    setQuantity(quantity + 1);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}, rated {product.rating} of 5</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <p className="product-cart">In cart: {quantity}</p>
      <button type="button" onClick={handleAdd}>Add to cart</button>
    </article>
  );
}

function ProductList({ items }) {
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
      <p className="lead">{products.length} products in stock.</p>
      <ProductList items={products} />
    </main>
  );
}
```

</details>
