---
title: A test for a request that fails
mode: local
---

The tests so far all had a server that answered with data, and the Capstone asks for evidence of the other case: a failure, a message the user can read, and a way out.
In this step the mock answers 500, then rejects as a dropped connection would, and the tests check the alert, its text, and that **Retry** recovers.
Step through the picture first, and stop on the request that fails.

```demo name="fetch-timeline"
```

This step happens in Visual Studio Code and its terminal, in the project from the last step.
The download on this step is that project with the three products page tests passing.

## A server error, and Retry

```predict
The mock answers status 500 with a JSON body. What does the products page show?
- The products page with no products, because the body has none
= `Could not load products. The server answered with status 500.` and a Retry button
- `Loading products...` forever, because the request never succeeds
```

Add a test at the end of `src/ProductsPage.test.jsx`:

```jsx
test("shows an error with Retry when the server fails, and Retry recovers", async () => {
  serve({ message: "Server error" }, 500);
  const user = userEvent.setup();
  renderAt("/products");
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Could not load products. The server answered with status 500.",
  );
  serve(products);
  await user.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findAllByRole("listitem")).toHaveLength(4);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

The first `serve` makes every request fail, and `findByRole("alert")` waits for the error branch, which has `role="alert"` so that a screen reader announces it.
The second `serve` swaps in a server that works, as a server that comes back would, and the click on **Retry** asks again.
The last line uses `queryByRole`, because the alert must be gone and a `getBy` would throw before `expect` could check.

## A dropped connection

A server error and a dropped connection reach the page differently: the first is an answer with a status, and the second is a `fetch` that rejects with no answer at all.
Add a test whose mock rejects:

```jsx
test("shows an error when the network is down", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }),
  );
  renderAt("/products");
  expect(await screen.findByRole("alert")).toHaveTextContent("Failed to fetch");
});
```

`TypeError: Failed to fetch` is what Chrome's `fetch` rejects with when it is offline, which is what you saw in the release check with the Network tab set to **Offline**.
Run `npm test`: nine tests in three files pass.

```text
 ✓ src/ProductList.test.jsx (3 tests) 57ms
 ✓ src/App.test.jsx (1 test) 49ms
 ✓ src/ProductsPage.test.jsx (5 tests) 129ms

 Test Files  3 passed (3)
      Tests  9 passed (9)
```

## Make it fail for the right reason

Open `src/ProductsPage.jsx` and change the button's text from `Retry` to `Try again`, then run `npm test`.
Only the Retry test fails, with `Unable to find an accessible element with the role "button" and name "Retry"`: the test noticed the change a user would notice, and no other test did.
Put `Retry` back.

## Read more

### Why test the failure at all

On your computer the data file is always there, so the error branch never runs, and a mistake in it, such as rendering `{error}` where `{error.message}` belongs, stays hidden until a visitor's request fails.
A test with a mock that fails runs that branch every time, in a second, and is the evidence the Capstone asks for in its verification cases and in the defense.

### Your Capstone's five tests

Five tests that protect meaningful behavior could be these, written the same way for your own routes and data:

1. A list page renders the records from a mocked `fetch`.
2. A detail page opened at its address with `MemoryRouter` shows the right record, and an unknown id shows your not-found message.
3. Typing or choosing a filter changes what the list shows.
4. The form rejects bad input with its message and accepts good input.
5. A failed request shows the error and recovers with your retry or link back.

Each one names a behavior a user would notice, uses role and text queries, and was seen failing once.

**If it breaks:** If the Retry test times out waiting for the list after the click, the second `serve` came after the click; swap the two lines.
If the alert test fails with `Unable to find role="alert"`, the error branch is missing `role="alert"` or the test checked before the request settled; use `findByRole`.
If a test passes when you expected a failure, read its assertion: an `expect` with no matcher after it, such as `expect(alert)` alone, checks nothing.

**Check:** `npm test` shows nine passing tests in three files, and you saw the Retry test fail when the button said `Try again` and pass when it said `Retry`.
Then press **I did this on my computer**.

```quiz
Why does the Retry test call `serve(products)` before clicking Retry?
- To reset the loading message
= So that the request Retry makes gets an answer with data, like a server that has come back
- Because `vi.stubGlobal` only lasts for one request
> The first mock fails every request; the test replaces it with one that succeeds, so the click shows whether the page really asks again and recovers.
```

```quiz
The button text changes from `Retry` to `Try again`. Which tests fail?
- Every test in `src/ProductsPage.test.jsx`
= Only the test that clicks the button by its name
- None, because the button still works
> Only one test queries the button by name, so only it fails; that is the test to update with the new name after you decide the change is right.
```
