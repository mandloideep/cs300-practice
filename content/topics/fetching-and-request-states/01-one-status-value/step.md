---
title: One status value instead of three booleans
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [one-request-state, one-branch-at-a-time, products-render]
---

**We used this in:** [Lists and keys](#/topic/lists-and-keys), where the product page first loaded its data from an API, and [Effects](#/topic/effects), where we learned that `useEffect` runs after the render.

This step keeps a request's loading, success, and error states in one value instead of three booleans, so the page can only be in one of them at a time.
Watch the error case: the starter shows the loading text and the error together, and the fix makes that impossible.

```demo name="fetch-timeline"
```

Run the starter.
The products load, so nothing looks wrong yet.
Now open the fixture controls under the API source selector and set **HTTP error** to `500 Internal Server Error`.

```predict
With **HTTP error** set to `500 Internal Server Error`, what does the starter page show when you run it again?
- Only the error message, `Could not load products. The server answered with status 500.`
= `Loading products...` and the error message at the same time
- `No products to show.`, because the list came back empty
```

Run again: the page shows `Loading products...` and the error message together, a state a real request can never be in.
Read `App`.
It keeps three values, `loading`, `error`, and `products`, and the `catch` branch sets `error` but never sets `loading` back to `false`.
Set the HTTP error back to **None** before going on.

## Keep the request in one value

Replace the three state lines with one object that carries a `status` and the data that goes with it.
The block starts with the `loading` line and ends with the `products` line, so you type one line in place of three.

```jsx file="src/App.jsx" action="replace" anchor="  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  const [products, setProducts] = useState([]);"
  const [request, setRequest] = useState({ status: "loading", products: [], error: null });
```

`status` is one of `"loading"`, `"success"`, and `"error"`.

Now each setter call becomes one call that writes the whole object.
When the request succeeds, store the products with the status.

```jsx file="src/App.jsx" action="replace" anchor="      .then((result) => {\n        setProducts(result);\n        setLoading(false);\n      })"
      .then((products) => {
        setRequest({ status: "success", products, error: null });
      })
```

When it fails, store the message with the status.

```jsx file="src/App.jsx" action="replace" anchor="      .catch((failure) => {\n        setError(failure.message);"
      .catch((error) => {
        setRequest({ status: "error", products: [], error: error.message });
```

There is no `setLoading(false)` to forget any more.

## Draw the page from the status

The three render lines asked three separate questions and had to agree with each other.
Ask one question instead.

```jsx file="src/App.jsx" action="replace" anchor='      {loading && <p role="status" className="message">Loading products...</p>}\n      {error && <p role="alert" className="message message--error">Could not load products. {error}</p>}\n      {!loading && !error && <ProductList items={products} />}'
      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}
      {request.status === "error" && <p role="alert" className="message message--error">Could not load products. {request.error}</p>}
      {request.status === "success" && <ProductList items={request.products} />}
```

Each line checks the status for one word, so at most one of them can be true.

## Read more

### Four states, one at a time

In Week 9 we drew the life of a request as four states: idle, loading, success, and error.
A request is in exactly one of them at a time.
The code we write has to say the same thing, and the easiest way to get that wrong is to keep one boolean per state.

The starter shows why.
Loading text above an error message is a state that cannot exist: a request is never still loading once it has failed.
Every place that writes the three values has to keep them agreeing with each other, and one of them did not.

### What the status holds

Our page asks for the products as soon as it appears, so it never sits in the fourth state, `"idle"`; a search page that waits for the shopper to type would start there.
An empty result is not a state of its own: it is `"success"` with zero products, and `ProductList` already shows a message for it.

Writing `status: "error"` is what ends the loading state, because the status is one value and it can only hold one word.
The `!loading && !error` line, which existed only to keep the booleans from contradicting each other, is gone.

**If it breaks:** If the console says `loading is not defined` or `setProducts is not defined`, one of the old names is still used somewhere; search `App` for `loading`, `error`, and `products` outside of `request`.
If the page stays on `Loading products...` after the request finished, the `then` branch stores a status that no render line checks for; the three words must match exactly.
If the page is blank with no message, `request.products` is not an array; `loadProducts` returns `data.products`, and the `then` callback should receive that array.

**Check:** Run the code with **Fixtures** selected.
`Loading products...` shows for a moment, then eight cards.
Open **Tree and state** in the inspector and select `App`: it has one state value, an object whose `status` is `success`.
Set **HTTP error** to `500 Internal Server Error` and run again: only the error message shows, with no loading text above it.
Open the **Network** view.
There are two requests to `/products?limit=8`, both `ok`, because in development React's Strict Mode runs every effect twice to expose missing cleanup, and this effect has none yet.
The second row is a duplicate of the first, which the network pane will mark with a `duplicate` badge; Step 3 makes it go away.
Set the HTTP error back to **None**, then try the **DummyJSON** preset: the same code renders real products in the same shape, and the single status value works the same on every source.

```quiz
The API answers `200` with an empty `products` array; which status does `request` hold afterwards?
- `"idle"`, because nothing came back
= `"success"`, with zero products for `ProductList` to report
- `"error"`, because an empty list is a failure
> An empty result is a successful answer, so the `then` branch stores `status: "success"`, and `ProductList` shows `No products to show.` for an empty array.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useEffect, useState } from "react";
import { loadProducts } from "./api.js";

function ProductCard({ product }) {
  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}, rated {product.rating} of 5</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products to show.</p>;
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
  const [request, setRequest] = useState({ status: "loading", products: [], error: null });

  useEffect(() => {
    loadProducts()
      .then((products) => {
        setRequest({ status: "success", products, error: null });
      })
      .catch((error) => {
        setRequest({ status: "error", products: [], error: error.message });
      });
  }, []);

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}
      {request.status === "error" && <p role="alert" className="message message--error">Could not load products. {request.error}</p>}
      {request.status === "success" && <ProductList items={request.products} />}
    </main>
  );
}
```

</details>
