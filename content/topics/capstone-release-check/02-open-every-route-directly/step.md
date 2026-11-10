---
title: Open every route from a typed address
mode: local
---

A visitor does not always arrive at the home page: they open a bookmark, a link a classmate sent, or a tab they left open yesterday.
In this step you open every route of the preview from a typed address in a new tab, refresh it, and walk Back and Forward, and one route fails in a way that clicking through the app never shows.
Step through the picture first: it is the router matching one typed address against every route.

```demo name="router-match"
{
  "url": "/products/3",
  "routes": [
    { "path": "/", "element": "HomePage" },
    { "path": "/products", "element": "ProductsPage" },
    { "path": "/products/:id", "element": "ProductPage" },
    { "path": "*", "element": "NotFoundPage" }
  ]
}
```

This step happens in your browser, on the preview from the last step.
If the preview is not running, run `npm run build` and `npm run preview` in the project folder; the download on this step is that project.

## Click through it first

Open `http://localhost:4173/shop-release/`, press **Products**, and open **Powder Canister**.
The product page shows its title, category, and price.
Every page works when you click your way to it, which is how you have tested the app so far.

## Open each route in a new tab

Open a new tab for each address in the table, type the address, and press Enter.
A new tab is the point: it is how a bookmark or a shared link arrives, with nothing from the earlier pages in memory.

```predict
You type `http://localhost:4173/shop-release/products/3` into a new tab. What does the page show?
- Powder Canister, as it did when you clicked to it
= No product has the id 3
- The preview server's own 404 page
```

| Address after `http://localhost:4173/shop-release` | What should happen |
| --- | --- |
| `/` | The home page, with Home marked |
| `/products` | `Loading products...`, then eight products, with Products marked |
| `/products?q=red` | `red` in the search box and two products |
| `/products/3` | Powder Canister, its category, and its price |
| `/products/99` | No product has the id 99 |
| `/deals` | Page not found, with the way home |

Then, on `/products?q=red`, open a product, press **Back**, and press **Forward**: the search comes back with **Back**, and the product with **Forward**.
Refresh on each page too; a refresh has to show the same page.

Write a row in `RELEASE-CHECK.md` for each address: what you typed, what you expected, and what you saw.

## The finding

`/products/3` from a typed address says **No product has the id 3**, though product 3 is in the catalog and clicking to it worked.
Open `src/ProductList.jsx` and `src/ProductPage.jsx` to see why.

```jsx
<Link className="product-title" to={`/products/${product.id}`} state={{ product }}>
```

```jsx
const location = useLocation();
const product = location.state?.product;
```

The list hands the product to the detail page in the link's `state`, and the detail page reads it from there instead of loading it.
A click carries that state; a typed address, a bookmark, or a link from someone else carries none, so `product` is `undefined`.

## Fix it: the page loads its own data

The rule from [Route data and custom hooks](#/topic/route-data-and-custom-hooks/2) is that each route loads what it shows from the address alone.
In `src/ProductPage.jsx`, replace the first line with the imports the page needs to load the products.

```jsx
import { Link, useParams } from "react-router";
import { productsUrl } from "./api.js";
import { useFetch } from "./useFetch.js";
```

Replace the two lines that read the location with a request and a lookup by the id in the address.

```jsx
const { status, data, error, retry } = useFetch(productsUrl());
const product = data?.find((item) => String(item.id) === id);
```

`useParams` gives the id as text, `"3"`, and the data has the number `3`, so the lookup compares both as text.

Inside `<main>`, add the loading and error branches above the others, and make the two old branches wait for a successful request.

```jsx
{status === "loading" && (
  <p role="status" className="message">
    Loading product {id}...
  </p>
)}
{status === "error" && (
  <p role="alert" className="message message--error">
    Could not load product {id}. {error.message}
    <button type="button" onClick={retry}>
      Retry
    </button>
  </p>
)}
{status === "success" && !product && <h1>No product has the id {id}</h1>}
{status === "success" && product && (
```

Finally, delete `state={{ product }}` from the `Link` in `src/ProductList.jsx`; nothing reads it now.

Run `npm run build` again, restart `npm run preview`, and open `/products/3` in a new tab: Powder Canister.
Add a second row for `/products/3` in your record that says what you changed and what you saw after it.

## Read more

### Why a refresh did not catch it

`BrowserRouter` keeps a link's `state` in the browser's history entry, and a refresh reloads the same entry, so a refresh after a click still has the product.
Only a fresh entry, a typed address or an opened bookmark, starts with no state.
That is why the check says "in a new tab" and why the Capstone lists direct URLs and refresh as separate cases.

### What the walk catches in general

- A page that reads data another page loaded, as this one did.
- A filter kept in `useState`, empty on a typed address; [URL state](#/topic/url-state/1) moved it into the address.
- A missing `basename`, which shows Page not found on every address.
- A `Link` written as `<a href>`, which reloads the whole app on every click.

Each one works when you click through from the home page, which is why a walk of typed addresses is a check of its own.

### On GitHub Pages

The preview answers `/shop-release/products/3` with `index.html` by itself.
GitHub Pages answers it with `404.html`, which this project's workflow makes as a copy of `index.html`; the Capstone starter's workflow has the same `cp` line.
After you deploy, repeat this walk on the live address in a private window.

**If it breaks:** If every typed address shows Page not found, `basename` is missing from `BrowserRouter` in `src/main.jsx`.
If `/products/3` shows **Loading product 3...** forever, the console names the error; a `SyntaxError` about `<` means the data address is wrong and the server answered with `index.html`.
If the page still says no product has the id 3 after the fix, the preview is serving the old build; run `npm run build` and restart the preview.

**Check:** Every address in the table shows what the table says from a new tab and after a refresh, Back and Forward restore the search and the product, and `RELEASE-CHECK.md` has a row for each, with the `/products/3` finding and its fix.
Then press **I did this on my computer**.

```quiz
Clicking to a product works, a refresh after the click works, and the same address typed into a new tab does not. Where does the page most likely get its data?
- From `useParams`
= From the link's `state`, which only a click provides
- From the `?q` search parameter
> A typed address starts a history entry with no state; data a page needs must come from the address and a request, not from the page before it.
```
