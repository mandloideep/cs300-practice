---
title: Make every state appear on purpose
mode: local
---

A page that loads data has four states, loading, success, empty, and error, and on a fast computer with good data you only ever see one of them.
This step makes each of the other three appear on purpose: a slow network for loading, no network for the error, and the two boundary data files for the empty catalog and a product with missing fields.
Step through the picture to see the four states a request moves through.

```demo name="fetch-timeline"
```

This step happens in your browser and in Visual Studio Code, on the project from the last step.
The download on this step is that project with the `/products/3` fix already made.

## Loading, with a slow network

In the preview, open the browser's DevTools with **F12** or **Cmd+Option+I**, choose the **Network** tab, and set the throttling menu, which says **No throttling**, to **Slow 4G**.
Open `/products` from the address bar: `Loading products...` shows for a moment before the list.
Open `/products/3`: `Loading product 3...` shows the same way.

## Error and recovery, with no network

Tick **Disable cache** in the Network tab, so that the browser cannot answer from its own copy, and set the throttling menu to **Offline**.
Press **Home** and then **Products** in the shop's navigation, which asks for the data again without reloading the page: it says `Could not load products. Failed to fetch.` with a **Retry** button.
Set it back to **No throttling** and press **Retry**: the list loads without a reload of the page.
That is the recovery the Capstone asks for: the visitor gets out of the failure without starting over.

## The boundary data files

`public/data/` holds two files made for this check: `empty.json` has no products, and `incomplete.json` has one product with an id and a title and nothing else.
The app loads whichever file `DATA_FILE` names in `src/api.js`.

```js
const DATA_FILE = "empty.json";
```

Change the line, run `npm run build`, restart the preview, and open `/products`: it shows `The catalog is empty. Check back soon.`
That is the empty state, its own message, different from the search that matches nothing.

```predict
You set `DATA_FILE` to `"incomplete.json"`, whose one product has no `price`, rebuild, and open `/products`. What does the page show?
- The product, with an empty price
- The catalog is empty, because the record is incomplete
= A blank page, with an error in the console
```

Set it to `"incomplete.json"`, rebuild, and open `/products`.
The page is blank, and the console says `TypeError: Cannot read properties of undefined (reading 'toFixed')`.
The built code is minified, so the error names no file you wrote; run `npm run dev` and open `http://localhost:5173/shop-release/products`, and the same error names `ProductList.jsx` and the `ProductList` component.

## Fix it: a price that may be missing

`product.price.toFixed(2)` assumes every product has a number for a price.
Create `src/format.js` with one function that formats a price that is there and says so when it is not.

```js
export function formatPrice(price) {
  return typeof price === "number" ? "$" + price.toFixed(2) : "Price not listed";
}
```

In `src/ProductList.jsx`, import it under the first line and use it for the price.

```jsx
import { formatPrice } from "./format.js";
```

```jsx
<span className="product-price">{formatPrice(product.price)}</span>
```

Do the same in `src/ProductPage.jsx`: the same import under the `api.js` import, and the price line in the success branch.

```jsx
<p className="product-price">{formatPrice(product.price)}</p>
```

The page now lists **Sample Fragrance** with **Price not listed**, and `/products/9` opens it.
Set `DATA_FILE` back to `"products.json"`, rebuild, and confirm the eight products are back; a boundary file left in place is a bug you would deploy.
Write a row in `RELEASE-CHECK.md` for each state you made appear, with the finding and its fix for `incomplete.json`.

## Read more

### Why a missing field breaks the whole page

React renders a component by calling it, and a component that throws stops the render of the whole tree, so one bad record blanks every product, the navigation, and the heading.
The fix keeps the assumption in one place: `formatPrice` is the only code that knows a price may be missing, and both pages use it.
An error boundary would catch the throw and show a fallback, but the record would still be missing; checking the value you depend on is the fix that keeps the page useful.

### Why a misspelled file is an error and not an empty list

Try `DATA_FILE = "product.json"`, without the `s`.
The preview, like the development server, answers a file that does not exist with `index.html`, so `response.ok` is true and `response.json()` fails on the first `<` with a `SyntaxError`.
The page shows the error state, which is right: an address that is wrong is a failure, not an empty catalog.

### For your Capstone

The Capstone starter's `public/data/` has the same kind of files: `empty.json`, `incomplete.json`, and `boundary-records.json`, which holds a record with no title, a number written as text, and a title with extra spaces and capitals.
Load each one, with your own data file name changed the same way, and write down what your pages show; Slow 4G and Offline work the same on any site.

**If it breaks:** If the page does not change after you edit `DATA_FILE`, the preview is serving the old build; run `npm run build` and restart the preview.
If **Offline** still shows the list, the browser answered from its cache; tick **Disable cache** in the Network tab and press **Home** and **Products** again.
If the page stays blank after the fix, the console names the line; a `formatPrice is not defined` error means an import is missing from one of the two files.

**Check:** You saw `Loading products...` on Slow 4G, the error with **Retry** on Offline and the list after **Retry**, the empty message for `empty.json`, and **Price not listed** for `incomplete.json` after the fix, with `DATA_FILE` back on `"products.json"`.
`RELEASE-CHECK.md` has a row for each.
Then press **I did this on my computer**.

```quiz
Why does the page go blank, and not just the one product, when a record has no price?
- The build removes products with missing fields
= The component throws while rendering, and an uncaught error unmounts the whole tree
- `fetch` rejects when a record is incomplete
> A throw during render stops React from committing anything; checking the value in one helper keeps one bad record from blanking the page.
```

```quiz
Which state does a misspelled data file name produce in this app?
- Empty, because there are no products
- Loading, forever
= Error, because the server answers with `index.html` and `response.json()` fails
> A wrong address is a failure, and the page offers Retry; the empty message is only for a list that loaded and has nothing in it.
```
