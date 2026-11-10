---
title: A test that types like a user
mode: local
---

The products page loads its data with `fetch`, shows a loading message while it waits, and filters the list as the shopper types in the Search box.
A test of that page has two new jobs: answer the request itself, because a test has no server, and type into the box the way a person does.
In this step you replace `fetch` with a function that answers at once, wait for the list with `findBy`, and type with `user-event`.

```demo name="fetch-timeline"
```

This step happens in Visual Studio Code and its terminal, in the project from the last step.
The download on this step is that project with the render tests passing.

## Answer the request in the test

Create `src/ProductsPage.test.jsx` with the imports, four products, and two helpers:

```jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import ProductsPage from "./ProductsPage.jsx";

const products = [
  { id: 3, title: "Powder Canister", price: 14.99 },
  { id: 4, title: "Red Lipstick", price: 12.99 },
  { id: 5, title: "Red Nail Polish", price: 8.99 },
  { id: 8, title: "Dior J'adore", price: 89.99 },
];

function serve(body, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(JSON.stringify(body), { status })),
  );
}

function renderAt(address) {
  render(
    <MemoryRouter initialEntries={[address]}>
      <ProductsPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});
```

`serve` replaces the global `fetch` with a **mock**: a function that records its calls and answers every request with a real `Response` holding the data you give it.
`renderAt` starts the page at an address, so a test can begin at `/products?q=red` as a typed address would.
`vi.unstubAllGlobals` puts the real `fetch` back after every test, so that one test's answers never leak into the next.

## Loading, then the list

```predict
The first test renders the page with `serve(products)` and calls `screen.getAllByRole("listitem")` on the next line, with no waiting. What happens?
- Four items are found, because the mock answers at once
= The query throws, because the page still shows `Loading products...`
- Zero items are found, and `getAll` returns an empty array
```

Add the first test:

```jsx
test("shows the loading message, then the products", async () => {
  serve(products);
  renderAt("/products");
  expect(screen.getByRole("status")).toHaveTextContent("Loading products...");
  expect(await screen.findAllByRole("listitem")).toHaveLength(4);
});
```

Even a mock that answers at once answers in a later turn of the event loop, after `useEffect` started the request, so the first render shows the loading state.
`findAllByRole` waits for the list, and `await` holds the test until it appears, which is why the test function is `async`.

## Type like a user

Add a test that types into the Search box:

```jsx
test("filters the list as the shopper types", async () => {
  serve(products);
  const user = userEvent.setup();
  renderAt("/products");
  await screen.findAllByRole("listitem");
  await user.type(screen.getByRole("searchbox", { name: "Search" }), "red");
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});
```

`userEvent.setup()` makes a user for this test, and `user.type` focuses the box and presses each key, firing the key, input, and change events a browser would.
Each key calls `setSearchParams`, so the test is checking the whole path from a keystroke through the address to the filtered list.

Add one for a search that matches nothing:

```jsx
test("says so when nothing matches the search", async () => {
  serve(products);
  const user = userEvent.setup();
  renderAt("/products");
  await screen.findAllByRole("listitem");
  await user.type(screen.getByRole("searchbox", { name: "Search" }), "zzz");
  expect(screen.getByRole("status")).toHaveTextContent("No products match zzz.");
});
```

Run `npm test`: `src/ProductsPage.test.jsx (3 tests)` passes.
Then delete the `await` before `user.type` in the filter test and run it again: it fails with four items instead of two, because the assertion ran before the typing finished; put the `await` back.

## Read more

### Why replace fetch

A test that called the real network would be slow, would fail when you are offline, and could not make a server answer 500 on demand.
The mock makes the answer part of the test: the data, the status, and the timing are written next to the assertion that depends on them.
The Capstone brief names the same tool, `vi.stubGlobal`, for the same reason.

### user-event and fireEvent

Testing Library also has `fireEvent`, which dispatches one event: `fireEvent.change(box, { target: { value: "red" } })` sets the value in one go.
`user-event` types one key at a time, focuses the box first, and fires every event in between, so it catches a handler that a real user would trigger and `fireEvent` would skip.
Prefer `user-event`, and always `await` its calls.

**If it breaks:** `Unable to find an accessible element with the role "listitem"` right after `renderAt` means the query did not wait; use `await screen.findAllByRole`.
`Unable to find an accessible element with the role "searchbox" and name "Search"` means the label text differs; read the printed document for the box's label.
If a test passes alone and fails beside the others, `afterEach` with `vi.unstubAllGlobals` is missing, so one test's mock is still answering in the next.

**Check:** `npm test` shows `src/ProductsPage.test.jsx` with three passing tests, and you saw the filter test fail without `await` before `user.type` and pass with it.
Then press **I did this on my computer**.

```quiz
Why is `await` needed before `user.type`?
- `user.type` sends a network request
= It types one key at a time asynchronously, so the assertion must wait until it finishes
- Without it, the Search box loses its label
> `user-event` returns a promise that resolves after every key's events have fired and React has re-rendered.
```

```quiz
What does `vi.stubGlobal("fetch", ...)` replace?
= The `fetch` that `useFetch` calls, for the rest of the test
- Only the first request the page makes
- The `ProductsPage` component
> The component is the real one; only the network is replaced, so the test checks the component's own loading, success, and error code.
```
