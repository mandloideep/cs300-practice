---
title: Handle every failure
mode: edit
entry: index.html
inspector:
  views: [network]
api:
  default: fixtures
required: [second-submit-is-ignored, busy-flag-follows-the-request, failure-messages]
---

The search works when everything goes right, and this step handles the three ways it goes wrong and one way a second submit makes it worse.
Watch the status line as you cause each failure with the fixture controls: each kind of error should get its own sentence for the user.

```predict
Before you edit anything, you choose a dropped connection in the fixture controls, run, and search for `phone`; what does the status line say?
- `Could not reach the server. Check the connection and the API source, then try again.`
- `No products match "phone".`
= `Could not load products. Failed to fetch`
```

Put the fixture controls back to their defaults after that run.
Start with the second submit: keep a flag that says a request is in flight and refuse to start another.

```js file="app.js" action="insert-before" anchor="async function loadProducts(query) {"
let loading = false;

```

```js file="app.js" action="insert-after" anchor="async function loadProducts(query) {"
  if (loading) return;
  loading = true;
```

The flag is set before the `await` and must be cleared on every path out of the function, which is what `finally` is for.
While we are there, tell assistive technology that the list is changing, with the `aria-busy` attribute the HTML already carries.

```js file="app.js" action="replace" anchor="  button.disabled = true;"
  button.disabled = true;
  list.setAttribute("aria-busy", "true");
```

```js file="app.js" action="replace" anchor="    button.disabled = false;"
    loading = false;
    button.disabled = false;
    list.setAttribute("aria-busy", "false");
```

Now the failures: replace the one sentence in `catch` with one per kind of error.

```js file="app.js" action="replace" anchor='    status.textContent = "Could not load products. " + error.message;'
    if (error instanceof TypeError) {
      status.textContent = "Could not reach the server. Check the connection and the API source, then try again.";
    } else if (error instanceof SyntaxError) {
      status.textContent = "The server answered, but not with JSON this page can read.";
    } else {
      status.textContent = "Could not load products. " + error.message;
    }
```

`instanceof` asks which kind of error object this is, so a dropped connection now gets a sentence the user can act on.

## Read more

A slow answer invites a second submit, and a second request that lands after the first would overwrite its result.
Disabling the button stops a click, and the browser will not submit a form from the Enter key while its submit button is disabled, but code can still submit the form, as the checks do with `requestSubmit()`.
The flag makes `loadProducts` itself refuse a second request, whatever started it.

Three different things can throw inside `try`, and they are different kinds of error, so the user can be told what to do about each.
A network failure makes `fetch` reject with a `TypeError`.
A body that is not JSON makes `response.json()` throw a `SyntaxError`.
Our own `throw` carries the HTTP status in its message.

The console still gets the real error from `console.error`, with its stack, because that line is for us; the status line is for the user, and a raw `Failed to fetch` tells them nothing.

**If it breaks:** If the second submit still sends a request, `loading = true` is set after the `await` or `loading` is never read at the top of the function.
If no search works after one failure, `loading = false` is missing from `finally`, so the flag stays up forever.
If every failure shows the generic sentence, the `instanceof` checks are comparing against strings instead of the `TypeError` and `SyntaxError` constructors.

**Check:** Run the code with **Fixtures** selected and cause each outcome.

1. Set the latency to 2000 milliseconds, search for `phone`, and press Enter again while it says `Loading products...`: the Network view shows one request, not two, and `aria-busy` on the list is `true` until it settles.
2. Choose an HTTP error such as 503: the status line names the status.
3. Choose a malformed body: the request shows a parse error and the status line says the answer was not JSON.
4. Choose a dropped connection: the status line says the server could not be reached.

Put the controls back to their defaults and search again; the products return and the button is enabled.
Then choose a **Custom** base and type an address that does not exist, such as `https://example.invalid`: the request fails as a network error, and the console explains whether the cause was the address or a CORS refusal.
Press **Run checks** with the controls at their defaults; the checks submit twice in a row and count the requests.

```quiz
With the finished code, which of these errors reaches the `else` branch in `catch`?
- The `TypeError` from a dropped connection
- The `SyntaxError` from a malformed body
= The `Error` we throw when `response.ok` is false
> `fetch` rejects with a `TypeError` and `response.json()` throws a `SyntaxError`, so the only error left for `else` is our own, whose message carries the status.
```

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

let loading = false;

async function loadProducts(query) {
  if (loading) return;
  loading = true;
  button.disabled = true;
  list.setAttribute("aria-busy", "true");
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
    if (error instanceof TypeError) {
      status.textContent = "Could not reach the server. Check the connection and the API source, then try again.";
    } else if (error instanceof SyntaxError) {
      status.textContent = "The server answered, but not with JSON this page can read.";
    } else {
      status.textContent = "Could not load products. " + error.message;
    }
  } finally {
    loading = false;
    button.disabled = false;
    list.setAttribute("aria-busy", "false");
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
