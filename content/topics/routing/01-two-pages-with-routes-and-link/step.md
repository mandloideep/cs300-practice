---
title: Two pages with Routes, Route, and Link
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, HomePage, ProductsPage]
required: [home-route-renders, nav-has-two-links, link-switches-page]
---

**We used this in:** [Components and props](#/topic/components-and-props), where a page was a tree of components, and the Week 8 CourseHub, where every page was its own HTML file.

Every app we have built so far was one page.
A shop needs several: a home page, a product list, a page per product, and a form.
In a Vite project you install React Router with `npm install react-router`, and it does one job: it reads the address in the browser's address bar and chooses which of your components to render.
In the lab the package is already available, and because the result runs inside a frame of its own, the lab draws its own address bar above the result so you can see what the router sees.

Run the starter.
`HomePage` renders, and `ProductsPage` exists below it in the file, but nothing can show it.

## Choose a page from the address

Import four names from `react-router`.

```jsx file="src/App.jsx" action="insert-before" anchor='import { products } from "./products.js";'
import { BrowserRouter, Link, Route, Routes } from "react-router";
```

Then replace the single page with a router that holds two routes.

```jsx file="src/App.jsx" action="replace" anchor="  return <HomePage />;"
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </BrowserRouter>
  );
```

Read it from the outside in.
`BrowserRouter` connects your app to the browser's address bar and history; it goes around everything that needs to know the address, once, at the top.
`Routes` looks at the current path and picks the first `Route` whose `path` matches.
Each `Route` pairs a path with the element to render there; `element={<HomePage />}` is a component used as a value, the same way a prop can carry JSX.

Run the code.
The address bar above the result shows `/`, and the home page renders.
Type `/products` into that address bar and press Enter: the list renders in its place.
Nothing in the app can get the shopper there yet.

## Move between pages with Link

Add a navigation bar inside the router, above the routes.

```jsx file="src/App.jsx" action="insert-after" anchor="    <BrowserRouter>"
      <nav className="site-nav" aria-label="Site">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
      </nav>
```

`Link` renders a real `<a href="/products">` that works with the keyboard, a right click, and a screen reader, but when it is clicked it asks the router to change the address instead of letting the browser load a new document.
That is why a React app feels instant between pages: the components and their state stay in memory and only the matched route changes.
A plain `<a href="/products">` would throw all of that away and reload the page from the server, which in a Vite build is a different document with none of your state.

The nav is outside `Routes`, so it renders on every page, and inside `BrowserRouter`, because `Link` needs the router to work.

**Check:** Run the code.
The home page shows with Home and Products links above it.
Press **Products**: the list of six products renders, the address bar shows `/products`, and the result did not reload.
Press **Back** in the result pane's address bar and the home page returns, because the router pushed an entry into history, as the browser does for any page.
Open **Tree and state**: the router's own components appear above yours, and `HomePage` and `ProductsPage` take turns under them; only one is mounted at a time.
Press **Run checks**.

**If it breaks:** If the console says `useHref() may be used only in the context of a <Router> component`, the `nav` is outside `BrowserRouter`; move it inside.
If both pages render at once, the routes are outside `Routes`, or `App` still returns the old `<HomePage />` somewhere.
If clicking a link makes the whole result go blank, it is an `<a href>` and not a `Link`; the frame navigated away and the lab lost it, so run the code again.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, Link, Route, Routes } from "react-router";
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
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
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
