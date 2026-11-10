---
title: Which tests a change affects
mode: read
---

A test suite is most useful at the moment you change something, because it tells you what the change broke before anyone else finds it.
To use it that way you need to know, before you run anything, which tests a change should affect, and that is also a question the Capstone defense asks when it selects a small change for you to explain.
This step reads the nine tests you wrote as a map from behaviors to files, and answers that question for four changes.

## The map

| Test file | What it renders | What its tests depend on |
| --- | --- | --- |
| `src/App.test.jsx` | `App` at `/` in a `MemoryRouter` | The home page heading text |
| `src/ProductList.test.jsx` | `ProductList` with two products | One `li` per product, the link text and `href`, `formatPrice` |
| `src/ProductsPage.test.jsx` | `ProductsPage` at `/products` with `fetch` mocked | The loading text, the Search label, the filter, the empty-search text, the alert text, the Retry button's name |

A test depends on whatever it queries and whatever produces what it queries.
`ProductsPage` renders `ProductList`, which calls `formatPrice`, so a change to `formatPrice` reaches two test files, and a change to the home page reaches one.

```predict
You change `formatPrice` to show prices as `14.99 USD` instead of `$14.99`. Which tests fail?
- Every test, because every page shows prices
= One: the `ProductList` test that looks for `$14.99`
- None, because no test calls `formatPrice` directly
```

The products page tests use the same function, but none of them reads a price, so only the test that queries the text `$14.99` fails.
That is a test doing its job: it names exactly the behavior that changed, and you decide whether to update the test or undo the change.

## Run only what you need

`npm test` runs every file, which takes a second here and longer in a bigger project.
While you work on one component, run its file alone; the text after `--` passes to Vitest as a filter on file names.

```bash
npm test -- ProductList
```

```text
 ✓ src/ProductList.test.jsx (3 tests) 56ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
```

Run the whole suite again before you commit, because a change can reach a file you did not expect.

## Read more

### What to test, and what not to

| Test | Skip |
| --- | --- |
| What the user sees and does: text, roles, links, typing, clicking | The names of state variables, hooks, and CSS classes |
| Every state a request can reach: loading, success, empty, and error | React itself, such as whether `useState` stores a value |
| The boundary cases your data has: a missing field, an empty list, an unknown id | The same behavior through three components when one test covers it |
| Each bug you fixed, as a regression test | Exact snapshots of whole pages, which fail on every harmless change |

A test that checks implementation details fails when you refactor and passes when the user-visible behavior breaks, which is backward.
A test that checks behavior through roles and text does the opposite.

### Unit, component, and end-to-end

The tests in this topic are **component tests**: React components rendered in jsdom with the network mocked.
A **unit test** checks one plain function, such as `formatPrice`, with no rendering at all, and an **end-to-end test** drives the real built site in a real browser, as this site's own Playwright suite does for every step.
The Capstone asks for component tests; the other two kinds are worth knowing by name.

**Check:** For any one-line change in this project, you can name the test files it affects before you run them, and you can run one file alone with `npm test -- <name>`.
Then press **Mark this step as read**.

```quiz
You change the Search label from `Search` to `Find a product`. Which tests fail?
- Only `src/App.test.jsx`
= The two `ProductsPage` tests that find the box by the name `Search`
- Every test in `src/ProductsPage.test.jsx`
> Only the tests that query the box by its accessible name depend on the label; the loading and error tests never touch it.
```

```quiz
You rename the `visible` variable in `ProductsPage` to `matching`. Which tests fail?
= None, because no test reads a variable name
- The filter tests, because they check the filtered list
- All of them, because the component changed
> A rename changes no behavior, and tests that query by role and text do not see it; a test that did fail here would be testing the code instead of the page.
```

```quiz
In the defense you are asked to make the empty-search message say `Nothing matches zzz.` What do you run after the change?
- Nothing; a text change cannot break anything
= `npm test`, expecting the empty-search test to fail until its expected text is updated
- `npm run build`, because tests only run in the deploy workflow
> Knowing which test covers the message lets you predict the failure, update the test on purpose, and show that the rest still pass.
```
