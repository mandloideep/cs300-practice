---
title: Load the products from an API
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [one-products-request, uses-api-base, products-render]
---

So far the products have been an array typed into `App.jsx`, and real product data comes from a server.
In this step the same page loads its products over the network, and we see every state a request can be in: loading, loaded, empty, and failed.
Watch the page and the inspector's **Network** view together: each state of the request has its own message on the page.

```predict
`loadProducts` only throws an error for now; when you run the starter, what does the page show?
- `Loading products...`, and it never finishes
= `Could not load products. loadProducts is not written yet.`
- `No products match this category.` in both sections
```

We prepared two pieces for you.
`src/api.js` holds a `loadProducts` function that for now only throws an error.
`App` calls it once when the page first appears, using `useEffect`, and remembers the result with `useState`.
Effects and state are Week 11 and Week 12 topics, so read that block as "after the first render, call `loadProducts`, then store either the products or the error message".

Run the starter.
The page shows `Could not load products. loadProducts is not written yet.`, which is our error branch from Step 3 doing its job.

The toolbar above the editor has an **API source** selector; leave it on **Fixtures**, which answers requests from files that come with the step.
Our code never names a server: it reads the chosen base URL from `import.meta.env.API_BASE`.

## Write the request

Open `src/api.js` and replace the line that throws with a real request.

```js file="src/api.js" action="replace" anchor='  throw new Error("loadProducts is not written yet.");'
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8", { signal });
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  const data = await response.json();
  return data.products;
```

The request asks for eight products, throws when the status is not ok, and returns `data.products`, the array our components expect.

## Show the loading state

Between the first render and the response, the page currently shows the empty message, which is wrong: nothing has been checked yet.
Add a loading branch in `App`, before the error branch.

```jsx file="src/App.jsx" action="replace" anchor="      {error ? ("
      {request.status === "loading" ? (
        <p role="status" className="message">Loading products...</p>
      ) : error ? (
```

The questions are now asked in this order: is it still loading, did it fail, is it empty, and only then show the list.
That order is the whole lesson of this topic in one place.

## Read more

In Week 7 we fetched JSON with `fetch`, `async`, and `await`.
The practice checkbox from Step 3 is gone, because the network can now fail for real.

### Choose where the data comes from

The **API source** selector has three kinds of entry.

- **Fixtures** answers requests inside this page from files that come with the step, so it works offline and always returns the same data.
  It also has controls to add latency, answer with an HTTP error status, send a malformed body, or drop the connection.
- **A preset** is a real public server, such as DummyJSON, chosen from a list.
- **Custom** is any base URL you type, for example your own server or a classmate's deployment.

Our code never names a server.
It reads the chosen base URL from `import.meta.env.API_BASE`, which the lab fills in from the selector, the same way a Vite project reads settings from `import.meta.env`.
Switching the source never means editing the request code.

### The request, line by line

Line by line, as in Week 7:

- `fetch` sends a GET request to the base URL plus `/products?limit=8`; the query string asks for eight products.
- `{ signal }` connects the request to the `AbortController` in `App`, so React can cancel it if the component goes away.
- `fetch` only rejects when the network fails, so `response.ok` is how we notice a 404 or a 500; throwing turns that into our error state.
- `response.json()` parses the body.
- The server answers with an object shaped like `{ products: [...], total, skip, limit }`, so we return `data.products`, the array our components expect.

### Cause each state on purpose

Once the check passes, cause each state on purpose and watch the page and the network panel together.

1. Set the fixture latency to 2000 milliseconds and run: `Loading products...` shows for two seconds, then the list.
2. Choose an HTTP error such as 500: the request row ends as an HTTP error and the page shows our error message with the status.
3. Choose a malformed body: the status is 200, but `response.json()` fails, and the page shows the parse error.
4. Change `/products?limit=8` to `/products-empty` in `src/api.js` and run: the fixtures answer with an empty `products` array, both sections say no products match, and no error appears.
   Change the path back afterwards.

Then try at least one real server.
Choose the **DummyJSON** preset and run again.
The request now goes to `https://dummyjson.com/products?limit=8`, takes noticeably longer than the fixtures, and returns real products in the same shape, so the same components render them without any change.
Our fixture file was copied from that response, which is why both sources work.
If you choose a preset whose data has a different shape, such as JSONPlaceholder, the request fails with a 404 because that server has no `/products` path, and our error state explains it.

**If it breaks:** If the network panel shows a request URL that contains `undefined`, check the spelling of `import.meta.env.API_BASE`.
If the page goes blank and the console says `request.products.filter is not a function`, `loadProducts` returned the whole `data` object instead of `data.products`.
If the network panel shows two `ok` requests, the cleanup line `return () => controller.abort();` was removed from `App`.
If a custom server fails with a CORS message in the console, the server is not allowing requests from this page; that is a server setting, not a bug in your code.

**Check:** Run the code with **Fixtures** selected.
Eight products appear, split into Top rated and All products.
Open the **Network** view of the inspector.
You see a request to `/products?limit=8` that ends `ok` with status 200, and you may also see one marked `aborted`.
That aborted row is expected: in development, React's Strict Mode runs every effect twice on purpose to expose missing cleanup, and our cleanup cancels the first request.
Click the `ok` row and the editor highlights the `fetch` line in `src/api.js`.

```quiz
The server answers a request with status 500; what does `fetch` do?
- It rejects, so the error goes straight to the `catch`
= It resolves with a response whose `ok` is `false`, so our code throws to reach the error state
- It retries the request until the server answers 200
> `fetch` rejects only when the network itself fails; an HTTP error status still arrives as a response, which is why `loadProducts` checks `response.ok`.
```

<details>
<summary>src/api.js after this step</summary>

```js
export async function loadProducts(signal) {
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8", { signal });
  if (!response.ok) {
    throw new Error(`The server answered with status ${response.status}.`);
  }
  const data = await response.json();
  return data.products;
}
```

</details>

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useEffect, useState } from "react";
import { loadProducts } from "./api.js";

function ProductCard({ product, variant = "card" }) {
  return (
    <article className={`product product--${variant}`}>
      <h3>{product.title}</h3>
      {variant === "card" && <p className="product-meta">{product.category}, rated {product.rating} of 5</p>}
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items, variant = "card" }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products match this category.</p>;
  }
  return (
    <ul className={`product-list product-list--${variant}`}>
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} variant={variant} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [request, setRequest] = useState({ status: "loading", products: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    loadProducts(controller.signal)
      .then((products) => setRequest({ status: "success", products, error: null }))
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", products: [], error: error.message });
        }
      });
    return () => controller.abort();
  }, []);

  const error = request.error;
  const visibleProducts = category === "all" ? request.products : request.products.filter((product) => product.category === category);
  const topRated = visibleProducts.filter((product) => product.rating >= 4.5);
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
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
      </div>
      {request.status === "loading" ? (
        <p role="status" className="message">Loading products...</p>
      ) : error ? (
        <p role="alert" className="message message--error">Could not load products. {error}</p>
      ) : (
        <>
          <h2>Top rated</h2>
          <ProductList items={topRated} variant="row" />
          <h2>All products</h2>
          <ProductList items={visibleProducts} />
        </>
      )}
    </main>
  );
}
```

</details>
