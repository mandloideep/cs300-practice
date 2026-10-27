---
title: Load the list page with useFetch
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree, network]
  watch: [App, ProductsPage, ProductPage]
api:
  default: fixtures
required: [list-page-requests-products, list-renders-from-the-response, hook-state-under-the-page]
---

**We used this in:** [Fetching and request states](#/topic/fetching-and-request-states), where we extracted `useFetch`, and [Routing](#/topic/routing), where the shop got its pages.

This step gives the Products page a real request instead of the constant it draws from now.
`ProductsPage` is the component that needs the list, so it calls `useFetch`; watch the **Network** view and **Tree and state** to see that the request and its state belong to the page.

```predict
After this step, you run the code and then press Products; when does the request to `/products` appear in the Network view?
- As soon as the run starts, while the Home page shows
= When you press Products and `ProductsPage` first renders
- Only after you press Retry on the Products page
```

We copied `src/useFetch.js` from the last topic exactly as you left it, and `src/api.js` has `productsUrl()`, `productUrl(id)`, and `loadJson`.
The list markup moved into a `ProductList` component, as in Lists and keys, so the page only decides what to show.
Run the starter: six products from the constant, no request in the **Network** view.

## Call the hook from the page

Import the two names.

```jsx file="src/App.jsx" action="insert-after" anchor='import { products } from "./products.js";'
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";
```

Call the hook at the top of `ProductsPage`.

```jsx file="src/App.jsx" action="insert-after" anchor="function ProductsPage() {"
  const { status, data, error, retry } = useFetch(productsUrl());
```

One line, and the page has a request with every state we built in the last topic.

## Draw the page from the status

Replace the list, which read from the constant, with the three branches.

```jsx file="src/App.jsx" action="replace" anchor="      <ProductList items={products} />"
      {status === "loading" && <p role="status" className="message">Loading products...</p>}
      {status === "error" && (
        <p role="alert" className="message message--error">
          Could not load products. {error}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && <ProductList items={data.products} />}
```

`ProductList` is unchanged except for what it is given: `data.products` instead of `products`.

## Read more

The shop from the Routing topic draws its product list from a constant.
A real shop asks the server, and the question is where the request belongs.
It belongs to the page: `ProductsPage` is the component that needs the list, so `ProductsPage` calls `useFetch`, and the loading, success, and error states are its own.

`useFetch` runs its effect after `ProductsPage` first renders, which happens when the router matches `/products`; the request starts when the shopper arrives on the page, not when the app loads.
The list is given `data.products` and not `data`, because the server answers with `{ products, total, skip, limit }` and the array is inside.
`data` is `null` until the request succeeds, which is why the list sits inside the `status === "success"` branch and nowhere else.

**If it breaks:** If the list still shows six products and no request appears, `ProductList` is still given `products`; it should be given `data.products` inside the success branch.
If the console says `Cannot read properties of null (reading 'products')`, the list renders outside the `status === "success"` branch, where `data` is still `null`.
If the page shows the error state with status 404 on a preset, that server has no `/products` path; switch to Fixtures or DummyJSON.

**Check:** Run the code and press **Products**.
`Loading products...` shows, then eight products from the fixtures.
Open **Tree and state** and select `ProductsPage`: it holds the two state values the hook declares, and `App` holds none, because the hook was called from the page.
Press **Home** and then **Products** again: the request runs again, because leaving the page unmounted `ProductsPage` and its state with it, and coming back mounted a fresh one.
Open a product: the detail page still reads the old constant, so most of the eight say no product has that id; the next step gives it a request of its own.
Press **Run checks**, then try the **DummyJSON** preset.

```quiz
You press Home and then Products again; why does the list show Loading products... and request again?
- `useFetch` runs its effect on every render of the page
- The router reloads the whole app on every link
= Leaving the page unmounted `ProductsPage` and its state, and coming back mounted a fresh one
> The hook's state lives in the component that called it; a fresh `ProductsPage` starts at loading, and its effect sends the request again.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";
import { products } from "./products.js";
import { productsUrl } from "./api.js";
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
