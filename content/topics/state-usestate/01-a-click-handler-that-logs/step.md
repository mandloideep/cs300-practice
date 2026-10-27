---
title: A click handler that logs
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [ProductCard]
required: [handler-not-called-during-render, click-logs-once, button-per-card]
---

**We used this in:** [Lists and keys](#/topic/lists-and-keys) built this product page; we trimmed it to one grid of cards so that the new code stands out.
This step gives each card's **Add to cart** button a click handler, first with the most common React mistake on purpose and then with the fix.
Watch the difference between handing React a function to run later and calling that function yourself.

```demo name="callback"
```

Open `src/App.jsx`.
Each `ProductCard` now has an **Add to cart** button, and clicking it does nothing, because the button has no handler.
In React an event handler is a prop you pass directly to the JSX element: `onClick={handler}`.

Define the handler above the `return`, inside the component, so that it can read the component's props.
The block starts with the first line of `ProductCard` and ends with its `return (` line, both already there, so in practice you type the function between them.

```jsx file="src/App.jsx" action="replace" anchor="function ProductCard({ product }) {\n  return ("
function ProductCard({ product }) {
  function handleAdd() {
    console.log("Added to the cart:", product.title);
  }

  return (
```

The name follows the course convention, `handle` plus what it handles, and `handleAdd` can read `product` because it is defined inside `ProductCard`.

Now attach it to the button.
Type it with parentheses first, because this is the most common React mistake in our class and you should see what it does.

```predict
After you attach the handler with parentheses and run, what does the console show before you click anything?
- Nothing, because the handler waits for a click
= An `Added to the cart:` message for every product
- An error saying `handleAdd` is not a function
```

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button">Add to cart</button>'
      <button type="button" onClick={handleAdd()}>Add to cart</button>
```

Run the code and open the console.
Six messages are already there, one per product, and nobody has clicked anything.
Click a button: nothing is added.
`handleAdd()` with parentheses **calls** the function while React is rendering the card, so `onClick` receives what it returns, `undefined`.

The fix is to pass the function itself, without parentheses.

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button" onClick={handleAdd()}>Add to cart</button>'
      <button type="button" onClick={handleAdd}>Add to cart</button>
```

Run again.
The console is empty until you click, and then each click logs one message naming the product on that card.

## Read more

In Week 5 and Week 6 we wired a button with `querySelector` and `addEventListener("click", handler)`.
In React there is no `querySelector`, because the component already describes the button, and there is no `addEventListener`, because React attaches the listener for us.
The names are camelCase: `onClick`, `onChange`, `onSubmit`.

`product` is a parameter of `ProductCard`, so only a function defined inside it can read it; a function defined outside would have no idea which card was clicked.

Here is what happened with the parentheses.
`handleAdd()` **calls** the function right there, while React is rendering the card, and the message is logged then.
The call returns `undefined`, so `onClick` receives `undefined` and the button has no handler at all.
You may see each message twice: in development, React's Strict Mode calls every component twice on purpose to catch components that behave differently on a second call, which the fetch step of Week 10 also ran into.

Think of the fix as handing someone your phone number instead of calling them right now.

When the handler needs an argument, the arrow function form `onClick={() => handleDelete(item.id)}` defines a new function that calls yours later, which is still passing a function rather than calling one.
React also passes an event object to every handler, as the DOM did in Week 5; the next topic uses it to stop a form from reloading the page.

**If it breaks:** If messages appear before any click, look for `handleAdd()` with parentheses inside the `onClick` braces.
If clicking logs nothing and the console is empty, the button has no `onClick`, or the attribute is written in lowercase as `onclick`, which React does not recognize.
If the console says `handleAdd is not defined`, the function is outside `ProductCard` or below the `return`.

**Check:** Run the code.
The console is empty after the page renders.
Click **Add to cart** on two different cards: two messages appear, each naming the product on the card you clicked.
Press **Run checks** to confirm; the first check reads the console to tell a message logged during rendering from one logged by a click.

```quiz
What does `onClick={handleAdd()}` give the button?
- The function `handleAdd`, to run on each click
= The value `handleAdd` returns, which is `undefined`
- A new function that calls `handleAdd` later
> The parentheses call the function during the render, so `onClick` gets its return value; `onClick={handleAdd}` passes the function itself, and `onClick={() => handleAdd()}` passes a new function that calls it later.
```

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

function ProductCard({ product }) {
  function handleAdd() {
    console.log("Added to the cart:", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-meta">{product.category}, rated {product.rating} of 5</p>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <button type="button" onClick={handleAdd}>Add to cart</button>
    </article>
  );
}

function ProductList({ items }) {
  return (
    <ul className="product-list">
      {items.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <main>
      <h1>Product list</h1>
      <p className="lead">{products.length} products in stock.</p>
      <ProductList items={products} />
    </main>
  );
}
```

</details>
