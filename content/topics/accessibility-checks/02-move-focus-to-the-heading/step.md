---
title: Move focus to the heading after a route change
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, RouteFocus]
required: [focus-moves-to-the-heading, heading-is-not-a-tab-stop, typing-keeps-focus]
---

When a link loads a new page from a server, the browser starts the new page at the top, and a screen reader reads its title.
A React Router link only swaps the content, so the browser does nothing: focus stays on the link you pressed, or falls to the body when that link is gone, and a screen reader user hears nothing about the new page.
This step moves focus to the new page's `h1` after every route change, which is what the Capstone means by "intentional focus handling after navigation".

```predict
Before this step, you press Tab until **Products** in the navigation is focused and press Enter. Where is the focus once the Products page shows?
= Still on the Products link in the navigation
- On the Products heading
- On the search box, the first control of the new page
```

Run the starter and try it by keyboard: click the result once, press **Tab** to reach **Products**, and press **Enter**.
The page changes, and the focus ring stays on the navigation link.

## A component that watches the address

Import `useEffect` and `useRef` from React, and `useLocation` from React Router.

```jsx file="src/App.jsx" action="replace" anchor='import { useState } from "react";'
import { useEffect, useRef, useState } from "react";
```

```jsx file="src/App.jsx" action="replace" anchor='import { BrowserRouter, Link, NavLink, Route, Routes, useParams, useSearchParams } from "react-router";'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useParams, useSearchParams } from "react-router";
```

Add a component above `App` that renders nothing and moves focus when the path changes.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
function RouteFocus() {
  const { pathname } = useLocation();
  const previous = useRef(pathname);

  useEffect(() => {
    if (previous.current === pathname) {
      return;
    }
    previous.current = pathname;
    document.querySelector("main h1")?.focus();
  }, [pathname]);

  return null;
}

```

The effect runs after every commit in which `pathname` changed, when the new page's `main` is already in the document.
`previous` remembers the path the focus was last moved for, so the first render, where the path has not changed, moves nothing; the browser already starts a fresh page at the top.

Render it inside the router, where `useLocation` can read the address.

```jsx file="src/App.jsx" action="insert-after" anchor="    <BrowserRouter>"
      <RouteFocus />
```

## Headings that can take focus

A heading is not focusable, so `focus()` on it does nothing until it has a `tabIndex`.
`tabIndex={-1}` lets code focus it without adding it to the **Tab** order, where it would be one more stop for every keyboard user.
Give every page's `h1` one.

```jsx file="src/App.jsx" action="replace" anchor="      <h1>Welcome to the shop</h1>"
      <h1 tabIndex={-1}>Welcome to the shop</h1>
```

```jsx file="src/App.jsx" action="replace" anchor="      <h1>Products</h1>"
      <h1 tabIndex={-1}>Products</h1>
```

```jsx file="src/App.jsx" action="replace" anchor="        <h1>No product has the id {id}</h1>"
        <h1 tabIndex={-1}>No product has the id {id}</h1>
```

```jsx file="src/App.jsx" action="replace" anchor="      <h1>{product.title}</h1>"
      <h1 tabIndex={-1}>{product.title}</h1>
```

```jsx file="src/App.jsx" action="replace" anchor="      <h1>Page not found</h1>"
      <h1 tabIndex={-1}>Page not found</h1>
```

Run the code and repeat the keyboard walk: after **Enter** on **Products**, the focus is on the Products heading, and the next **Tab** goes to the search box, the first control of the new page.

## Read more

### Why the heading

The `h1` names the page, so a screen reader that lands on it announces the new page by name, which is the closest a single-page app gets to the title a full page load would read.
Focus on the heading also puts the keyboard at the start of the new content, so the next **Tab** reaches the page's first control instead of starting again at the navigation.

### Why pathname and not the whole location

`useLocation` changes on every navigation, including a change to the search string such as `?q=red`.
This page's search box writes `?q=` to the address on every keystroke, as in [URL state](#/topic/url-state/1), so an effect keyed on the whole location would pull the focus out of the box after each letter.
Keying on `pathname` moves focus only when the page itself changes.

### Why document.querySelector and not a ref

A ref reaches an element that the same component renders, and the heading belongs to a different component on every page.
Passing a ref down into each page would work, but one query for `main h1` after the commit finds whichever page is showing; it runs in an effect, after React has written the page to the DOM, which is the one place outside React's own rendering where reading the DOM is safe.
A page that shows its heading only after a request, as a detail page that waits for its data does, has no `h1` yet when the effect runs; render the heading at once, such as `Product 3` while the data loads, so there is always one to focus.

**If it breaks:** If focus does not move, look for the `h1` in the DOM view: without `tabIndex={-1}` it cannot take focus, and `focus()` does nothing without an error.
If the console says `useLocation() may be used only in the context of a <Router> component`, `<RouteFocus />` is outside `<BrowserRouter>`.
If **Tab** stops on a heading, it has `tabIndex={0}`; use `-1`.

**Check:** Run the code, click the result, and walk it by keyboard: **Tab** to **Products**, **Enter**, and the focus ring is on the heading; **Tab** once more reaches the search box.
Type in the search box: the focus stays in the box.
Then press **Run checks**.

```quiz
Why is the focus not moved on the first render?
- `useRef` is empty on the first render
= The path has not changed, and a page that has just loaded already starts at the top
- React Router does not report a location until the first navigation
> `previous` starts as the first path, so the effect returns early until the path differs, and a newly opened page is left as the browser starts it.
```
