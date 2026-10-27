---
title: A detail page keyed on useParams
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree, network]
  watch: [ProductsPage, ProductPage]
api:
  default: fixtures
required: [detail-page-requests-the-product, detail-renders-from-the-response, new-id-sends-a-new-request]
---

The detail page still reads the constant, and the constant knows six products while the server knows thousands.
Give `ProductPage` its own request: `productUrl(id)` builds `/products/3` from the id that `useParams` read out of the address, and `useFetch` does the rest.

## Swap the constant for a request

The list no longer needs `products.js`, and the detail page is about to stop needing it, so remove the import.

```jsx file="src/App.jsx" action="delete" anchor='import { products } from "./products.js";'
```

Import the address builder for one product.

```jsx file="src/App.jsx" action="replace" anchor='import { productsUrl } from "./api.js";'
import { productUrl, productsUrl } from "./api.js";
```

In `ProductPage`, replace the lookup and its not-found branch with the hook.
The block starts with the `products.find` line and ends with the closing brace of the `if`.

```jsx file="src/App.jsx" action="replace" anchor='  const product = products.find((item) => item.id === Number(id));\n  if (!product) {\n    return (\n      <main>\n        <h1>No product has the id {id}</h1>\n        <p><Link to="/products">Back to the products</Link></p>\n      </main>\n    );\n  }'
  const { status, data, error, retry } = useFetch(productUrl(id));
```

The `Number(id)` conversion is gone with the lookup: the id goes into a URL, where it was text all along.
A product the server does not have comes back as a 404, which the hook turns into the error state; the next step makes that case read well.

Then draw the page from the status, with a link to the next product so that you can watch the request change.

```jsx file="src/App.jsx" action="replace" anchor='      <h1>{product.title}</h1>\n      <p className="product-meta">{product.category}</p>\n      <p className="product-price">${product.price.toFixed(2)}</p>'
      {status === "loading" && <p role="status" className="message">Loading product {id}...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error}
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
```

The fragment `<>...</>` groups the success markup without adding an element, as in JSX rules.

## Why the id is the key

Press **Next product** and watch the **Network** view: a new request goes to `/products/2`, the loading message shows, and the page redraws from the new answer.
`ProductPage` did not unmount; the router gave it a new `id`, the component rendered again, `productUrl(id)` produced a different string, and the hook's effect, which depends on `[url, attempt]`, ran again with the new URL.
That dependency is what keys the request on the route parameter.
Without it the page would keep showing product 1 under the address of product 2, which is the "updating state after the requested identity changed" failure from the Week 13 notes.
Press **Back** in the address bar and the same thing happens in reverse: the id changes, the URL changes, the effect runs.

**Check:** Run the code, press **Products**, and open **Powder Canister**.
The address bar shows `/products/3`, `Loading product 3...` shows, then the title, category, price, and description from the response.
Press **Next product** twice and then **Back** twice; each press is one row in the Network view.
Press **Run checks**, then try the **DummyJSON** preset, where every product has a page.

**If it breaks:** If the detail page shows the error state with status 404 for every product, `productUrl` is given something other than the id, such as the whole `params` object.
If **Next product** changes the address but not the page, the hook is called with a fixed string instead of `productUrl(id)`.
If the console says `product is not defined`, a line in the success branch still reads `product.` instead of `data.`.

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
          Could not load products. {error}
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
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load product {id}. {error}
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
