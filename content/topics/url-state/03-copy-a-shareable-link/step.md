---
title: Copy a shareable link
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, network]
  watch: [ProductsPage]
api:
  default: fixtures
required: [address-shown-on-the-page, copy-reports-back]
---

The point of putting the search in the address is that the address can be sent to someone.
A shopper should not have to find the address bar to do that, so the page shows the current address and offers to copy it.
Watch the share line under the controls follow the address as you choose and type.

```predict
After this step, you choose Beauty and then type `red`; what does the share line read?
= `/products?category=beauty&q=red`
- `/products?q=red&category=beauty`
- `/products`, because `useLocation` reads only the path
```

## Read the current address

`useLocation` returns the address the router is on, split into `pathname`, `search`, and `hash`.

```jsx file="src/App.jsx" action="insert-before" anchor='import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from "react-router";'
import { useState } from "react";
```

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from "react-router";'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
```

```jsx file="src/App.jsx" action="insert-after" anchor='  const category = searchParams.get("category") ?? "all";'
  const location = useLocation();
  const shareable = location.pathname + location.search;
  const [copied, setCopied] = useState("");
```

`shareable` is the path plus the query string, and `copied` is ordinary state that says whether the copy worked.

## Write it to the clipboard

Add the handler under `handleCategory`.

```jsx file="src/App.jsx" action="insert-after" anchor="    setSearchParams(next);\n  }"

  function handleCopy() {
    navigator.clipboard
      .writeText(shareable)
      .then(() => setCopied("Copied " + shareable))
      .catch(() => setCopied("Could not copy here; select the address and copy it by hand."));
  }
```

`navigator.clipboard.writeText` returns a promise, and both outcomes set a message, so the shopper always learns what happened.

## Show it

```jsx file="src/App.jsx" action="insert-after" anchor="      </div>"
      <p className="share">
        Share this search: <code>{shareable}</code>
        <button type="button" onClick={handleCopy}>Copy link</button>
      </p>
      {copied && <p role="status" className="message">{copied}</p>}
```

## Read more

`shareable` is `/products?category=fragrances&q=coco` when both filters are set and `/products` when neither is, because `search` is an empty string then.
The parameters appear in the order they were first set: a category chosen before typing comes first.
`copied` is ordinary state: whether the copy succeeded is not something to bookmark, so it stays in `useState`, which is the other half of the Week 13 rule.

`writeText` returns a promise because the browser may ask the user first, and it rejects when the page is not allowed to write the clipboard.
In a Vite project you would copy `window.location.origin + shareable` to get a full link; this site's result runs in a frame with no address of its own, so here we copy the part that carries the state.

**If it breaks:** If the page shows `undefined` in the share line, `shareable` reads properties that `useLocation` does not have; they are `pathname` and `search`.
If the console says `useLocation is not defined`, the import at the top does not include it.
If pressing the button does nothing at all, neither callback sets `copied`; the status message is how the button reports back.

**Check:** Run the code, press **Products**, choose **Beauty**, and type `red`.
The line under the controls reads `/products?category=beauty&q=red`, the same text as the address bar, and it changes with every keystroke.
Press **Copy link** and paste into the search box of another tab or a text editor: the address arrives.
Open the **Network** view: typing and choosing sent no requests, because the filters run on the list that was loaded once; only the address changed.
Press **Run checks**.

```quiz
Why does `copied` stay in `useState` instead of going into the address?
- The address cannot hold a value with spaces in it
- A value in the address would send a request on every change
= Whether the copy worked is not something a shopper would bookmark or share
> The Week 13 rule cuts both ways: what a shopper should be able to bookmark, share, or press Back through goes in the address, and everything else stays in state.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
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
  if (items.length === 0) {
    return <p role="status" className="message">No products match.</p>;
  }
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
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category") ?? "all";
  const location = useLocation();
  const shareable = location.pathname + location.search;
  const [copied, setCopied] = useState("");
  const products = data ? data.products : [];
  const visible = products.filter((product) => {
    const matchesQuery = product.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesQuery && matchesCategory;
  });

  function handleSearch(event) {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
  }

  function handleCategory(event) {
    const value = event.target.value;
    const next = new URLSearchParams(searchParams);
    if (value === "all") {
      next.delete("category");
    } else {
      next.set("category", value);
    }
    setSearchParams(next);
  }

  function handleCopy() {
    navigator.clipboard
      .writeText(shareable)
      .then(() => setCopied("Copied " + shareable))
      .catch(() => setCopied("Could not copy here; select the address and copy it by hand."));
  }

  return (
    <main>
      <h1>Products</h1>
      <div className="controls">
        <label>
          Search
          <input type="search" value={query} onChange={handleSearch} />
        </label>
        <label>
          Category
          <select value={category} onChange={handleCategory}>
            <option value="all">All</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
          </select>
        </label>
      </div>
      <p className="share">
        Share this search: <code>{shareable}</code>
        <button type="button" onClick={handleCopy}>Copy link</button>
      </p>
      {copied && <p role="status" className="message">{copied}</p>}
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={visible} />}
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
