---
title: Fetch again when the category changes, and ignore a stale response
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, network]
  watch: [App, ProductList]
api:
  default: fixtures
required: [effect-depends-on-category, stale-response-ignored]
---

A page rarely asks the server one question.
This one has a **Category** select, and each category is a different request: `loadProducts(category)` now asks for `/products/category/beauty`, `/products/category/groceries`, and so on.
Run the starter and change the category.
Nothing happens, because the effect's dependency array is `[]`, which means "run after the first render and never again".

## Run the effect again when the category changes

Name the value the effect depends on.

```jsx file="src/App.jsx" action="replace" anchor="  }, []);"
  }, [category]);
```

Run the code and change the category to **Groceries**.
The flow view records the sequence: the `change` event, `setCategory` in `App`, a render, and then the effect, which calls `setRequest` with the loading state and sends the request; when the response arrives, a second trace shows `setRequest` with the success state and the render that drew the cards.
That is the whole loop from the Week 12 board, recorded from one change.

## Reproduce the stale response

Our fixtures answer `beauty` slowly, after 1500 milliseconds, and the other categories after 300.
Run the code and, while `Loading products...` is still showing for Beauty, change the category to **Groceries**.
The groceries arrive first and the page shows them.
About a second later the beauty products arrive and replace them, so the select says Groceries and the list shows mascara and lipstick.

Nothing in the code is wrong in the usual sense; it is an order problem.
The beauty request was still pending when the groceries request started, and its response landed after the groceries response.
Open the **Network** view: the beauty row ends `ok` *after* the groceries row, and the network pane marks that row `stale`, with a one-line explanation, because it settled after a newer request from the same line of code had already settled.
Any time a component can send a new request before the old one answers, the old answer can arrive last and win.
Set **Latency (ms)** in the fixture controls to `1000` if you want more time to reproduce it.

## Ignore the answer to a question we stopped asking

The effect that sent the beauty request is the only code that knows it is out of date, and React tells it so: before an effect runs again, React calls the cleanup function the previous run returned.
A flag inside the effect, flipped by the cleanup, lets the old run see that it has been replaced.

Declare the flag as the first line of the effect.

```jsx file="src/App.jsx" action="insert-after" anchor="  useEffect(() => {"
    let cancelled = false;
```

Check it before each setter call.

```jsx file="src/App.jsx" action="replace" anchor='        setRequest({ status: "success", products, error: null });'
        if (!cancelled) {
          setRequest({ status: "success", products, error: null });
        }
```

```jsx file="src/App.jsx" action="replace" anchor='        setRequest({ status: "error", products: [], error: error.message });'
        if (!cancelled) {
          setRequest({ status: "error", products: [], error: error.message });
        }
```

Return the cleanup that flips it.

```jsx file="src/App.jsx" action="insert-before" anchor="  }, [category]);"
    return () => {
      cancelled = true;
    };
```

Each run of the effect has its own `cancelled`, because `let` inside the function creates a new variable every time the function runs.
When the category changes from Beauty to Groceries, React calls the Beauty run's cleanup, so that run's `cancelled` becomes `true`; then it starts the Groceries run with a fresh `cancelled` of `false`.
When the slow beauty response finally arrives, its `then` callback sees `cancelled === true` and does nothing.

The same cleanup answers the duplicate from Step 1.
Strict Mode runs the effect, runs its cleanup, and runs it again, so the first request's answer is now ignored and only the second one reaches `setRequest`.

**Check:** Run the code and change the category to **Groceries**, then straight back to **Beauty** and to **Groceries** again before the beauty products arrive.
The page ends on the groceries and stays there.
Open the **Network** view: the beauty row still ends `ok` and still carries the `stale` badge, because the flag ignores the answer rather than stopping the request; the next step cancels the request itself.
Press **Run checks**.
Then choose the **DummyJSON** preset and switch categories a few times: the requests go to `https://dummyjson.com/products/category/...`, and the list always matches the select.

**If it breaks:** If changing the category does nothing, the dependency array is still `[]`.
If the list still ends on the wrong category, one of the setter calls is outside its `if (!cancelled)`, or the cleanup sets a different variable than the one the callbacks read.
If the console says `cancelled is not defined`, the `let cancelled = false;` line is outside the effect; it must be the first line inside `useEffect(() => {`.
If the page never leaves `Loading products...`, the cleanup runs before the request answers and the flag is `true` for every run; check that `return () => {...}` is the last statement of the effect, not inside the `then`.

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
    let cancelled = false;
    setRequest({ status: "loading", products: [], error: null });
    loadProducts(category)
      .then((products) => {
        if (!cancelled) {
          setRequest({ status: "success", products, error: null });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setRequest({ status: "error", products: [], error: error.message });
        }
      });
    return () => {
      cancelled = true;
    };
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
