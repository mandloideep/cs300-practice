---
title: A render test for one component
mode: local
---

A **render test** gives a component props, renders it, and checks what it shows, with no clicks and no requests.
It is the smallest useful test, and the place to learn the three parts every test has: arrange the props, act by rendering, and assert on what a user would see.
In this step you test `ProductList`, the component that turns an array of products into links and prices.

```predict
You render `<ProductList items={items} />` in a test with no router around it. What happens?
- It renders, because `ProductList` has no routes of its own
= The test fails with an error from React Router, because every `Link` needs a router above it
- The links render without an `href`
```

This step happens in Visual Studio Code and its terminal, in the project from the last step.
The download on this step is that project with Vitest set up and the first test passing.

## Write the test

Open `src/ProductList.jsx` and read what it does with `items`: one `li` per product, a `Link` to `/products/<id>` with the title as its text, and the price from `formatPrice`, which says **Price not listed** when a product has none.
Create `src/ProductList.test.jsx` next to it:

```jsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import ProductList from "./ProductList.jsx";

const items = [
  { id: 3, title: "Powder Canister", price: 14.99 },
  { id: 9, title: "Sample Fragrance" },
];

function renderList() {
  render(
    <MemoryRouter>
      <ProductList items={items} />
    </MemoryRouter>,
  );
}
```

`items` is the arrange part: two products, one with a price and one without, because the missing price is the case most likely to break.
`renderList` is the act part, kept in one function so that every test renders the list the same way, inside a `MemoryRouter` because each item is a `Link`.

Add three tests under it, one behavior each:

```jsx
test("renders one item per product", () => {
  renderList();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

test("links each product to its own page", () => {
  renderList();
  expect(screen.getByRole("link", { name: "Powder Canister" })).toHaveAttribute(
    "href",
    "/products/3",
  );
});

test("shows a price, or says that it is not listed", () => {
  renderList();
  expect(screen.getByText("$14.99")).toBeInTheDocument();
  expect(screen.getByText("Price not listed")).toBeInTheDocument();
});
```

Run `npm test`: `src/ProductList.test.jsx (3 tests)` passes beside `src/App.test.jsx`.

## Make it fail on purpose

A test you have only seen pass might pass whatever the component does.
Change `"$14.99"` in the last test to `"$14.90"` and run `npm test`:

```text
 ❯ src/ProductList.test.jsx (3 tests | 1 failed) 56ms
   ✓ renders one item per product 46ms
   ✓ links each product to its own page 6ms
   × shows a price, or says that it is not listed 3ms

 FAIL  src/ProductList.test.jsx > shows a price, or says that it is not listed
TestingLibraryElementError: Unable to find an element with the text: $14.90.
```

Under the error, Testing Library prints the document as the test saw it, and `$14.99` is there; reading that printout is the fastest way to see why a query found nothing.
Put `"$14.99"` back and run `npm test` again.
Then try the predict: delete the `<MemoryRouter>` lines around `<ProductList items={items} />`, run the tests, read the error, and put them back.

## Read more

### Find elements the way a user does

`getByRole("link", { name: "Powder Canister" })` finds the element a screen reader announces as a link named Powder Canister.
Testing Library recommends queries in this order: `getByRole` first, then `getByLabelText` for form fields, then `getByText`, and a `data-testid` only when nothing a user can perceive identifies the element.
A test that finds a link by its role and name keeps passing when a class or a wrapper `div` changes, and fails when the link stops being a link, which is the change a user would notice.

### get, query, and find

| Query | When nothing matches | Use it for |
| --- | --- | --- |
| `getBy...` | Throws, so the test fails at once | Something that must be there now |
| `queryBy...` | Returns `null` | Asserting that something is not there |
| `findBy...` | Waits up to a second, then throws | Something that appears after a request or an update |

The `All` forms, such as `getAllByRole`, return every match as an array.
The next step needs `findBy`, because the products page shows its list only after its request answers.

**If it breaks:** `TypeError: Cannot destructure property 'basename' of 'React$1.useContext(...)' as it is null` from `LinkWithRef` means a `Link` rendered with no router; wrap the component in `MemoryRouter`.
`Found multiple elements with the role "link"` means `getByRole` matched more than one; add `name` to the query, or use `getAllByRole`.

**Check:** `npm test` shows `src/ProductList.test.jsx` with three passing tests, you saw the price test fail with `$14.90` and pass with `$14.99`, and you read the error a `Link` gives without a router.
Then press **I did this on my computer**.

```quiz
Which query should find the Search box on the products page?
= `getByRole("searchbox", { name: "Search" })`
- `getByTestId("search")`
- `container.querySelector("input")`
> A role and an accessible name are what a user and a screen reader rely on, so the test breaks only when they change.
```

```quiz
A test must check that no error message is on the page. Which query does that?
- `getByRole("alert")`
= `queryByRole("alert")`, expecting `null`
- `findByRole("alert")`
> `getBy` and `findBy` throw when nothing matches; `queryBy` returns `null`, which `expect(...).not.toBeInTheDocument()` accepts.
```
