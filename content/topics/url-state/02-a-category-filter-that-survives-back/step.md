---
title: A category filter that survives Back and reload
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, network]
  watch: [ProductsPage]
api:
  default: fixtures
required: [category-filters-the-list, filters-combine]
---

A second value goes into the address the same way, and it shows the one thing `setSearchParams` does that `useState` never did: it writes history.
A category is chosen once, not typed letter by letter, so each choice gets its own entry, and Back returns to the previous one.

## Read the category

```jsx file="src/App.jsx" action="insert-after" anchor='  const query = searchParams.get("q") ?? "";'
  const category = searchParams.get("category") ?? "all";
```

Filter by both values.

```jsx file="src/App.jsx" action="replace" anchor="  const visible = products.filter((product) => product.title.toLowerCase().includes(query.toLowerCase()));"
  const visible = products.filter((product) => {
    const matchesQuery = product.title.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "all" || product.category === category;
    return matchesQuery && matchesCategory;
  });
```

## Change one parameter and keep the other

`setSearchParams({ q: value })` replaces every parameter, so typing in the search box would drop the category.
Copy the current parameters, change one, and write the copy back.

```jsx file="src/App.jsx" action="replace" anchor="    setSearchParams(value ? { q: value } : {}, { replace: true });"
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    setSearchParams(next, { replace: true });
```

`new URLSearchParams(searchParams)` makes a copy, because the one from the hook belongs to the router and is not ours to change, the same rule as for state and props.

Add the handler for the category under `handleSearch`, without `replace`.

```jsx file="src/App.jsx" action="insert-after" anchor="    setSearchParams(next, { replace: true });\n  }"

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
```

The default is to push a new history entry, which is what we want for a deliberate choice: Beauty, then Fragrances, then Back, and the shopper is on Beauty again.
Typing keeps `replace`, so the letters of one search stay one entry.

## The select

```jsx file="src/App.jsx" action="insert-after" anchor="        </label>"
        <label>
          Category
          <select value={category} onChange={handleCategory}>
            <option value="all">All</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
          </select>
        </label>
```

The select is controlled by `category`, which comes from the address, exactly as the search box is controlled by `query`.

**Check:** Run the code and press **Products**.
Choose **Fragrances**: the address bar shows `/products?category=fragrances` and three products remain.
Type `coco`: the address becomes `/products?category=fragrances&q=coco` and one product remains; the category survived the typing.
Press **Back** in the address bar: the query goes and the three fragrances return, one entry for the whole word.
Press **Back** again: the category goes too.
In a Vite project, reloading the page keeps the address and so keeps both filters; in the lab, pressing **Run** starts a fresh history, so use Back and the address bar to see it.
Press **Run checks**.

**If it breaks:** If choosing a category clears the search, or typing clears the category, a handler still passes a plain object to `setSearchParams`; both should copy `searchParams` first.
If the select snaps back to All, its `value` is not `category`, or the handler writes a different key than `get("category")` reads.
If choosing All leaves `?category=all` in the address, the handler sets the key instead of deleting it; an address with no category parameter means all.

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
  const category = searchParams.get("category") ?? "all";
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
