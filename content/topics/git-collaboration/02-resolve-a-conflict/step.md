---
title: Resolve a conflict
mode: edit
entry: src/main.jsx
starterCompiles: false
required: [no-markers, both-features-render, search-filters, cart-counts]
---

Two classmates each added a feature to the Campus Shop on their own branch: one a search box, the other a cart summary.
The search branch was merged first, and merging the cart branch stopped with a conflict in `src/App.jsx`, which is the file in the editor now, markers and all.
The result pane says the page did not compile, because the markers are not JavaScript; your job is to keep both features, remove every marker, and watch the page come back with both.

```demo name="merge-conflict"
{
  "file": "src/App.jsx",
  "base": ["<ProductList products={products} />"],
  "ours": ["<SearchBox query={query} onChange={setQuery} />", "<ProductList products={shown} />"],
  "theirs": [
    "<CartSummary items={cart} />",
    "<ProductList products={products} onAdd={(product) => setCart([...cart, product])} />"
  ]
}
```

## Read the markers

Open `src/App.jsx` and find the two marked regions.
In each one, the lines between `<<<<<<< HEAD` and `=======` are **ours**, the search branch that `main` already holds, and the lines between `=======` and `>>>>>>> cart-summary` are **theirs**, the branch being merged.
Everything outside the markers merged on its own: both branches added the same `import { useState } from "react";` line, and the new files `SearchBox.jsx` and `CartSummary.jsx`, and `ProductList.jsx`, which only the cart branch changed, came through untouched.

Resolving does not mean picking a side.
Each side added something the other needs, so the resolution keeps both and makes them fit together.

## The imports and the state

The first region is the top of the file.
Both sides imported `products` and declared `App`, so those lines appear once; each side's own import and state are kept, and the `shown` filter from the search side stays with them.

```jsx file="src/App.jsx" action="replace" anchor='<<<<<<< HEAD\nimport SearchBox from "./SearchBox.jsx";\nimport products from "./products.js";\n\nexport default function App() {\n  const [query, setQuery] = useState("");\n  const shown = products.filter((product) =>\n    product.title.toLowerCase().includes(query.toLowerCase()),\n  );\n=======\nimport CartSummary from "./CartSummary.jsx";\nimport products from "./products.js";\n\nexport default function App() {\n  const [cart, setCart] = useState([]);\n>>>>>>> cart-summary'
import SearchBox from "./SearchBox.jsx";
import CartSummary from "./CartSummary.jsx";
import products from "./products.js";

export default function App() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState([]);
  const shown = products.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase()),
  );
```

## The rendered components

The second region is inside `<main>`, and the two sides disagree about `ProductList`: the search side passes the filtered `shown` list, and the cart side passes `onAdd`.
One `ProductList` takes both props, so the search filters the list and every product in it can still go into the cart.

```jsx file="src/App.jsx" action="replace" anchor='<<<<<<< HEAD\n      <SearchBox query={query} onChange={setQuery} />\n      <ProductList products={shown} />\n=======\n      <CartSummary items={cart} />\n      <ProductList products={products} onAdd={(product) => setCart([...cart, product])} />\n>>>>>>> cart-summary'
      <SearchBox query={query} onChange={setQuery} />
      <CartSummary items={cart} />
      <ProductList products={shown} onAdd={(product) => setCart([...cart, product])} />
```

Press **Run**.
The page shows the heading, the search box, the cart summary at `0 items in the cart, $0.00`, and four products, each with an **Add to cart** button.
Type `hoo` in the search box and only the Hoodie is left; add it to the cart and the summary says `1 item in the cart, $34.00`.

## Read more

### Why Git stopped

A merge compares three versions: the commit where the branches split, called the base, and the newest commit on each side.
In the base, `App` rendered one line, `<ProductList products={products} />`.
Each branch changed that same line in its own way, so Git had two different replacements for one line and no rule for choosing; it wrote both into the file between markers and stopped, which is the merge conflict the picture draws.
Lines that only one side changed, or that both sides changed identically, merge on their own.

### The same thing in a terminal

On your computer, the merge prints:

```text
Auto-merging src/App.jsx
CONFLICT (content): Merge conflict in src/App.jsx
Automatic merge failed; fix conflicts and then commit the result.
```

`git status` lists the file under "Unmerged paths" as `both modified`.
You edit the file exactly as you did here, then `git add src/App.jsx` to mark it resolved and `git commit` to make the merge commit; `git merge --abort` instead puts everything back as it was before the merge.
Visual Studio Code highlights each region and offers **Accept Current Change**, **Accept Incoming Change**, and **Accept Both Changes** above it; none of the three gives this resolution on its own, because both sides changed the same `ProductList` line, which is why reading the code matters more than the buttons.

### Fewer conflicts

Conflicts come from two branches changing the same lines while apart.
Small branches that are merged within a day or two, and pulling `main` into a long branch every so often, keep them small; [The daily loop](#/topic/git-collaboration/6) is that habit.

**If it breaks:** If the result pane still says the page did not compile, a marker line is left; search the file for `=======`.
`'SearchBox' is not defined` or `'CartSummary' is not defined` in the console means its import was dropped with the side it came from.
If searching works but **Add to cart** does nothing, `ProductList` is missing `onAdd`; if adding works but the search does not filter, it is getting `products` instead of `shown`.

**Check:** No conflict marker is left, the page renders with both the search box and the cart summary, typing `hoo` leaves only the Hoodie, and **Add to cart** adds one item to the summary.

```quiz
Between `<<<<<<< HEAD` and `=======`, whose lines are they?
= Ours: the branch you are on, which receives the merge
- Theirs: the branch being merged in
- The base: the version before either branch changed it
> HEAD is the branch you are on; the lines after `=======` come from the branch named after `>>>>>>>`.
```

```quiz
After you edit a conflicted file on your computer, what tells Git it is resolved?
- Saving the file
= `git add` on the file, then `git commit` to finish the merge
- `git merge --abort`
> Git checks nothing in the file itself; `git add` is how you say the file is ready, and the commit records the merge.
```
