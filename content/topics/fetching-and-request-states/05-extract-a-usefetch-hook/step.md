---
title: Extract a useFetch hook
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [hook-state-lives-in-app, products-render, retry-still-works]
---

**We used this in:** [Components and props](#/topic/components-and-props), where we pulled repeated markup out into a component so it could be written once and used many times.

This step moves the request logic out of `App` into a **custom hook**, `useFetch`, that any page can call; nothing on the page changes, and the hook's state still shows up under `App`.
Run the starter; it behaves exactly as it did at the end of the last step.

```predict
After `App` calls `useFetch` and you run, how many state values does **Tree and state** list for `App`?
- One, the category, because the request state moved into the hook
= Three: the category and the two values the hook declares
- Five: the three `App` had before, plus the hook's two
```

We made two preparations so the request code no longer knows about products.
`src/api.js` has `productsUrl(category)`, which builds the address, and `loadJson(url, signal)`, which fetches any URL and parses the body.
The state stores the whole response as `data`, and `products` is read from it under the effect.

## Write the hook

`src/useFetch.js` is a placeholder for now.
Replace it with the hook: the request logic from `App`, with `url` as its input and the status as its output.

```js file="src/useFetch.js" action="create"
import { useEffect, useState } from "react";
import { loadJson } from "./api.js";

export function useFetch(url) {
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", data: null, error: null });
    loadJson(url, controller.signal)
      .then((data) => {
        setRequest({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", data: null, error: error.message });
        }
      });
    return () => controller.abort();
  }, [url, attempt]);

  function retry() {
    setAttempt(attempt + 1);
  }

  return { status: request.status, data: request.data, error: request.error, retry };
}
```

Compare it with `App` line by line: the state and the effect are the same, with `url` in place of `productsUrl(category)`.

## Call it from the component

`App` keeps `useState` for the category but no longer needs `useEffect` or `loadJson`.

```jsx file="src/App.jsx" action="replace" anchor='import { useEffect, useState } from "react";'
import { useState } from "react";
```

```jsx file="src/App.jsx" action="replace" anchor='import { loadJson, productsUrl } from "./api.js";'
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";
```

Replace the whole request block, from the `attempt` line to the end of the effect, with one call.

```jsx file="src/App.jsx" action="replace" anchor='  const [attempt, setAttempt] = useState(0);\n  const [request, setRequest] = useState({ status: "loading", data: null, error: null });\n\n  useEffect(() => {\n    const controller = new AbortController();\n    setRequest({ status: "loading", data: null, error: null });\n    loadJson(productsUrl(category), controller.signal)\n      .then((data) => {\n        setRequest({ status: "success", data, error: null });\n      })\n      .catch((error) => {\n        if (!controller.signal.aborted) {\n          setRequest({ status: "error", data: null, error: error.message });\n        }\n      });\n    return () => controller.abort();\n  }, [category, attempt]);'
  const { status, data, error, retry } = useFetch(productsUrl(category));
```

Read `products` from the destructured `data`.

```jsx file="src/App.jsx" action="replace" anchor="  const products = request.data ? request.data.products : [];"
  const products = data ? data.products : [];
```

And draw the page from the destructured values; the button calls `retry` directly.

```jsx file="src/App.jsx" action="replace" anchor='      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}\n      {request.status === "error" && (\n        <p role="alert" className="message message--error">\n          Could not load products. {request.error}\n          <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button>\n        </p>\n      )}\n      {request.status === "success" && <ProductList items={products} />}'
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={products} />}
```

`App` is now a component that owns a category and draws a page; everything about requests lives in one file that any page can import.

## Read more

### Why a hook

`App` held eighteen lines that had nothing to do with products: a status, a controller, a cleanup, and a retry counter.
Every page that loads data needs the same eighteen lines.
In Week 13 we solve that the way we solved repeated markup: pull the logic out into a function and call it from each component.
A function that calls hooks is a **custom hook**, and its name starts with `use` so that React and you can tell it apart from an ordinary function.

### Reading the hook

Because `url` is in the dependency array, the effect runs again whenever the caller passes a different URL.
`retry` wraps the counter so that a caller never has to know the counter exists.
The return value is a plain object, which the caller destructures the way it destructures props.

**If it breaks:** If the console says `useFetch is not a function` or shows the placeholder error, the hook file still holds the placeholder, or `App` imports it from the wrong path.
If the console says `React Hook "useFetch" is called conditionally` or the hooks change order, the call is inside an `if` or after a `return`; a hook is called at the top of the component on every render.
If the page shows `Could not load products. undefined`, the return object uses a different property name than the one `App` destructures; the four names must match on both sides.

**Check:** Run the code.
The products load, the categories switch, and Laptops still fails with a working **Retry**, because none of the behavior moved, only its address.
Open **Tree and state** and select `App`.
It still lists three state values: `category`, and the two the hook declares.
A custom hook has no state of its own; its `useState` calls belong to whichever component calls it, which is why `useFetch` can be used by two components at once without them sharing a request.
Press **Run checks**, then choose the **DummyJSON** preset to confirm the hook works on a real server.

```quiz
Two components on one page each call `useFetch`; do they share one request?
- Yes, because the state lives in `useFetch.js`
= No, because the `useState` calls inside the hook belong to the component that calls it
- Only when both pass the same URL
> A custom hook is a function, not a store: every component that calls it gets its own `attempt` and `request`, which is why the inspector lists them under `App`.
```

<details>
<summary>src/useFetch.js after this step</summary>

```js
import { useEffect, useState } from "react";
import { loadJson } from "./api.js";

export function useFetch(url) {
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", data: null, error: null });
    loadJson(url, controller.signal)
      .then((data) => {
        setRequest({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", data: null, error: error.message });
        }
      });
    return () => controller.abort();
  }, [url, attempt]);

  function retry() {
    setAttempt(attempt + 1);
  }

  return { status: request.status, data: request.data, error: request.error, retry };
}
```

</details>

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";

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
  const { status, data, error, retry } = useFetch(productsUrl(category));

  const products = data ? data.products : [];

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
            <option value="laptops">Laptops</option>
          </select>
        </label>
      </div>
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={products} />}
    </main>
  );
}
```

</details>
