---
title: Run the tests from a clean install and finish the record
mode: local
---

The last two steps found two bugs by hand, and a bug found by hand should become a test, so that nobody has to find it by hand again.
In this step you add a test for each fix, watch one fail when its fix is undone, run the whole suite from a clean install as the grader will, and finish the record.
Step through the session first; your times will differ.

```demo name="terminal"
{
  "cwd": "shop-release",
  "commands": [
    {
      "command": "npm test",
      "output": [
        "> shop-release@0.0.0 test",
        "> vitest run",
        "",
        " RUN  v4.1.10 /Users/you/cs300/shop-release",
        "",
        " ✓ src/App.test.jsx (5 tests) 84ms",
        "",
        " Test Files  1 passed (1)",
        "      Tests  5 passed (5)",
        "   Start at  14:05:12",
        "   Duration  645ms (transform 26ms, setup 78ms, import 57ms, tests 84ms, environment 360ms)"
      ],
      "note": "Five tests: the three that came with the project and the two you add in this step, one for each fix."
    },
    {
      "command": "rm -rf node_modules",
      "output": [],
      "note": "Throw away every installed package, so the next install starts from nothing but package.json and package-lock.json. On Windows, delete the node_modules folder in File Explorer instead."
    },
    {
      "command": "npm ci",
      "output": ["added 112 packages, and audited 113 packages in 2s", "", "26 packages are looking for funding", "  run `npm fund` for details"],
      "note": "npm ci installs exactly what the lockfile lists, as the deploy workflow and the grader do."
    },
    {
      "command": "npm test",
      "output": [" ✓ src/App.test.jsx (5 tests) 86ms", "", " Test Files  1 passed (1)", "      Tests  5 passed (5)"],
      "note": "The same five pass from a clean install, so they do not depend on anything that only your folder has."
    }
  ]
}
```

This step happens in a terminal and in Visual Studio Code, on the project from the last step.
The download on this step is that project with both fixes made.

## Run the tests you have

Stop the preview with **Ctrl+C** and run `npm test`.
Three tests pass: the list renders the products, the empty file shows the empty message, and a failed request offers **Retry**, which recovers.
None of the three would have caught either bug you fixed.

## A test for each fix

Open `src/App.test.jsx` and read how a test sets up a page: `serve` replaces `fetch` with a function that answers with the data you give it, and `renderAt` renders the app at an address with `MemoryRouter`, the way a typed address starts it.
Add these two tests after the first one.

```jsx
test("opens a product page from a typed address", async () => {
  serve(products);
  renderAt("/products/3");
  expect(await screen.findByRole("heading", { name: "Powder Canister" })).toBeInTheDocument();
});

test("lists a product with no price without breaking", async () => {
  serve([{ id: 9, title: "Sample Fragrance" }]);
  renderAt("/products");
  expect(await screen.findByText("Price not listed")).toBeInTheDocument();
});
```

The first test is the walk's finding, a typed `/products/3`, and the second is the boundary file's, a record with no price.
Run `npm test`: five pass.
[Testing React components](#/topic/testing-react-components) builds tests like these one at a time.

## Watch one fail

A test you have never seen fail may not test anything, so undo a fix on purpose.

```predict
In `src/ProductList.jsx` you put back `${product.price.toFixed(2)}` in place of `{formatPrice(product.price)}` and run `npm test`. What does Vitest report?
- Five passed, because the test data has prices
= One failed: lists a product with no price without breaking, with the `toFixed` error from `ProductList.jsx`
- All five fail, because the list cannot render
```

Make the change and run `npm test`.

```text
 ❯ src/App.test.jsx (5 tests | 1 failed) 1093ms
   ✓ lists every product in the data file 55ms
   ✓ opens a product page from a typed address 7ms
   ✓ says so when the catalog is empty 4ms
   × lists a product with no price without breaking 1005ms
   ✓ offers Retry when the data cannot be loaded, and Retry recovers 22ms

 FAIL  src/App.test.jsx > lists a product with no price without breaking
TestingLibraryElementError: Unable to find an element with the text: Price not listed.

TypeError: Cannot read properties of undefined (reading 'toFixed')
 ❯ src/ProductList.jsx:12:59
```

The failing test names the behavior, and the uncaught error names the file and the line, the same `toFixed` error the blank page showed in the preview.
Put `{formatPrice(product.price)}` back and run `npm test` again: five pass.

## From a clean install

Run the rest of the session: delete `node_modules`, run `npm ci`, and run `npm test`.
`npm ci` needs `package-lock.json`, which `npm install` wrote in the first step; commit it, because the deploy workflow runs `npm ci` too.

## Finish the record

Fill in the last row of `RELEASE-CHECK.md`, and read the whole record once as the grader would.
Each row says what you did, what you expected, and what you saw, and the two findings each have a second row for the fix.
If this folder is a repository, commit the fixes, the tests, and the record, and write the new commit hash at the top.

## Read more

### The same check on your Capstone

The Capstone's Verification Cases ask for exactly this kind of record, for ten cases.
This topic walked six of them on a small app:

| Capstone case | Where this topic did it |
| --- | --- |
| 2. Every route from a direct URL | The table of typed addresses in a new tab |
| 3. Refresh and Back and Forward | The refresh and the Back and Forward walk |
| 5. Loading, empty, success, and request failure | Slow 4G, Offline, and `empty.json` |
| 6. Invalid route or parameter | `/products/99` and `/deals` |
| 9. Production deployment from a clean build | `npm run build` and the preview |
| 10. At least five automated tests | `npm ci` and `npm test`, five passing |

Run the same walk on your Capstone with its own routes and data files, first on the preview and then on the deployed address in a private window, and record each case as you go.
The other four, the primary flow, the form, the keyboard, and three widths, are yours to add; [Accessibility checks](#/topic/accessibility-checks) covers the keyboard.

### Why a test for a bug you already fixed

A fix that has no test can come back in any later change, by you or by a suggestion you accept, and nothing will say so.
A **regression test** is one written for a bug that was found, so the suite fails the moment the bug returns; it is the cheapest evidence that a fix holds, and the Capstone's release-candidate change asks for the same pairing of a finding, a change, and the checks you reran.

**If it breaks:** `npm ci` stops with `The npm ci command can only install with an existing package-lock.json` when the lockfile is missing; run `npm install` once, commit `package-lock.json`, and run `npm ci` again.
If the typed-address test fails with `Unable to find an accessible element with the role "heading"`, the `/products/3` fix from Step 2 is missing, and the page still reads the link's `state`.
If `npm test` stays running and prints `Waiting for file changes`, the script is `vitest` without `run`; press **q** to stop it, and check that `package.json` says `"test": "vitest run"`.

**Check:** `npm test` shows five passing tests after `npm ci`, you saw the price test fail with its fix undone and pass with it back, and `RELEASE-CHECK.md` has every row filled in, with both findings and their fixes.
Then press **I did this on my computer**.

```quiz
Which test should a release check add after it finds that `/products/3` fails from a typed address?
- A test that clicks from the list to the product
= A test that renders the app at `/products/3` with no earlier page
- A test that the product list has eight items
> The bug only happened without an earlier page, so the test starts at the address, as `MemoryRouter` with `initialEntries` does.
```

```quiz
Why run `npm test` again after `npm ci`, when it already passed?
- `npm ci` updates the packages to their newest versions
= It proves the tests pass from only what is committed, as they will for the grader and the workflow
- Vitest caches results and needs a fresh install to rerun them
> A clean install uses only `package.json` and the lockfile, so a test that relies on something else in your folder fails here first.
```
