---
title: Tell a missing product from a failed request
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, network]
  watch: [ProductsPage, ProductPage]
api:
  default: fixtures
required: [missing-product-reads-well, no-retry-for-a-missing-product]
---

**We used this in:** [Lists and keys](#/topic/lists-and-keys), where an empty result got a message of its own instead of the error message, because it is not an error.

This step teaches the detail page to tell a product the server no longer has from a request that failed.
A 404 is an answer, not a failure, so watch the status code: the error state needs it to tell the two apart.

```predict
Run the starter, press Products, and open Dior J'adore, the last product; what does the page show?
- The heading No product has the id 8, with no Retry button
= `Could not load product 8. The server answered with status 404.` and a Retry button
- The Page not found page, because no route matches product 8
```

Our fixtures have no detail for product 8, as if it had been removed from the catalog after the list was loaded, which happens in every real shop.
Run the starter, press **Products**, and open **Dior J'adore** to see what the page says for it now.

## Keep the status with the error

In `loadJson`, build the error, attach the status, and then throw it.

```js file="src/api.js" action="replace" anchor='    throw new Error("The server answered with status " + response.status + ".");'
    const error = new Error("The server answered with status " + response.status + ".");
    error.status = response.status;
    throw error;
```

An `Error` is an object, so it can carry a property beside its `message`.

In the hook, store the whole error instead of its message.

```js file="src/useFetch.js" action="replace" anchor='          setRequest({ status: "error", data: null, error: error.message });'
          setRequest({ status: "error", data: null, error });
```

The list page rendered `{error}`, which worked while `error` was a string; now it must render the message.

```jsx file="src/App.jsx" action="replace" anchor="          Could not load products. {error}"
          Could not load products. {error.message}
```

## Two error branches on the detail page

Replace the detail page's error branch with two: one for a missing product and one for everything else.
The block starts with the `status === "error"` line and ends with its closing `)}`.

```jsx file="src/App.jsx" action="replace" anchor='      {status === "error" && (\n        <p role="alert" className="message message--error">\n          Could not load product {id}. {error}\n          <button type="button" onClick={retry}>Retry</button>\n        </p>\n      )}'
      {status === "error" && error.status === 404 && (
        <>
          <h1>No product has the id {id}</h1>
          <p>It may have been removed from the catalog after the list was loaded.</p>
        </>
      )}
      {status === "error" && error.status !== 404 && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
```

The missing product gets a heading and an explanation, with the **Back to the products** link below as the way out, and no retry.

## Read more

Before this step the page says `Could not load product 8. The server answered with status 404.` and offers **Retry**.
Both are wrong for a shopper: nothing failed, the product is gone, and retrying will not bring it back.
To tell a 404 apart from a 500 or a dropped connection, the error state needs the status code, and the starter's hook keeps only the message.

Every other failure keeps the alert and the retry button, because a 503 or a dropped connection may well succeed the second time.
A dropped connection never reaches `loadJson`'s status line, so its error has no `status` at all, and `undefined !== 404` sends it to the alert too.

This app now has three kinds of not found, and each reads differently.
An address that matches no route renders `NotFoundPage`.
A product the server does not have renders the heading above.
A request that could not be completed renders the alert with **Retry**.

**If it breaks:** If the detail page goes blank and the console says `Objects are not valid as a React child`, a branch still renders `{error}`; render `{error.message}`.
If the 404 still shows the alert, `error.status` is `undefined`, which means `loadJson` throws before attaching the status, or the hook stores `error.message`.
If the console says `Cannot read properties of null (reading 'status')`, a branch reads `error.status` outside the `status === "error"` condition, where `error` is `null`.

**Check:** Run the code, press **Products**, and open **Dior J'adore**.
The page says no product has the id 8, with the explanation and the way back, and no **Retry** button.
Open **Powder Canister** and set **HTTP error** to `503 Service Unavailable` in the fixture controls, then press **Retry** on the page: the request runs again and fails again, and the alert stays, because that failure is worth retrying.
Set the HTTP error back to **None**, press **Retry** once more, and the product loads.
Press **Run checks** with **Fixtures** selected; a real server such as DummyJSON has a product 8.

```quiz
The request for a product answers with status 503; which branch of the detail page renders?
- The missing-product heading, because every error means the product is gone
= The alert with Retry, because `error.status` is 503 and not 404
- Neither, because only a 404 gives the error a `status`
> `loadJson` attaches the status of every answer that is not ok, so a 503 carries `status` 503 and takes the branch for other errors, where Retry may succeed.
```

<details>
<summary>src/api.js after this step</summary>

```js
export function productsUrl() {
  return import.meta.env.API_BASE + "/products?limit=8";
}

export function productUrl(id) {
  return import.meta.env.API_BASE + "/products/" + id;
}

export async function loadJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    const error = new Error("The server answered with status " + response.status + ".");
    error.status = response.status;
    throw error;
  }
  return response.json();
}
```

</details>

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
          setRequest({ status: "error", data: null, error });
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
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { productUrl, productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";

function HomePage() {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">Open the Products page to browse the catalog.</p>
    </main>
  );
}

function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
          <span className="product-price">${product.price.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

function ProductsPage() {
  const { status, data, error, retry } = useFetch(productsUrl());
  return (
    <main>
      <h1>Products</h1>
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={data.products} />}
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const { status, data, error, retry } = useFetch(productUrl(id));
  return (
    <main>
      {status === "loading" && <p role="status" className="message">Loading product {id}...</p>}
      {status === "error" && error.status === 404 && (
        <>
          <h1>No product has the id {id}</h1>
          <p>It may have been removed from the catalog after the list was loaded.</p>
        </>
      )}
      {status === "error" && error.status !== 404 && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && (
        <>
          <h1>{data.title}</h1>
          <p className="product-meta">{data.category}</p>
          <p className="product-price">${data.price.toFixed(2)}</p>
          <p>{data.description}</p>
          <p><Link to={`/products/${Number(id) + 1}`}>Next product</Link></p>
        </>
      )}
      <p><Link to="/products">Back to the products</Link></p>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>There is no page at this address. <Link to="/">Go to the home page</Link></p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

</details>
