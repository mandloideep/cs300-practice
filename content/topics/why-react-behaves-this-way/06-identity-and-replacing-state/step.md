---
title: Identity and replacing state
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [a-new-array, page-shows-the-new-item, count-follows]
---

**We used this in:** [Objects and references](#/topic/objects-and-references/2), where two arrays could look the same without being the same array, and [Arrays in depth](#/topic/arrays-in-depth/6), which sorted every method into the ones that change an array and the ones that return a new one.

This step adds an item to a cart with `push`, which changes the array, and watches React refuse to redraw.
Then it adds the item by building a new array, and React redraws at once.
Watch the console and the page disagree, and then agree.

```demo name="mutation-vs-copy"
```

Press **Run**.
The checks press **Add the next item** once, so the console already shows `The array now holds 2 items`, while the page still says `Items in the cart: 1` with one row.
Click the button yourself a few times: the console counts up, and the page does not move.

The array is right and `setItems` is called; React decides nothing changed.
`items.push(next)` puts the item into the same array this render already holds, and `setItems(items)` hands React that same array back.
Before it redraws, React compares the new state with the old one by identity, the way `===` compares objects in [Objects and references](#/topic/objects-and-references/2): same array, so nothing to do.
The data did change, but React has no way to see a change made inside an object it already has.

Replace the three lines that change the array with ones that make a new array.

```predict
After the edit, what does `Same array as before?` print when you click?
- `true`
= `false`
- `undefined`
```

```jsx file="src/App.jsx" action="replace" anchor='    items.push(next);\n    setItems(items);\n    console.log("The array now holds", items.length, "items");'
    const nextItems = [...items, next];
    console.log("Same array as before?", nextItems === items);
    setItems(nextItems);
    console.log("The new array holds", nextItems.length, "items");
```

Run it and click the button.
The console says `Same array as before? false`, and the page gains a row and its count with every click.
`[...items, next]` is a new array holding the old items and the new one, so the identity check sees a different array and React draws the next render with it.
The old array is left exactly as it was, which is what the render that is still on the screen was drawn from.

## Read more

### Why React works this way

Checking identity is instant, whatever the size of the state, while comparing every item of a large list on every update would be slow and still could not tell which parts moved.
So React makes a deal with you: never change state in place, always hand the setter a new value, and React treats "a new value" as "something changed".
The same rule covers objects, `setStudent({ ...student, score: 90 })`, and nested data, where each level you change gets its own spread, as [Objects and references](#/topic/objects-and-references/3) showed.

Try one more mistake on purpose: replace the spread line with `const nextItems = items;` and push onto it.
The log says `Same array as before? true` and the page stops again, because a second name for an array is not a second array.
Put the spread back.

The methods that return a new array, `map`, `filter`, `slice`, `concat`, spread, and `toSorted`, are the ones state updates use; `push`, `splice`, `sort`, and `reverse` change the array and belong only on a copy.
You will use exactly this pattern in [Events and lifting state](#/topic/events-and-lifting-state/4) and [Controlled forms](#/topic/controlled-forms/5), where a form adds a product to a list in the parent.

**If it breaks:** If the page still does not change, `setItems` still receives `items`, or the spread line is missing its brackets, as in `...items, next`.
If the new row shows but the console says `Same array as before? true`, the log compares the wrong two names; it should compare `nextItems` with `items`.
If the console shows a warning about two children with the same key, an item was given an id that is already in the list; the starter's `items.length + 1` stays unique only while items are added and never removed.

**Check:** Run the code.
Each click adds one row, the count above the list follows, and the console says `Same array as before? false` with the new length.

```quiz
Which update makes React redraw a list of items?
- `items.push(item); setItems(items);`
- `items.sort(); setItems(items);`
= `setItems([...items, item]);`
> React compares the new state with the old one by identity, so only a new array counts as a change; push and sort change the same array in place.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

const shelf = ["Apple", "Cooking Oil", "Powder Canister", "Dior J'adore"];

export default function App() {
  const [items, setItems] = useState([{ id: 1, title: "Essence Mascara Lash Princess" }]);

  function handleAdd() {
    const next = { id: items.length + 1, title: shelf[(items.length - 1) % shelf.length] };
    const nextItems = [...items, next];
    console.log("Same array as before?", nextItems === items);
    setItems(nextItems);
    console.log("The new array holds", nextItems.length, "items");
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">Items in the cart: {items.length}</p>
      <button type="button" onClick={handleAdd}>Add the next item</button>
      <ul className="task-list">
        {items.map((item) => (
          <li key={item.id} className="task">
            {item.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

</details>
