---
title: Cancel the request itself with AbortController
mode: edit
entry: src/main.jsx
inspector:
  views: [network, flow]
  watch: [App, ProductList]
api:
  default: fixtures
required: [old-request-aborted, first-run-aborted]
---

**We used this in:** [Lists and keys](#/topic/lists-and-keys), where the request code we gave you already passed a `signal` to `fetch`.

This step replaces the `cancelled` flag with an `AbortController`, which stops the old request itself instead of ignoring its answer.
Watch the **Network** view: the old row ends `aborted` the moment the category changes.

```demo name="abort-controller"
```

The starter is the code from the end of the last step, with the flag that ignores a stale answer.
A controller has a `signal` and an `abort()` method: passing the signal to `fetch` connects the request to the controller, and calling `abort()` makes `fetch` reject right away.

## Let the request accept a signal

Give `loadProducts` a second parameter and hand it to `fetch`.

```js file="src/api.js" action="replace" anchor="export async function loadProducts(category) {"
export async function loadProducts(category, signal) {
```

```js file="src/api.js" action="replace" anchor='  const response = await fetch(import.meta.env.API_BASE + "/products/category/" + category + "?limit=4");'
  const response = await fetch(import.meta.env.API_BASE + "/products/category/" + category + "?limit=4", { signal });
```

The second argument of `fetch` is an options object, and `{ signal }` is shorthand for `{ signal: signal }`.

## Replace the flag with a controller

Create the controller where the flag was.

```jsx file="src/App.jsx" action="replace" anchor="    let cancelled = false;"
    const controller = new AbortController();
```

Pass its signal to the request.

```jsx file="src/App.jsx" action="replace" anchor="    loadProducts(category)"
    loadProducts(category, controller.signal)
```

The success branch no longer needs a guard: an aborted request never resolves, so its `then` never runs.

```jsx file="src/App.jsx" action="replace" anchor='        if (!cancelled) {\n          setRequest({ status: "success", products, error: null });\n        }'
        setRequest({ status: "success", products, error: null });
```

The failure branch does, because an aborted request rejects, and an `AbortError` is not something to show the shopper.

```jsx file="src/App.jsx" action="replace" anchor="        if (!cancelled) {"
        if (!controller.signal.aborted) {
```

Finally, the cleanup aborts instead of flipping a flag.

```predict
After this edit, run the code and change the category to **Groceries** while Beauty is still loading; how does the beauty row end in the **Network** view?
- `ok`, with a `stale` badge, as in the last step
= `aborted`, before the groceries row settles
- Still pending, because nothing ever answers it
```

```jsx file="src/App.jsx" action="replace" anchor="    return () => {\n      cancelled = true;\n    };"
    return () => controller.abort();
```

When the category changes, React runs the previous cleanup, and that run's controller aborts its request.

## Read more

### Why ignoring is not enough

The flag from the last step ignores an answer.
The request still runs to the end: the browser keeps the connection open, the server does the work, and the bytes arrive only to be thrown away.
On a phone with a slow connection, or a server that charges per request, that waste matters.
In Week 9 we met the tool that stops the work: `AbortController`.
When `abort()` makes `fetch` reject, the rejection is an `AbortError`, and the browser drops the connection.

### The options object and one controller per run

The options object that carries `signal` is the same one that carries `method` and `headers` for a POST.

Each run of the effect makes its own controller, the same way each run had its own flag.
When the category changes, React runs the previous cleanup, that run's controller aborts its request, and the new run starts a fresh one.

### A controller or a flag

Choose between the two tools by asking what the work is.
A request that can be cancelled should be, with a controller.
Work that cannot be cancelled, such as a timer that has already fired or a library that returns a promise with no signal, gets the flag.

**If it breaks:** If the console shows `AbortError` as a page error, the catch branch sets the error state without checking `controller.signal.aborted`.
If the page shows `Could not load products. signal is not defined`, `loadProducts` was not given the second parameter.
If every request ends `aborted` and the page never loads, `controller.abort()` is called inside the effect body instead of inside the returned cleanup.

**Check:** Run the code, and while Beauty is still loading, change the category to **Groceries**.
Open the **Network** view.
The beauty row ends `aborted` the moment you change the category, before the groceries row settles, so it carries no `stale` badge; the page never had a wrong answer to ignore.
The first row of the run is `aborted` too: that is Strict Mode's first effect run, cleaned up before the second run sends the request that ends `ok`.
Click the `ok` row and the editor highlights the `fetch` line in `src/api.js`.
Press **Run checks**, then try the **DummyJSON** preset and switch categories quickly: the aborted rows are real cancelled connections now, not answers thrown away.

```quiz
Why does the `catch` branch still check `controller.signal.aborted`?
- Because an aborted request resolves with an empty list
= Because an aborted request rejects with an `AbortError`, which is not something to show the shopper
- Because `abort()` only takes effect inside a `catch`
> `abort()` makes `fetch` reject right away, so the cancelled request lands in `catch`; the check keeps it from writing the error state.
```

<details>
<summary>src/api.js after this step</summary>

```js
export async function loadProducts(category, signal) {
  const response = await fetch(import.meta.env.API_BASE + "/products/category/" + category + "?limit=4", { signal });
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
  const [category, setCategory] = useState("beauty");
  const [request, setRequest] = useState({ status: "loading", products: [], error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", products: [], error: null });
    loadProducts(category, controller.signal)
      .then((products) => {
        setRequest({ status: "success", products, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", products: [], error: error.message });
        }
      });
    return () => controller.abort();
  }, [category]);

  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Products from the API source chosen in the toolbar.</p>
      <div className="controls">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
          </select>
        </label>
      </div>
      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}
      {request.status === "error" && <p role="alert" className="message message--error">Could not load products. {request.error}</p>}
      {request.status === "success" && <ProductList items={request.products} />}
    </main>
  );
}
```

</details>
