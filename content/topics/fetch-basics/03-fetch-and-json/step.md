---
title: Fetch and JSON
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [one-request-settles-ok, uses-api-base, products-render]
---

**We used this in:** [DOM and events](#/topic/dom-events) built list items from an array; now the array comes from a server.

`fetch` is the browser's function for making HTTP requests, and it returns a promise, so everything from the last step applies.
The page is a product finder with a **Load products** button, a status line, and an empty list.
`renderProducts` is already written: give it an array of products and it draws one item per product.
`loadProducts` runs on the click and so far only says that it is not written.

## Choose where the data comes from

The toolbar above the editor has an **API source** selector with three kinds of entry.

- **Fixtures** answers requests inside this page from files that come with the step, so it works offline and always returns the same data.
  It also has controls to add latency, answer with an HTTP error status, send a malformed body, or drop the connection.
- **A preset** is a real public server, such as DummyJSON, chosen from a list.
- **Custom** is any base URL you type, for example your own server or a classmate's deployment.

Our code never names a server.
It reads the chosen base URL from `import.meta.env.API_BASE`, which the lab fills in from the selector, so switching the source never means editing the request.

## Send the request

Replace the placeholder line with a request and a look at what comes back.

```js file="app.js" action="replace" anchor='  status.textContent = "loadProducts is not written yet.";'
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
  console.log("response status", response.status, "ok", response.ok);
```

Run it and click the button.
The console shows `response status 200 ok true`, and the **Network** view of the inspector shows one request to `/products?limit=8`, with its method, state, status, and duration.
The function paused at `await fetch(...)` while the request was pending and resumed when the answer arrived.

What `fetch` gives us is a **Response** object: the status code and headers, not the data yet.
`response.ok` is `true` for any status from 200 to 299 and `false` for a 404 or a 500, which is how we will notice those in the next step.
The data is the body, and reading it is a second asynchronous step.

```js file="app.js" action="insert-after" anchor='  console.log("response status", response.status, "ok", response.ok);'
  const data = await response.json();
  console.log("data has", Object.keys(data));
  renderProducts(data.products);
```

`response.json()` reads the whole body and parses it as JSON, and it returns a promise too, so it needs its own `await`.
Two steps every time: `fetch` for the response, `json` for the data.

The log shows the shape of the answer before we trust it: `products`, `total`, `skip`, and `limit`.
This server wraps the array inside an object, so the products are `data.products`, not `data`.
Never guess a response's shape; log it, read it, then write the line that reaches into it.
Our fixture file was copied from the DummyJSON `/products` answer, which is why the same code works on both.

**Check:** Run the code with **Fixtures** selected and click **Load products**.
Eight products appear with their prices, the status line reads `8 products loaded.`, and the Network view shows one request that ended `ok` with status 200.
Click the row and the editor highlights the `fetch` line.
Then choose the **DummyJSON** preset, run, and click again: the request goes to `https://dummyjson.com/products?limit=8`, takes longer, and returns real products in the same shape, so nothing in the code changes.
Press **Run checks**; the checks click the button for you.

**If it breaks:** If the Network view shows a request whose URL contains `undefined`, check the spelling of `import.meta.env.API_BASE`.
If the console says `products is not iterable` or `Cannot read properties of undefined`, `renderProducts` was given `data` instead of `data.products`.
If the console shows a `Promise` where you expected the data, an `await` is missing before `fetch` or before `response.json()`.
If a custom server fails with a CORS message in the console, the server is not allowing requests from this page; that is a server setting, not a bug in your code.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#products");
const button = document.querySelector("#load");

function renderProducts(products) {
  list.replaceChildren();
  for (const product of products) {
    const item = document.createElement("li");
    const title = document.createElement("span");
    title.className = "title";
    title.textContent = product.title;
    const price = document.createElement("span");
    price.className = "price";
    price.textContent = `$${product.price.toFixed(2)}`;
    item.append(title, price);
    list.append(item);
  }
  status.textContent = `${products.length} products loaded.`;
}

async function loadProducts() {
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
  console.log("response status", response.status, "ok", response.ok);
  const data = await response.json();
  console.log("data has", Object.keys(data));
  renderProducts(data.products);
}

button.addEventListener("click", loadProducts);
```

</details>
