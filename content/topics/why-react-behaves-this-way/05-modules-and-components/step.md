---
title: Modules and components
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [ProductCard]
required: [module-runs-once, three-cards-from-the-module, cards-still-work]
---

**We used this in:** [Modules and imports](#/topic/modules-and-imports/4), where a module imported from two places ran once, and [Vite project anatomy](#/topic/vite-project-anatomy/3), where a first component went into a file of its own.

This step moves `ProductCard` out of `App.jsx` into its own file and counts how many times each file runs.
A component file is an ordinary JavaScript module, so everything the modules topic showed still holds: an `export default`, an `import` with a relative path that includes the extension, and a file that runs once however often it is used.
Watch the console for the line each file prints when it runs, and compare it with the number of cards on the page.

The workspace is the cart from the first step of this topic, and it has a new, nearly empty file, `src/ProductCard.jsx`, which holds only `export {};`, a module that exports nothing.
Press **Run**: three cards, and one console line, `Added to the cart: 1 x Essence Mascara Lash Princess`, from the checks pressing **Add one** on the first card.

Cut the whole `ProductCard` function out of `src/App.jsx`, from `function ProductCard` to its closing brace and the blank line after it.

```jsx file="src/App.jsx" action="delete" anchor='function ProductCard({ product }) {\n  function handleAdd(quantity) {\n    console.log("Added to the cart:", quantity, "x", product.title);\n  }\n\n  return (\n    <article className="product">\n      <h3>{product.title}</h3>\n      <p className="product-price">${product.price.toFixed(2)}</p>\n      <div className="cart-controls">\n        <button type="button" onClick={() => handleAdd(1)}>Add one</button>\n        <button type="button" onClick={() => handleAdd(3)}>Add three</button>\n      </div>\n    </article>\n  );\n}\n'
```

Then fill `src/ProductCard.jsx` with it: paste it over `export {};`, put `export default` in front of `function`, and add a first line that reports when the file runs.

```jsx file="src/ProductCard.jsx" action="replace" anchor="export {};"
console.log("ProductCard.jsx ran");

export default function ProductCard({ product }) {
  function handleAdd(quantity) {
    console.log("Added to the cart:", quantity, "x", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <div className="cart-controls">
        <button type="button" onClick={() => handleAdd(1)}>Add one</button>
        <button type="button" onClick={() => handleAdd(3)}>Add three</button>
      </div>
    </article>
  );
}
```

`App.jsx` now uses a name it no longer has, so import it at the top.

```jsx file="src/App.jsx" action="insert-before" anchor="const products = ["
import ProductCard from "./ProductCard.jsx";

```

Run it once now: the cards are back, and the console shows `ProductCard.jsx ran`.
The import names the default export `ProductCard`, the name every JSX tag `<ProductCard />` needs; JSX looks the tag up as an ordinary variable in the file, so it must be imported or declared there.

Finally, give `App.jsx` its own report, just above the component.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
console.log("App.jsx ran");

```

Predict before you run: the page draws three cards, twice each in Strict Mode, so how many times does the console show `ProductCard.jsx ran`, once, three times, or six times?
And which line comes first, `ProductCard.jsx ran` or `App.jsx ran`?
Run it.
`ProductCard.jsx ran` appears once, above `App.jsx ran`.

## Why React works this way

Two different things run here, at two different times.
The **module** runs once, when the browser first loads it, and that is when its top-level lines, the `console.log` and the `function` declaration, run.
The **component** is the function the module exports, and React calls it once per card per render, which is six calls on the first render in Strict Mode, and again for every update.
The order follows the import graph: `App.jsx` imports `ProductCard.jsx`, so the imported module runs first, the dependency before the file that needs it, exactly as in [Modules and imports](#/topic/modules-and-imports/3).

That is why a value you want to keep between renders never goes at the top of a component file as a plain variable: the module's variables are shared by every card and never trigger a render, while `useState` gives each card its own value and redraws it.
And it is why a file per component costs nothing at run time: Vite and the lab load each module once, and the build joins them into one file anyway.

**If it breaks:** If the result says `ProductCard is not defined`, the import line is missing at the top of `App.jsx`.
If it says `does not provide an export named 'default'`, the `export default` is missing in front of `function ProductCard`.
If it says `Cannot find "./ProductCard"`, the import left out the `.jsx` extension or spells the file name with different capitals.
If `ProductCard.jsx ran` appears more than once, the `console.log` went inside the component instead of above it.

**Check:** Run the code.
Three cards render, the console shows `ProductCard.jsx ran` once and then `App.jsx ran`, and **Add one** still adds to the cart.

<details>
<summary>src/ProductCard.jsx after this step</summary>

```jsx
console.log("ProductCard.jsx ran");

export default function ProductCard({ product }) {
  function handleAdd(quantity) {
    console.log("Added to the cart:", quantity, "x", product.title);
  }

  return (
    <article className="product">
      <h3>{product.title}</h3>
      <p className="product-price">${product.price.toFixed(2)}</p>
      <div className="cart-controls">
        <button type="button" onClick={() => handleAdd(1)}>Add one</button>
        <button type="button" onClick={() => handleAdd(3)}>Add three</button>
      </div>
    </article>
  );
}
```

</details>

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, title: "Essence Mascara Lash Princess", price: 9.99 },
  { id: 16, title: "Apple", price: 1.99 },
  { id: 20, title: "Cooking Oil", price: 4.99 }
];

console.log("App.jsx ran");

export default function App() {
  return (
    <main>
      <h1>Cart</h1>
      <ul className="product-list">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </main>
  );
}
```

</details>
