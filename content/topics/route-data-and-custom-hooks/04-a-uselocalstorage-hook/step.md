---
title: A useLocalStorage hook
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree, network]
  watch: [App, ProductPage]
api:
  default: fixtures
required: [save-writes-local-storage, saved-survives-a-rerun]
---

**We used this in:** [Persistence](#/topic/persistence), where a value was read from `localStorage` in a lazy initial state and written back in an effect, and [Events and lifting state](#/topic/events-and-lifting-state), where the parent owned the list and the child asked for a change.

We added a **Save for later** button to the detail page and a count on the home page.
`App` owns the list of saved ids, as in Week 11, and passes it down with a handler.
Run the starter, open a product, press **Save for later**, and go **Home**: one saved product.
Now press **Run** again: zero.
State lives in memory, and a re-run, like a reload in Vite, starts from nothing.

Persistence showed the fix: read `localStorage` when the state is created, and write it whenever the state changes.
That is two hooks and a key, used the same way in every component that wants to remember something, which is exactly the shape a custom hook takes.

## Write the hook

`src/useLocalStorage.js` is a placeholder.
Replace it with a hook that looks like `useState` from the outside.

```js file="src/useLocalStorage.js" action="create"
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = window.localStorage.getItem(key);
    return stored === null ? initialValue : JSON.parse(stored);
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

The function passed to `useState` runs once, on the first render, so the storage is read once and not on every render.
`getItem` returns `null` when the key has never been written, and the stored text is parsed back into the array it came from.
The effect writes the value whenever it changes, so the caller never calls `setItem`.
The hook returns a pair, `[value, setValue]`, so that a component can swap `useState` for `useLocalStorage` by changing one word and adding a key.

## Use it in App

```jsx file="src/App.jsx" action="delete" anchor='import { useState } from "react";'
```

```jsx file="src/App.jsx" action="insert-after" anchor='import { useFetch } from "./useFetch.js";'
import { useLocalStorage } from "./useLocalStorage.js";
```

```jsx file="src/App.jsx" action="replace" anchor="  const [saved, setSaved] = useState([]);"
  const [saved, setSaved] = useLocalStorage("shop-saved-products", []);
```

`handleToggleSave` and the props are untouched.
`App` does not know the value is persisted, the same way `ProductsPage` does not know how `useFetch` cancels a request.

**Check:** Run the code, open a product, and press **Save for later**.
The button changes to **Remove from saved**.
Press **Run** again, open the same product: still saved, and the home page counts it.
Open **Tree and state** and select `App`: it has one state value, the array the hook keeps, listed under `App` because `App` called the hook.
Press **Run checks**, then remove the product from saved so that the next step starts clean.

**If it breaks:** If the console says `JSON.parse: unexpected character`, something else wrote a plain string under the same key; change the key or clear the browser's storage for this site.
If saving works but a re-run forgets it, the effect is missing or its dependency array leaves out `value`.
If the page is blank and the console says `useState is not defined`, the hook file does not import it from `react`.

<details>
<summary>src/useLocalStorage.js after this step</summary>

```js
import { useEffect, useState } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = window.localStorage.getItem(key);
    return stored === null ? initialValue : JSON.parse(stored);
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```

</details>

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { productUrl, productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";
import { useLocalStorage } from "./useLocalStorage.js";

function HomePage({ savedCount }) {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">Open the Products page to browse the catalog.</p>
      <p role="status" className="message">You have saved {savedCount} products.</p>
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

function ProductPage({ saved, onToggleSave }) {
  const { id } = useParams();
  const { status, data, error, retry } = useFetch(productUrl(id));
  const isSaved = saved.includes(Number(id));
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
          <p>
            <button type="button" aria-pressed={isSaved} onClick={() => onToggleSave(data.id)}>
              {isSaved ? "Remove from saved" : "Save for later"}
            </button>
          </p>
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
  const [saved, setSaved] = useLocalStorage("shop-saved-products", []);

  function handleToggleSave(id) {
    if (saved.includes(id)) {
      setSaved(saved.filter((item) => item !== id));
    } else {
      setSaved([...saved, id]);
    }
  }

  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products">Products</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage savedCount={saved.length} />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductPage saved={saved} onToggleSave={handleToggleSave} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

</details>
