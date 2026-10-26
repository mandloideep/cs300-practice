---
title: Render a list with .map()
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [six-items, items-from-data, prices-formatted]
---

**We used this in:** [Components and props](#/topic/components-and-props) wrote one tag per course by hand; this topic renders the tags from an array.

Open `src/App.jsx`.
The `products` array holds six products, and the lead sentence already reads `products.length` from it.
The list, though, has one item typed by hand, so the page says six products and shows one.
Typing a tag per product does not scale and goes stale the moment the data changes.

In Week 6 we built lists in vanilla JavaScript by mapping an array to HTML strings, joining them, and setting `innerHTML`.
React takes the same first step, `.map()`, but the callback returns JSX instead of a string.
React accepts an array of elements as a child, so there is no `join` and no `innerHTML`; React creates the DOM nodes for us.

Replace the hand-written item with a `.map()` over the data.

```jsx file="src/App.jsx" action="replace" anchor="        <li>Essence Mascara Lash Princess, $9.99</li>"
        {products.map((product) => (
          <li>
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
```

Read it from the outside in.
The outer braces switch from JSX to JavaScript.
`products.map(...)` calls the arrow function once per product and collects what it returns into a new array.
The parentheses after the arrow wrap a multi-line JSX value, so the function returns one `li` for each product.

Inside the `li`, `{product.title}` and `{product.price.toFixed(2)}` read from the current object.
The `$` before the price brace is plain text in JSX, not template literal syntax, so it appears on the page as a dollar sign.
`toFixed(2)` returns the number as a string with exactly two decimals, so a price of `2.5` would show as `2.50`.

**Check:** Run the code.
Six rows appear, one per product, each with a title on the left and a price on the right.
Add a seventh object to the array, for example `{ id: 30, title: "Kiwi", category: "groceries", price: 2.49, rating: 4.93 }`, and run again: a seventh row appears and the lead sentence says seven, with no other change.
Remove it again before moving on.

Now open the console.
React has logged a warning that starts with `Each child in a list should have a unique "key" prop`.
The page works, so the warning is easy to ignore, but it points at a real problem that Step 2 makes visible and then fixes.

**If it breaks:** If the list is empty and the console is silent, the arrow function uses braces without `return`, as in `(product) => { <li>...</li> }`; use parentheses around the JSX, or write `return` inside the braces.
If the page shows `[object Object]`, the code inside braces is an object rather than JSX or text, for example `{product}` instead of `{product.title}`.
If the console says `toFixed is not a function`, the `price` in one of the objects is written as a string in quotes.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
const products = [
  { id: 1, title: "Essence Mascara Lash Princess", category: "beauty", price: 9.99, rating: 2.56 },
  { id: 3, title: "Powder Canister", category: "beauty", price: 14.99, rating: 4.64 },
  { id: 6, title: "Calvin Klein CK One", category: "fragrances", price: 49.99, rating: 4.37 },
  { id: 8, title: "Dior J'adore", category: "fragrances", price: 89.99, rating: 3.8 },
  { id: 16, title: "Apple", category: "groceries", price: 1.99, rating: 4.19 },
  { id: 20, title: "Cooking Oil", category: "groceries", price: 4.99, rating: 4.8 }
];

export default function App() {
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock.</p>
      <ul className="product-list">
        {products.map((product) => (
          <li>
            <span className="product-title">{product.title}</span>
            <span className="product-price">${product.price.toFixed(2)}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

</details>
