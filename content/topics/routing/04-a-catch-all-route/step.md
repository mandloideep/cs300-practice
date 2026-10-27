---
title: A catch-all route for addresses that match nothing
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, NotFoundPage]
required: [unknown-address-shows-not-found, not-found-links-home, no-unmatched-warning]
---

This step answers an address that matches no route with a not-found page, the way a server answers one with a 404.
Watch the console as well as the page: the starter warns about the address it could not match, and the fix makes the warning go away.

We added a **Deals** link to the nav, for a page that is planned but not written, which happens in every real project.

```predict
Run the starter and press **Deals**; what does the result show?
- A `Page not found` heading under the nav
= The nav, with an empty page area below it
- The home page, because the router falls back to `/`
```

Run the starter and press it.
The nav stays, the page area goes blank, and the console warns `No routes matched location "/deals"`.

## The page

Add the component above `App`, with a way back.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>There is no page at this address. <Link to="/">Go to the home page</Link></p>
    </main>
  );
}

```

Say what happened and offer the home page, the way a good server 404 does.

## The route

Register it after the others.

```jsx file="src/App.jsx" action="insert-after" anchor='        <Route path="/products/:id" element={<ProductPage />} />'
        <Route path="*" element={<NotFoundPage />} />
```

A `path` of `*` matches any address that no other route matched.

## Read more

### Why an app needs its own 404

A shopper who typed an old address, or followed a stale link, would see the same nothing as the starter's Deals page.
A server answers an unknown address with a 404 page.
A single-page app has to answer it too, and the router has a route for it: a `path` of `*` matches any address that no other route matched.
A not-found page that only says "not found" strands the shopper, which is why this one links home.

### Where the catch-all goes

`Routes` ranks its routes by how specific they are, so `*` loses to every other route whatever its position in the list; the convention is to write it last so the file reads top to bottom from most specific to least.

### Two kinds of not found

Compare the two kinds of not found in this app.
`/products/999` matches the `:id` route, so `ProductPage` renders and reports that no product has that id; the address has the right shape and the wrong data.
`/deals` matches nothing, so `NotFoundPage` renders; the address has no shape the app knows.
Both are answers, and a shopper can act on either.

**If it breaks:** If Deals still shows nothing, the route's path is `/*` with a typo, or it is outside `Routes`.
If every page shows the not-found page, the `*` route is written as the only route, or another route's path lost its leading `/`.
If the console says `Link is not defined`, the import at the top does not include `Link`.

**Check:** Run the code and press **Deals**.
The not-found page renders, with the nav still above it, and the console shows no warning.
Press **Go to the home page**.
Type a few wrong addresses into the address bar, such as `/product` and `/products/16/reviews`, and confirm each one lands on the not-found page.
Press **Run checks**.

```quiz
Which address renders `ProductPage`'s "No product has the id" message rather than `NotFoundPage`?
- `/deals`
- `/products/16/reviews`
= `/products/999`
> `/products/999` has the shape of the `:id` route and names no product; `/deals` and `/products/16/reviews` match no route at all, so the `*` route answers them.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { products } from "./products.js";

function HomePage() {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">{products.length} products in stock. Open the Products page to browse them.</p>
    </main>
  );
}

function ProductsPage() {
  return (
    <main>
      <h1>Products</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id}>
            <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function ProductPage() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));
  if (!product) {
    return (
      <main>
        <h1>No product has the id {id}</h1>
        <p><Link to="/products">Back to the products</Link></p>
      </main>
    );
  }
  return (
    <main>
      <h1>{product.title}</h1>
      <p className="product-meta">{product.category}</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
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
        <NavLink to="/deals">Deals</NavLink>
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
