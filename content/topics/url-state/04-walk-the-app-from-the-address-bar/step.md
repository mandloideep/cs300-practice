---
title: Walk the whole app from the address bar
mode: read
---

The last three topics turned the address into the app's main state: which page, which product, which search, which category.
An app whose state is in the address can be entered at any point, by a bookmark, a shared link, or a refresh, and every entry point has to work.
Week 13 calls this the integration check: direct load, refresh, Back, Forward, and bad input, walked by hand before anything is handed in.

```predict
On the Step 3 solution, you type `/products?q=red` into the address bar and press Enter; what does the Products page show?
= `red` in the search box and two products, without any typing
- An empty box and all eight products, until you type in it
- The not-found page, because no route is written as `/products?q=red`
```

Do it on the Step 3 solution, in the lab's address bar first and then in a Vite project.
The Vite project is the one that matters, because it is what the grader and your users open; download the Step 3 workspace, run `npm install` and `npm run dev`, and type each address into the browser's own address bar.

## The walk

| Address or action | What should happen | What to look at |
| --- | --- | --- |
| `/` | The home page, Home marked in the nav | The heading and `aria-current` |
| `/products` | The list loads, with the search box empty and the category on All | The Network view shows one `ok` request |
| `/products?q=red` | The box reads `red` and two products show, without any typing | The filter runs from the address on the first render |
| `/products?category=fragrances&q=coco` | One product, both controls set | The share line repeats the address |
| Press **Back** from there | The address typed before it, `/products?q=red`, with `red` in the box and the category on All | Each address you type is its own history entry, and the controls follow whichever entry is current |
| Press **Forward** | Fragrances and `coco` again | Forward is Back's mirror, for free |
| `/products/3` | The product page loads product 3 | A request to `/products/3` |
| `/products/8` on Fixtures | The missing-product heading, no retry | A `404` row, read as an answer |
| `/products/abc` | The missing-product heading too, because the server has no product `abc` | The id is only text until the server says otherwise |
| `/deals` | The not-found page with the way home | No request at all; nothing matched |
| Refresh on any of the above, in Vite | The same page, with the same filters | The address is the state, so a reload rebuilds it |
| Keyboard only: Tab, Enter, and the arrow keys | Every link, the box, the select, and the buttons can be reached and used | Focus is visible at each stop |

## Read more

Two rows deserve a second look.
The refresh row is where a server without a fallback rule fails: a plain static host answers `/products/3` with its own 404 page, because there is no such file.
The deployment topic covers the rewrite rule that sends every path to `index.html`; in `npm run dev` Vite does it for you.
The keyboard row is the one most often skipped, and the one a screen reader user cannot skip.

### What the walk catches

- A filter that lives in `useState` and is empty on direct load.
- A detail page that reads a list it never loaded.
- A `NavLink` without `end` that marks Home on every page.
- A `Link` written as `<a href>`, which reloads and loses state in Vite and loses the frame in the lab.
- A `setSearchParams` call that replaces the other parameter.
- A 404 shown as a failure with a retry that cannot succeed.

Every one of those appeared in these three topics as a step's "if it breaks", and the walk is how you find them before someone else does.

### Record it

For Assignment 6 and the Capstone, keep a short record: the address, what you expected, what happened, and a screenshot or the Network row for anything that surprised you.
That record is the evidence the course asks for, and it is what you will wish you had when a classmate opens your link on their phone.

**If it breaks:** If a row fails in Vite but not in the lab, the difference is almost always the host: check that the dev server is running and that the address starts with its port, and read the deployment topic's note on the fallback rule before deploying.

**Check:** Walk the table on the Step 3 solution and tick each row.
Then change one thing on purpose, such as removing `end` from the Home link or writing `{ q: value }` instead of the copied parameters, and find which row catches it.

```quiz
After a deploy, refreshing on `/products/3` shows the host's own 404 page; what is missing?
- A `Route` for `/products/:id` in `App`
- `end` on the Home `NavLink`
= A rewrite rule on the host that sends every path to `index.html`
> The route exists in the app, but a plain static host looks for a file called `/products/3` before the app ever loads; the rewrite hands every path to `index.html` so the router can match it.
```
