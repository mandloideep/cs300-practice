---
title: A search form and query parameters
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [query-is-encoded, empty-query-refused, results-or-empty-message]
---

**We used this in:** [DOM and events](#/topic/dom-events) read a form with `FormData` and prevented the submit.

Loading the same eight products is a demo.
A real page asks the server for what the user wants, and the way to ask is the **query string**: the part of a URL after `?`, made of `key=value` pairs separated by `&`.
`/products/search?q=phone&limit=8` asks DummyJSON for products whose title matches `phone`, eight at most.

The button became a search form with a field named `q`, and the submit listener already prevents the reload and calls `loadProducts`.
Read the field and refuse an empty search before any request is made.

```js file="app.js" action="replace" anchor="  loadProducts();"
  const query = new FormData(form).get("q").trim();
  if (!query) {
    status.textContent = "Type something to search for.";
    return;
  }
  loadProducts(query);
```

Validation first, request second: an empty query would be a wasted request and a confusing answer.
Now the function needs the query as a parameter.

```js file="app.js" action="replace" anchor="async function loadProducts() {"
async function loadProducts(query) {
```

Build the URL from it.

```js file="app.js" action="replace" anchor='    const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");'
    const url = `${import.meta.env.API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=8`;
    console.log("Requesting", url);
    const response = await fetch(url);
```

The template literal puts the base, the path, and the parameters together.
`encodeURIComponent` is the line that matters.
A user can type anything, and some characters mean something inside a URL: a space is not allowed, `&` starts the next parameter, `#` starts a fragment.
`encodeURIComponent("mac & cheese")` gives `mac%20%26%20cheese`, so the whole phrase stays one value of `q`.
Without it, `q=mac & cheese` would send `q=mac` and a second nonsense parameter named ` cheese`.
Anything that comes from user input goes through `encodeURIComponent` before it goes into a URL.

The empty state can name the query now.

```js file="app.js" action="replace" anchor='      status.textContent = "No products found.";'
      status.textContent = `No products match "${query}".`;
```

**Check:** Run the code with **Fixtures** selected, type `phone`, and press Enter.
The Network view shows a request to `/products/search?q=phone&limit=8` and five products appear.
Search for `mac & cheese` and read the request URL: it contains `q=mac%20%26%20cheese`.
Fixtures answer every search with the same five products, because fixture routes ignore the query string, so switch to the **DummyJSON** preset to see real searching: `phone` returns phones, and `zzzz` ends with `No products match "zzzz".`
Press **Run checks**.

**If it breaks:** If the request URL contains `undefined`, `loadProducts` is still declared without the `query` parameter.
If a search for `mac & cheese` shows `q=mac%20&%20cheese` or `q=mac & cheese`, `encodeURIComponent` is missing.
If every search ends with a 404, the path is wrong; the search endpoint is `/products/search`, not `/products?search`.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const list = document.querySelector("#products");
const form = document.querySelector("#search-form");
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

async function loadProducts(query) {
  button.disabled = true;
  list.replaceChildren();
  status.textContent = "Loading products...";
  try {
    const url = `${import.meta.env.API_BASE}/products/search?q=${encodeURIComponent(query)}&limit=8`;
    console.log("Requesting", url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`The server answered with status ${response.status}.`);
    }
    const data = await response.json();
    if (data.products.length === 0) {
      status.textContent = `No products match "${query}".`;
      return;
    }
    renderProducts(data.products);
  } catch (error) {
    console.error("Loading failed:", error);
    status.textContent = "Could not load products. " + error.message;
  } finally {
    button.disabled = false;
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = new FormData(form).get("q").trim();
  if (!query) {
    status.textContent = "Type something to search for.";
    return;
  }
  loadProducts(query);
});
```

</details>
