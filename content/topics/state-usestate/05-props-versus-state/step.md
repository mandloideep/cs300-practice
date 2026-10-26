---
title: "Props versus state, and the rules of hooks"
mode: read
---

This topic gave `ProductCard` two things it did not have in Week 10: a handler that runs when the shopper clicks, and values the card owns and can change.
Before we move those values around between components in the next topic, here is the vocabulary in one place.

## Props versus state

| | Props | State |
| --- | --- | --- |
| Who owns it? | The parent component | This component |
| Can it change? | No, props are read-only | Yes, through the setter function |
| How is it set? | By the parent, as attributes on the tag | By `useState` inside the component |
| When it changes | The parent re-renders and passes new props | The component re-renders itself |

Think of it this way: props are like the arguments a function receives, and state is like the variables a function creates.
You cannot change your arguments, but you can change your own variables.

In our product page, `product` is a prop: `ProductList` passes it, and `ProductCard` only reads it.
`quantity` and `saved` are state: `ProductCard` created them with `useState` and changes them with `setQuantity` and `setSaved`.
When Step 4 of [Components and props](#/topic/components-and-props) said that a value which needs to change over time is state, this is what it meant.

## What a setter does

Calling a setter is the only way to change state, and it always does the same two things.

1. React stores the new value.
2. React calls the component again, from the top; `useState` now returns the stored value, and React changes only what differs on the page.

Because of step 2, the state variable is a `const`: each call of the component is a snapshot with its own value.
`quantity = quantity + 1` would change a local variable that nobody looks at again, and React would never know; `setQuantity(quantity + 1)` is what asks for a new render.

## The rules of hooks

`useState` is a **hook**: a function whose name starts with `use` and that gives a component a React feature.
Hooks come with two rules that React enforces.

1. Call hooks only at the top level of the component, never inside an `if`, a loop, or a nested function.
2. Call hooks only inside a React component, or inside another hook.

Step 4 showed why the first rule exists.
React keeps each component's state in slots, in the order the hook calls happen.
If a `useState` call ran only sometimes, the order would differ between renders and React would hand back the wrong value, which is what the error `Rendered more hooks than during the previous render` reports.

```jsx
function ProductCard({ product }) {
  if (product.price > 50) {
    const [saved, setSaved] = useState(false);
  }
}
```

The version React accepts calls the hook first and asks the question afterwards.

```jsx
function ProductCard({ product }) {
  const [saved, setSaved] = useState(false);
  if (product.price > 50) {
    return <p>Too expensive to save.</p>;
  }
}
```

## The three mistakes to look for first

When a click does nothing, check these in order; together they account for most of the questions we get in this session.

1. `onClick={handleAdd()}` calls the function during render; write `onClick={handleAdd}`.
2. `import { useState } from "react";` is missing from the first line, and the console says `useState is not defined`.
3. The handler assigns to the state variable instead of calling the setter.

## What comes next

Every piece of state in this topic lived in the component that used it, and that worked because `ProductCard` was the only component that needed its quantity.
The next topic, [Events and lifting state](#/topic/events-and-lifting-state), starts with two components that need the same value, and moves the state up to the parent that contains them both.
The inspector gains a **Flow** view there, which draws each click as a sequence: the event, the function the parent passed down, the setter, and the components that rendered.

**Check:** Without looking back, say in one sentence each what `useState(0)` returns, what calling the setter does, and where in a component a hook may be called.
If your three sentences mention a pair, a re-render, and the top level, you have what the next topic needs.

**If it breaks:** If the snapshot idea is still fuzzy, go back to Step 3, keep the `Rendering` log, and read the quantity in each console line while you click; every line is one call of the function with its own `const`.
