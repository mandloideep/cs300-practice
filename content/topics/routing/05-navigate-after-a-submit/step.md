---
title: Go to a page from code with useNavigate
mode: edit
entry: src/main.jsx
inspector:
  views: [flow, boundaries]
  watch: [App, NewProductPage, ProductPage]
required: [submit-navigates-to-the-new-product, new-product-in-the-list]
---

**We used this in:** [Events and lifting state](#/topic/events-and-lifting-state), where a child form built a product object and passed it up to `App` through `onAdd`.

This step sends the shopper to the new product's page from code, right after the form is submitted, with the router's `useNavigate` hook.
Watch the address bar after the submit: the app, not a link, decides where to go.

```predict
Run the starter, press **Add a product**, fill in a title and a price, and submit; what does the result show?
- The new product's page, with the title and price you typed
- The Products list, with the new product last
= The same form, with its fields emptied
```

We prepared the form.
`App` now keeps the products in state and passes them down, as it did in Week 11, and `NewProductPage` at `/products/new` builds a product from its fields and calls `onAdd`.
The nav has a third link, and the Products link gained `end`, because `/products/new` starts with `/products` and should not mark both.

Run the starter, press **Add a product**, fill in a title and a price, and submit.
The product is added, which you can confirm on the Products page, but the shopper is left on an empty form with no sign that anything happened.

## Navigate after the submit

Import the hook.

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, Link, NavLink, Route, Routes, useParams } from "react-router";'
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router";
```

Call it at the top of the component, as every hook is called, and keep the function it returns.

```jsx file="src/App.jsx" action="replace" anchor="function NewProductPage({ onAdd }) {"
function NewProductPage({ onAdd }) {
  const navigate = useNavigate();

```

The fence ends with a blank line so that the hook call and `handleSubmit` stay separated.

Then, instead of clearing the form, go to the new product's page.

```predict
After this edit, submit `Kiwi` at `2.49`; what does the address bar show?
- `/products/new`, because the form is still the current page
= `/products/` followed by the new product's id
- `/products/Kiwi`, built from the title
```

```jsx file="src/App.jsx" action="replace" anchor="    form.reset();"
    navigate(`/products/${product.id}`);
```

`onAdd(product)` stores the product first, and then `navigate` changes the address to the page that shows it.

## Read more

### A link or the app

A link is the right tool when the shopper chooses where to go.
Sometimes the app decides: after a form is submitted, after a login, after a delete.
For that the router gives a hook, `useNavigate`, that returns a function you call with a path.

`useNavigate` is a hook, so it cannot be called inside `handleSubmit`; the rule from Week 11 is that hooks are called at the top level of a component, on every render, in the same order.

### One submit, in order

The sequence inside one submit is now: `onAdd(product)` asks `App` to store the product, and `navigate` asks the router to change the address.
`App` renders with the new item, the router matches `/products/<id>`, and `ProductPage` finds the product in the `items` it receives, so the page the shopper lands on already shows what they just typed.

### Two routes for one address

Two routes could claim that address.
`/products/new` is a fixed path and `/products/:id` has a parameter, and the router prefers the more specific one, so **Add a product** opens the form and not a product page with the id `new`.

**If it breaks:** If the console says `Invalid hook call` or `useNavigate() may be used only in the context of a <Router>`, the hook is called inside `handleSubmit` or outside the router; move it to the first line of the component.
If the page after the submit says no product has the id, `navigate` runs with a different id than the product carries; build the path from `product.id`.
If submitting reloads the result, `event.preventDefault()` was removed.

**Check:** Run the code with the **Flow** view open.
Press **Add a product**, type `Kiwi` and `2.49`, and press **Add product**.
The trace shows the submit event in `NewProductPage`, the `onAdd` prop call into `App`, and `setItems`; then the address bar shows `/products/` followed by the new id and the page shows `Kiwi` at `$2.49`.
Press **Back to the products**: seven products, Kiwi last.
Press **Back** in the address bar twice, and you return through the product page to the form, because `navigate` pushed an entry into history exactly as a link would have.
Press **Run checks**.

```quiz
Why is `useNavigate()` called at the top of `NewProductPage` and not inside `handleSubmit`?
- Because `navigate` only works before the form is filled in
= Because hooks are called at the top level of a component, on every render, in the same order
- Because `handleSubmit` runs before the router exists
> The hook returns a function that is kept in `navigate`; calling that function inside `handleSubmit` is fine, but calling the hook there breaks the rule of hooks.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";
import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router";
import { products } from "./products.js";

function HomePage({ count }) {
  return (
    <main>
      <h1>Welcome to the shop</h1>
      <p className="lead">{count} products in stock. Open the Products page to browse them.</p>
    </main>
  );
}

function ProductsPage({ items }) {
  return (
    <main>
      <h1>Products</h1>
      <ul className="product-list">
        {items.map((product) => (
          <li key={product.id}>
            <Link className="product-title" to={`/products/${product.id}`}>{product.title}</Link>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}

function ProductPage({ items }) {
  const { id } = useParams();
  const product = items.find((item) => item.id === Number(id));
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

function NewProductPage({ onAdd }) {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const product = {
      id: Date.now(),
      title: form.elements.title.value,
      category: form.elements.category.value,
      price: Number(form.elements.price.value)
    };
    onAdd(product);
    navigate(`/products/${product.id}`);
  }

  return (
    <main>
      <h1>Add a product</h1>
      <form className="add-form" onSubmit={handleSubmit}>
        <label>
          Title
          <input name="title" type="text" required />
        </label>
        <label>
          Price
          <input name="price" type="number" min="0" step="0.01" required />
        </label>
        <label>
          Category
          <select name="category">
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
          </select>
        </label>
        <button type="submit">Add product</button>
      </form>
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
  const [items, setItems] = useState(products);

  function handleAdd(product) {
    setItems([...items, product]);
  }

  return (
    <BrowserRouter>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/products" end>Products</NavLink>
        <NavLink to="/products/new">Add a product</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage count={items.length} />} />
        <Route path="/products" element={<ProductsPage items={items} />} />
        <Route path="/products/new" element={<NewProductPage onAdd={handleAdd} />} />
        <Route path="/products/:id" element={<ProductPage items={items} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

</details>
