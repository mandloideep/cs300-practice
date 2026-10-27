---
title: A search field whose value lives in the URL
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, network]
  watch: [ProductsPage]
api:
  default: fixtures
required: [search-filters-the-list, search-lives-in-the-address]
---

**We used this in:** [State and useState](#/topic/state-usestate), where a controlled input's value lived in state, and [Routing](#/topic/routing), where the address chose the page.

This step moves the Products page's search out of `useState` and into the address, as the `?q=red` part of it.
Watch the address bar above the result change as you type, and what **Back** does once the search lives there.

```demo name="url-as-state"
```

The Products page has a search box, and it works: type `red` and two products remain.
It lives in `useState`, so it has the limits of state.
Press **Back** in the address bar and you leave the page instead of undoing the search; press **Run** and the search is gone; there is no address to send a friend.

## Read the query from the address

`ProductsPage` will stop using `useState`, so remove its import.

```jsx file="src/App.jsx" action="delete" anchor='import { useState } from "react";'
```

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from "react-router";
```

Replace the state with the hook.

```jsx file="src/App.jsx" action="replace" anchor='  const [query, setQuery] = useState("");'
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
```

`useSearchParams` returns a pair, like `useState`: the current parameters and a function to replace them.

## Write it on every keystroke

Add a handler under the `visible` line.
The fence starts with a blank line, so that the handler stays separated from the filter.

```predict
After you add the handler and wire the input to it, you type `red`, press Home, then Back in the address bar; what does the Products page show?
= `red` still in the box and two products
- An empty box and all eight products
- `re` in the box, because Back undoes one letter
```

```jsx file="src/App.jsx" action="insert-after" anchor="  const visible = products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()));"

  function handleSearch(event) {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }
```

```jsx file="src/App.jsx" action="replace" anchor='          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} />'
          <input type="search" value={query} onChange={handleSearch} />
```

`setSearchParams({ q: value })` writes `?q=value` into the address, and `{ replace: true }` replaces the current history entry instead of pushing a new one.

## Read more

A query string, the `?q=red` part of an address, is the place for this value.
Week 13 gave the rule: if a shopper should be able to bookmark it, share it, or press Back through it, it belongs in the address, and the router gives a hook for that, `useSearchParams`.

`searchParams` is a `URLSearchParams`, the same object Week 7 used to read a query string, and `get("q")` is `null` when the address has no `q`, which `?? ""` turns into an empty search.

An empty object removes the query string when the box is cleared, so that the plain `/products` address stays the address of the unfiltered list.
Without `{ replace: true }`, every keystroke would add an entry, and Back would walk through `?q=r`, `?q=re`, `?q=red` one letter at a time.

The input is still controlled: its `value` is `query`, which now comes from the address, and the address changes on every keystroke, so the loop is the same as with state, one level further out.

**If it breaks:** If typing does nothing, the input still reads `query` from a `useState` that nothing updates; `query` must come from `searchParams.get("q")`.
If the box clears itself after one letter, `handleSearch` writes a different key than the one `get` reads.
If the console says `useSearchParams() may be used only in the context of a <Router>`, `ProductsPage` is rendered outside `BrowserRouter`.

**Check:** Run the code, press **Products**, and type `red`.
The address bar shows `/products?q=red` and two products remain.
Clear the box: the address returns to `/products`.
Type `red` again, press **Home**, then **Back** in the address bar: the Products page returns with `red` still in the box and the list still filtered, because the search was part of the address Back returned to.
Now press **Products** in the nav: the link goes to `/products` with no query string, so the box clears and the full list returns; the search was part of the address, not of the page, and that is what the checks look for.
Press **Run checks**.

```quiz
Why does `handleSearch` pass `{ replace: true }` to `setSearchParams`?
= So that one search is one history entry, not one entry per keystroke
- So that the typed value replaces the old one in the box
- So that the other parameters in the address are kept
> Each keystroke replaces the current entry, so the whole search stays one entry; without it, Back would walk through `?q=r`, `?q=re`, and `?q=red`.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from "react-router";
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
  const products = data ? data.products : [];
  const visible = products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()));

  function handleSearch(event) {
    const value = event.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true });
  }

  return (
    <main>
      <h1>Products</h1>
      <div className="controls">
        <label>
          Search
          <input type="search" value={query} onChange={handleSearch} />
        </label>
      </div>
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
