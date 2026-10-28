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

This step sends a real request with `fetch` and draws the products that come back.
Watch the Network view and the console together: the answer arrives as a response first, and the data is a second wait after it.

```demo name="fetch-timeline"
```

The page is a product finder with a **Load products** button, a status line, and an empty list.
`renderProducts` is already written: give it an array of products and it draws one item per product.
`loadProducts` runs on the click and so far only says that it is not written.
Leave the **API source** selector in the toolbar on **Fixtures**, which answers from files that come with the step; our code reads the chosen base URL from `import.meta.env.API_BASE`, so it never names a server.

Replace the placeholder line with a request and a look at what comes back.

```predict
After you add these two lines, run, and click Load products, what does the console show?
- The eight products, as an array
- `Promise {<pending>}`
= `response status 200 ok true`
```

```js file="app.js" action="replace" anchor='  status.textContent = "loadProducts is not written yet.";'
  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
  console.log("response status", response.status, "ok", response.ok);
```

Run it, click the button, and find the one request to `/products?limit=8` in the **Network** view of the inspector.
What `fetch` gives us is a **Response** object: the status code and headers, not the data yet.

The data is the body, and reading it is a second asynchronous step.

```js file="app.js" action="insert-after" anchor='  console.log("response status", response.status, "ok", response.ok);'
  const data = await response.json();
  console.log("data has", Object.keys(data));
  renderProducts(data.products);
```

`response.json()` returns a promise too, so it needs its own `await`; the log shows the shape of the answer before the next line reaches into it.

## Read more

`fetch` is the browser's function for making HTTP requests, and it returns a promise, so everything from the last step applies.
The function paused at `await fetch(...)` while the request was pending and resumed when the answer arrived.

### Choose where the data comes from

The toolbar above the editor has an **API source** selector with three kinds of entry.

- **Fixtures** answers requests inside this page from files that come with the step, so it works offline and always returns the same data.
  It also has controls to add latency, answer with an HTTP error status, send a malformed body, or drop the connection.
- **A preset** is a real public server, such as DummyJSON, chosen from a list.
- **Custom** is any base URL you type, for example your own server or a classmate's deployment.

Our code never names a server.
It reads the chosen base URL from `import.meta.env.API_BASE`, which this site fills in from the selector, so switching the source never means editing the request.

### The response and the body

The Network view shows the request with its method, state, status, and duration.
`response.ok` is `true` for any status from 200 to 299 and `false` for a 404 or a 500, which is how we will notice those in the next step.

`response.json()` reads the whole body and parses it as JSON.
Two steps every time: `fetch` for the response, `json` for the data.

The log lists the keys of the answer: `products`, `total`, `skip`, and `limit`.
This server wraps the array inside an object, so the products are `data.products`, not `data`.
Never guess a response's shape; log it, read it, then write the line that reaches into it.
Our fixture file was copied from the DummyJSON `/products` answer, which is why the same code works on both.

**If it breaks:** If the Network view shows a request whose URL contains `undefined`, check the spelling of `import.meta.env.API_BASE`.
If the console says `products is not iterable` or `Cannot read properties of undefined`, `renderProducts` was given `data` instead of `data.products`.
If the console shows a `Promise` where you expected the data, an `await` is missing before `fetch` or before `response.json()`.
If a custom server fails with a CORS message in the console, the server is not allowing requests from this page; that is a server setting, not a bug in your code.

**Check:** Run the code with **Fixtures** selected and click **Load products**.
Eight products appear with their prices, the status line reads `8 products loaded.`, and the Network view shows one request that ended `ok` with status 200.
Click the row and the editor highlights the `fetch` line.
Then choose the **DummyJSON** preset, run, and click again: the request goes to `https://dummyjson.com/products?limit=8`, takes longer, and returns real products in the same shape, so nothing in the code changes.
Press **Run checks**; the checks click the button for you.

```quiz
Why does the code call `renderProducts(data.products)` and not `renderProducts(data)`?
- `data` is still a promise until `renderProducts` awaits it
= The server wraps the array in an object with `products`, `total`, `skip`, and `limit`
- `renderProducts` only accepts the first product
> Logging `Object.keys(data)` showed the shape of the answer: the array sits under `products`, beside the counts that describe it.
```

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
