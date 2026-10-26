---
title: ProductCard and ProductList with two variations
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [ProductList, ProductCard]
required: [two-product-lists, cards-in-both-lists, variants-differ]
---

**We used this in:** [Components and props](#/topic/components-and-props) covered destructuring, default values, and composition.

This step applies the pattern from our Week 10 Session 2 example to the product page.
In that example, `CourseCard` drew one course and `CourseList` mapped the courses to cards and handled the empty case.
Here `ProductCard` will draw one product, `ProductList` will map products to cards, and a `variant` prop will let the same two components draw two different layouts:

- `card`: a grid of boxes with the category and rating, for browsing.
- `row`: a compact line with only the title and price, for a short "Top rated" list.

Start with the card, above `ProductList`.

```jsx file="src/App.jsx" action="insert-before" anchor="function ProductList({ items }) {"
function ProductCard({ product, variant = "card" }) {
  return (
    <article className={`product product--${variant}`}>
      <h3>{product.title}</h3>
      {variant === "card" && <p className="product-meta">{product.category}, rated {product.rating} of 5</p>}
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

```

`ProductCard` receives the whole product object as one prop.
When a component shows several fields of the same object, passing the object keeps the tag short.
The class name is a template literal, so `variant="row"` produces `product product--row` and the stylesheet styles each variation.
The `&&` line from the JSX rules topic shows the category and rating only in the `card` variation.
`variant = "card"` is a default, so a parent that does not care about layout gets the grid.

Now let `ProductList` accept the same prop.

```jsx file="src/App.jsx" action="replace" anchor="function ProductList({ items }) {"
function ProductList({ items, variant = "card" }) {
```

Give the list a class for its layout.

```jsx file="src/App.jsx" action="replace" anchor='    <ul className="product-list">'
    <ul className={`product-list product-list--${variant}`}>
```

Replace the two spans inside the `li` with the card.
First the title span becomes the `ProductCard` tag.

```jsx file="src/App.jsx" action="replace" anchor='          <span className="product-title">{product.title}</span>'
          <ProductCard product={product} variant={variant} />
```

Then delete the price span, because the card now shows the price.

```jsx file="src/App.jsx" action="delete" anchor='          <span className="product-price">${product.price.toFixed(2)}</span>'
```

The `key` stays on the `li`, the outermost element the `map` returns.
`ProductList` passes its own `variant` down to every card, so one prop on the list controls the layout of all of its cards.
Data moves one way: `App` gives products to `ProductList`, and `ProductList` gives one product at a time to `ProductCard`.

Back in `App`, compute the top rated products from the visible ones, right after `visibleProducts`.

```jsx file="src/App.jsx" action="insert-after" anchor='  const visibleProducts = category === "all" ? loadedProducts : loadedProducts.filter((product) => product.category === category);'
  const topRated = visibleProducts.filter((product) => product.rating >= 4.5);
```

Finally, render two lists instead of one.

```jsx file="src/App.jsx" action="replace" anchor="        <ProductList items={visibleProducts} />"
        <>
          <h2>Top rated</h2>
          <ProductList items={topRated} variant="row" />
          <h2>All products</h2>
          <ProductList items={visibleProducts} />
        </>
```

The fragment groups the two headings and two lists into the one value the conditional branch needs, without adding a `div` to the page.
Each list keeps the empty state from Step 3, so choosing a category with no top rated product says so in that section alone.

**Check:** Run the code.
**Top rated** shows two compact rows, Powder Canister and Cooking Oil, and **All products** shows six boxes in a grid with category and rating.
The inspector tree shows two `ProductList` components; select each and compare their `variant` props.
Choose **Fragrances**: the top rated section reports that no products match, while the grid shows the two fragrances.

**If it breaks:** If both lists look the same, the `variant` prop is not passed from `ProductList` to `ProductCard`, or the class name uses quotes instead of backticks.
If a card shows `undefined`, the card reads a field the object does not have; `product.name` should be `product.title`.
If the console warns about keys again, the `key` moved onto `ProductCard` inside the `li` or disappeared from the `li`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

function ProductCard({ product, variant = "card" }) {
  return (
    <article className={`product product--${variant}`}>
      <h3>{product.title}</h3>
      {variant === "card" && <p className="product-meta">{product.category}, rated {product.rating} of 5</p>}
      <p className="product-price">${product.price.toFixed(2)}</p>
    </article>
  );
}

function ProductList({ items, variant = "card" }) {
  if (items.length === 0) {
    return <p role="status" className="message">No products match this category.</p>;
  }
  return (
    <ul className={`product-list product-list--${variant}`}>
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} variant={variant} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  const [category, setCategory] = useState("all");
  const [failed, setFailed] = useState(false);
  const loadedProducts = failed ? [] : products;
  const error = failed ? "The product list could not be loaded. Try again in a moment." : null;
  const visibleProducts = category === "all" ? loadedProducts : loadedProducts.filter((product) => product.category === category);
  const topRated = visibleProducts.filter((product) => product.rating >= 4.5);
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">Filter by category, or pretend the data failed to load.</p>
      <div className="controls">
        <label>
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="all">All</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
            <option value="groceries">Groceries</option>
            <option value="furniture">Furniture</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={failed} onChange={(event) => setFailed(event.target.checked)} />
          Pretend the load failed
        </label>
      </div>
      {error ? (
        <p role="alert" className="message message--error">{error}</p>
      ) : (
        <>
          <h2>Top rated</h2>
          <ProductList items={topRated} variant="row" />
          <h2>All products</h2>
          <ProductList items={visibleProducts} />
        </>
      )}
    </main>
  );
}
```

</details>
