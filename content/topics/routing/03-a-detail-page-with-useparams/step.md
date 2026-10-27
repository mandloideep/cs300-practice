---
title: A detail page with useParams
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, ProductsPage, ProductPage]
required: [product-links-in-list, detail-page-from-the-url, back-link-returns]
---

**We used this in:** [Lists and keys](#/topic/lists-and-keys), where every product had a stable `id`, and [Components and props](#/topic/components-and-props), where a component drew itself from a value it was given.

This step adds one `ProductPage` component that draws whichever product the address names, so `/products/3` shows the product whose id is 3.
Watch the part of the path that changes: it is a **route parameter**, written `:id` in the route and read with the `useParams` hook.

```demo name="router-match"
```

## The route and the component

Import the two names you need.

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, NavLink, Route, Routes } from "react-router";'
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
```

Add the component above `App`.
The fence ends with a blank line, so that the component and `App` stay separated.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
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

```

`useParams()` returns an object with one property per parameter in the matched route, so a route with `:id` gives `{ id }`, and `Number(id)` turns the text into a number before the comparison.

Register the route under the list.

```jsx file="src/App.jsx" action="insert-after" anchor='        <Route path="/products" element={<ProductsPage />} />'
        <Route path="/products/:id" element={<ProductPage />} />
```

## Link to it from the list

Each product title becomes a link to its own page.

```predict
After this edit, run the code and type `/products/999` into the address bar; what does the page show?
- A blank page area, because no route matches
- The Products list, because `/products/999` starts with `/products`
= `No product has the id 999`, with a link back to the products
```

```jsx file="src/App.jsx" action="replace" anchor='            <span className="product-title">{product.title}</span>'
            <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
```

The template literal builds `/products/3` from the product's id, so the list and the route agree on the shape of the address.

## Read more

### One component for every product

A shop has a page per product, and nobody writes six components for six products.
One `ProductPage` component draws whichever product the address names.

### Text in the URL, numbers in the data

`useParams()` names each property as the route names its parameter.
Everything in a URL is text, so `id` is the string `"3"`, and `products.find` compares it with `Number(id)`; forgetting that conversion is the most common bug on a detail page, and it shows up as a page that finds nothing.

### Two kinds of not found

The `if (!product)` branch is for an id that matches the route's shape but names no product, such as `/products/999`; it is a different "not found" from an address that matches no route, which the next step handles.

**If it breaks:** If every product page says no product has the id, `Number(id)` is missing, so `"3" === 3` is false.
If the console says `useParams is not defined`, the import is missing the hook.
If clicking a title does nothing, the route path is `/products:id` or `/product/:id`; the route and the link must spell the same path, with `/` before `:id`.

**Check:** Run the code, press **Products**, then press **Apple**.
The address bar shows `/products/16`, the page shows the title, the category, and the price, and the Products link in the nav stays marked, because `/products/16` starts with `/products`.
Press **Back to the products**, then try another product.
Type `/products/999` into the address bar: the page says no product has that id and offers the way back.
Press **Run checks**.

```quiz
On the address `/products/16`, what does `useParams()` return in `ProductPage`?
- `{ id: 16 }`, a number, because the ids in `products.js` are numbers
= `{ id: "16" }`, a string, because everything in a URL is text
- `"16"`, the parameter on its own
> The router reads parameters out of the address, which is text, so `ProductPage` converts with `Number(id)` before comparing with the numeric ids.
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
      </Routes>
    </BrowserRouter>
  );
}
```

</details>
