---
title: The four request states
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [loading-state-shows, success-restores-the-button, error-and-empty-states]
---

A request is never instant and does not always succeed.
Between the click and the answer the page should say it is working, and when the answer is bad the page should say what went wrong instead of stopping with an error in the console.
Every request in this course has four outcomes the user can see: **loading**, **success**, **empty**, and **error**.

The workspace starts from the last step without the two logs.
Start with the loading state, which must be shown before the request starts.

```js file="app.js" action="insert-after" anchor="async function loadProducts() {"
  button.disabled = true;
  list.replaceChildren();
  status.textContent = "Loading products...";
```

Disabling the button stops a second click from starting a second request while the first is pending.
Clearing the list stops old results from sitting under a new request as if they were the answer.
Then the status line says what is happening.
All three run synchronously, before the `await`, so the user sees them the moment they click.

Now the error state.
`fetch` rejects its promise only when the network fails: no connection, a bad hostname, a dropped socket.
A 404 or a 500 is a successful request from `fetch`'s point of view, so we check `response.ok` ourselves and throw.
Wrap the request in `try`, `catch`, and `finally`.

```js file="app.js" action="replace" anchor='  const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");\n  const data = await response.json();\n  renderProducts(data.products);'
  try {
    const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
    if (!response.ok) {
      throw new Error(`The server answered with status ${response.status}.`);
    }
    const data = await response.json();
    renderProducts(data.products);
  } catch (error) {
    console.error("Loading failed:", error);
    status.textContent = "Could not load products. " + error.message;
  } finally {
    button.disabled = false;
  }
```

Anything thrown inside `try`, by `fetch`, by our `throw`, or by `response.json()` when the body is not JSON, lands in `catch`.
The catch logs the real error for us and writes a sentence for the user.
`finally` runs after either path, so the button is enabled again whether the request succeeded or failed; without it, one failure would leave the page stuck.

The empty state is a successful answer with nothing in it, and it deserves its own sentence rather than a blank list.

```js file="app.js" action="insert-after" anchor="    const data = await response.json();"
    if (data.products.length === 0) {
      status.textContent = "No products found.";
      return;
    }
```

A `return` inside `try` still runs `finally`, so the button comes back.
Read the function top to bottom now: loading first, then the request, then one branch per outcome, and cleanup at the end.
That order is the pattern, and Week 8 moves it into a single `status` value with one sentence per state.

**Check:** Run the code with **Fixtures** selected, set the fixture latency to 2000 milliseconds, and click **Load products**.
`Loading products...` shows for two seconds with the button disabled, then eight products appear.
Now cause each outcome on purpose and watch the page and the Network view together.

1. Choose an HTTP error such as 500: the request row ends as an HTTP error and the status line shows our message with the status.
2. Choose a malformed body: the status is 200, but `response.json()` fails, and the message shows the parse error.
3. Choose a dropped connection: `fetch` itself rejects, and the message shows `Failed to fetch`.
4. Change `/products?limit=8` to `/products-empty` and run: the fixtures answer with an empty array and the status line says `No products found.`
   Change the path back afterwards.

After every failure the button is enabled again.
Press **Run checks** with the fixture controls back at their defaults.

**If it breaks:** If the button stays disabled after an error, `finally` is missing or the enabling line sits inside `try`.
If an HTTP error shows eight products anyway, the `response.ok` check is missing, so the error body was handed to `renderProducts`.
If the empty case shows `0 products loaded.`, the length check runs after `renderProducts` instead of before it.

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
  button.disabled = true;
  list.replaceChildren();
  status.textContent = "Loading products...";
  try {
    const response = await fetch(import.meta.env.API_BASE + "/products?limit=8");
    if (!response.ok) {
      throw new Error(`The server answered with status ${response.status}.`);
    }
    const data = await response.json();
    if (data.products.length === 0) {
      status.textContent = "No products found.";
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

button.addEventListener("click", loadProducts);
```

</details>
