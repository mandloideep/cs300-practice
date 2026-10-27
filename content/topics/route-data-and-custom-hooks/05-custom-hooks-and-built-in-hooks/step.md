---
title: Custom hooks and the built-in ones
mode: read
---

This topic used two hooks we wrote, `useFetch` and `useLocalStorage`, beside the ones React ships.
Here is how they relate, so that you can decide when to write the next one.

## A custom hook is a function that calls hooks

`useState` and `useEffect` are the primitives: React itself keeps the state and runs the effect.
`useFetch` and `useLocalStorage` are ordinary functions that call those primitives in a fixed order.
Nothing about them is special to React except the name, which starts with `use` so that React, the linter, and the person reading the code know that hook rules apply inside.

| | Built in | Custom |
| --- | --- | --- |
| Where it comes from | `import { useState } from "react"` | A file in your project |
| What it holds | The state or effect itself | Nothing; it calls hooks that hold things |
| Who owns the state | The component that called it | The component that called the custom hook |
| Can it call other hooks | No, they are the bottom | Yes, that is its whole job |

The third row is the one the inspector showed you.
`ProductsPage` listed two state values after one call to `useFetch`, because the hook's `useState` calls ran as part of `ProductsPage`'s render.
A custom hook has no state of its own, and two components that call `useFetch` get two separate requests with two separate states, the way two `ProductCard`s each had their own quantity in Week 11.

## The rules still apply inside

A custom hook calls hooks, so the rules of hooks from Week 11 hold for it and for its callers.

- Call it at the top level of a component or of another hook, never inside `if`, a loop, or a callback.
- Call it in the same order on every render, which the first rule gives you for free.
- Name it `useSomething`, so that the rules can be checked by reading the name.

`useFetch` calls `useState` twice and `useEffect` once, in that order, every time; that is why React can match each call with the value it kept from the last render.

## When to extract one

Write a custom hook when the same stateful pattern appears in a second component.
Not for a single call, and not to hide a one-line `useState`.

- Two pages loaded data with the same status, cleanup, and retry: `useFetch`.
- Two values needed to survive a reload with the same read and write: `useLocalStorage`.
- A form that validates three fields the same way is the next candidate, and a window size or an online status after that, which the Refs and browser APIs topic wrote as effects.

The test is the same as for a component: if you would copy and paste the lines, extract them.

## What stays in the component

The hook returns values and functions; the component decides what to draw.
`useFetch` never renders a spinner and never knows what a product is, which is why the list page and the detail page could share it while drawing different things.
Keep the hook ignorant of the page and the page ignorant of the mechanism, and each one stays small enough to read.

## Where the state lives now

| Value | Lives in | Because |
| --- | --- | --- |
| The product list | `ProductsPage`, through `useFetch` | Only the list page shows it |
| One product | `ProductPage`, through `useFetch` | Only the detail page shows it, keyed on the id from the address |
| The saved ids | `App`, through `useLocalStorage` | The detail page changes it and the home page counts it |
| Which page is open | The router | It is the address, which the next topic puts more state into |

That last row is the bridge to the next topic.
The address already holds which page is open and which product; it can hold a search and a filter too, and then a shopper can bookmark them, share them, and press Back through them.

**Check:** Without looking at the files, write `useLocalStorage` from memory on paper: its parameters, its two hook calls, and what it returns.
Then say which component would own the state if `ProductPage` called it directly.

**If it breaks:** If the ownership question is hard, open Step 4, select `App` in **Tree and state**, and then imagine the call moved into `ProductPage`; the state would move with it, and the home page would lose the count.
