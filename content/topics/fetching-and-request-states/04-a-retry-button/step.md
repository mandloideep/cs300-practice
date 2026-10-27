---
title: A retry button for the error state
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [retry-button-in-error-state, retry-sends-a-new-request]
---

**We used this in:** [Events and lifting state](#/topic/events-and-lifting-state), where a click called a setter and the flow view drew the event, the setter, and the re-render.

This step adds a **Retry** button to the error state, so a failed request has a visible way to try again.
Watch the **Network** view: each press is a new request, with the loading state shown again while it is pending.

We added a **Laptops** category, and our fixtures answer it with `503 Service Unavailable`, the status a server sends while it is down for maintenance.

```predict
Run the starter and choose **Laptops**; what does the page show below the select?
- `Loading products...`, which never goes away
= `Could not load products. The server answered with status 503.`
- `No products to show.`, because there are no laptops
```

Run the starter and choose **Laptops**.
The error message appears, and the only way out is to pick another category and come back.

## A counter whose only job is to change

The effect runs when a dependency changes.
To run it again with the same category, give it a second dependency that changes on every retry.

```jsx file="src/App.jsx" action="insert-after" anchor='  const [category, setCategory] = useState("beauty");'
  const [attempt, setAttempt] = useState(0);
```

```jsx file="src/App.jsx" action="replace" anchor="  }, [category]);"
  }, [category, attempt]);
```

Nothing inside the effect reads `attempt`; changing it is how we ask React to run the effect again.

## The button

Replace the error line with a block that holds the message and a button.

```predict
After this edit, run, choose **Laptops**, and press **Retry** once; what does the **Network** view gain?
= One new `503` row for laptops
- No new row, because the category did not change
- Two new rows, because Strict Mode runs the effect twice
```

```jsx file="src/App.jsx" action="replace" anchor='      {request.status === "error" && <p role="alert" className="message message--error">Could not load products. {request.error}</p>}'
      {request.status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {request.error}
          <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button>
        </p>
      )}
```

The shopper sees `Loading products...` while the retry is pending, which is what tells them the click did something.

## Read more

### What a retry is

A failed request needs a visible way to try again, and the Week 9 rule says what it is: a retry is a new request, started by the shopper, with the loading state shown again.

### Why the counter works

`attempt` is in the dependency array because changing it is how we ask React to run the effect again, and React compares each dependency with its last value to decide.
The click calls `setAttempt(attempt + 1)`, the state changes, `App` renders, and because `attempt` is a dependency the effect runs its cleanup and then runs again: it sets the loading state, sends a new request, and stores the answer.
Strict Mode runs an effect twice only when the component first mounts, so a retry sends one request, not two.

**If it breaks:** If pressing **Retry** does nothing, `attempt` is not in the dependency array; the setter changed the state but no effect depended on it.
If the console warns about a missing dependency, you typed `[category]` back; the array needs both values.
If the button shows on the loaded page, it is outside the `request.status === "error"` branch.

**Check:** Run the code, choose **Laptops**, and press **Retry** with the **Flow** view open.
The trace shows the click on the button in `App`, `setAttempt` from `0` to `1`, and the render; the next trace shows `setRequest` with the loading state and, after the response, the error state again.
In the **Network** view a new `503` row appears for each press.
Press **Run checks** while **Fixtures** is selected; a real server such as DummyJSON has a laptops category, so there is no error to retry from there.
Then set **HTTP error** in the fixture controls to `None` and **Drop the connection** on, run, press **Retry** a few times, turn the control off, and press **Retry** once more: the products load, which is what a retry is for.

```quiz
Nothing inside the effect reads `attempt`; why is it in the dependency array?
- React requires every state value in every dependency array
= Changing it is how a click asks React to run the effect again for the same category
- It keeps the effect from running on the first render
> React compares each dependency with its last value after a render, and a changed `attempt` makes it run the cleanup and then the effect again.
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
  const [category, setCategory] = useState("beauty");
  const [attempt, setAttempt] = useState(0);
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
  }, [category, attempt]);

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
      {request.status === "loading" && <p role="status" className="message">Loading products...</p>}
      {request.status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {request.error}
          <button type="button" onClick={() => setAttempt(attempt + 1)}>Retry</button>
        </p>
      )}
      {request.status === "success" && <ProductList items={request.products} />}
    </main>
  );
}
```

</details>
