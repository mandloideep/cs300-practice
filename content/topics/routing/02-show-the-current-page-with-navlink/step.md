---
title: Show the current page with NavLink
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, HomePage, ProductsPage]
required: [navlink-marks-the-current-page, home-is-not-current-on-products]
---

A navigation bar should show where the shopper is.
In the Week 8 CourseHub we did that by hand, with a class on the link of the current page in each HTML file.
The router knows the current address, so it can do it for us: `NavLink` is a `Link` that marks itself when its `to` matches the address.

## Replace Link with NavLink

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, Link, Route, Routes } from "react-router";'
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
```

```jsx file="src/App.jsx" action="replace" anchor='        <Link to="/">Home</Link>\n        <Link to="/products">Products</Link>'
        <NavLink to="/">Home</NavLink>
        <NavLink to="/products">Products</NavLink>
```

Run the code and press **Products**.
The Products link fills in, because `NavLink` set `aria-current="page"` on it, and the stylesheet we gave you styles `.site-nav a[aria-current="page"]`.
`aria-current` is the attribute a screen reader announces as "current page", so the same mark serves everyone.
`NavLink` also adds the class `active`, which is what most tutorials style; the attribute is the better hook because it carries meaning as well as looks.

But Home filled in too, and it stays filled in on every page.
A `NavLink` matches when the address *starts with* its `to`, so that a link to `/products` also counts as current on `/products/3`, which is what you want for a section link.
Every address starts with `/`, so the Home link is current everywhere.

## The end prop

Tell the Home link to match only the exact address.

```jsx file="src/App.jsx" action="replace" anchor='        <NavLink to="/">Home</NavLink>'
        <NavLink to="/" end>Home</NavLink>
```

`end` means "match the end of the address too"; `/` matches `/` and nothing longer.
The Products link keeps the default, so it stays current on the product pages we add next.

**Check:** Run the code.
Home is filled in and Products is not.
Press **Products**: the marks swap.
Open the browser's accessibility tree, or hover the links with **Boundaries** on, and read the attribute: the current link carries `aria-current="page"` and the other has no such attribute.
Press **Run checks**.

**If it breaks:** If no link ever fills in, the links are still `Link`; only `NavLink` adds the mark.
If Home is marked on the Products page, `end` is missing from the Home link.
If the console says `NavLink is not defined`, the import still names `Link`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, NavLink, Route, Routes } from "react-router";
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
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
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
      </Routes>
    </BrowserRouter>
  );
}
```

</details>
