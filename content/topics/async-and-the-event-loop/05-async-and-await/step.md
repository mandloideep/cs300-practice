---
title: Async and await
mode: edit
entry: index.html
required: [returns-at-once, awaits-in-order, try-catch-finally]
---

The chain from the last step works, but it reads as a list of callbacks rather than as the steps of shipping an order.
This step writes the same tracking a second time as an `async` function, where `await` waits for each promise and `try`, `catch`, and `finally` handle the failure, and keeps the chain above it so that you can compare them line by line.
Watch what the function does at each `await`, and what the rest of the script does meanwhile.

**We used this in:** [Fetch basics](#/topic/fetch-basics) used `async` and `await` around `fetch`; this step shows what they stand for, using the chain you just wrote.

The starter is the last step's finished file.
Press **Run** and the console shows the six lines for orders 101 and 102, with the warning for 102.

Add an `async` version of `track` above the two calls, starting with the first stage only.

```js file="src/main.js" action="insert-before" anchor="track(first);"
async function trackWithAwait(order) {
  const prepared = await prepare(order);
  console.log("Order", prepared.id, prepared.status);
}

```

`await prepare(order)` pauses this function until the promise is fulfilled and then hands back its value, so `prepared` is the order itself, not a promise.
The line after the `await` plays the part of the first `then` callback.

Call the new function instead of the old one, and log a line right after the call.

```js file="src/main.js" action="replace" anchor="track(first);\ntrack(second);"
trackWithAwait(first);
console.log("Tracking started");
```

Predict before you run: does `Tracking started` print before or after `Order 101 prepared`?
Run it.
`Tracking started` prints first, and `Order 101 prepared` about 100 ms later.
At the `await`, `trackWithAwait` stopped and gave control back to its caller, so the script went on to the next line; when the promise was fulfilled, the function picked up where it stopped.
`await` pauses only the function it is in, never the whole page.

Add the second stage, inside `trackWithAwait`, after its first log.

```js file="src/main.js" action="insert-after" anchor='  console.log("Order", prepared.id, prepared.status);'
  const shipped = await ship(prepared);
  console.log("Order", shipped.id, shipped.status);
```

Run it: `Tracking started`, `Order 101 prepared`, and `Order 101 shipped` about 100 ms later.
Two `await` lines one after the other run the stages in order, the job the returned promise did in the chain.

Now track the second order too.

```js file="src/main.js" action="replace" anchor="trackWithAwait(first);"
trackWithAwait(first);
trackWithAwait(second);
```

Predict before you run: order 102 has no address, so does the console show a warning, a red line, or nothing for it?
Run it.
A red **uncaught** line: `Error: Order 102 has no address`.
When the promise an `await` waits for is rejected, the `await` line **throws** the rejection's error, as if the line said `throw error`.
Nothing catches it, so the promise that `trackWithAwait` returns is rejected and nobody handles that either.

Wrap the stages in `try`, the same `try` and `catch` as in the last topic, and add `finally`.

```js file="src/main.js" action="replace" anchor='  const prepared = await prepare(order);\n  console.log("Order", prepared.id, prepared.status);\n  const shipped = await ship(prepared);\n  console.log("Order", shipped.id, shipped.status);'
  try {
    const prepared = await prepare(order);
    console.log("Order", prepared.id, prepared.status);
    const shipped = await ship(prepared);
    console.log("Order", shipped.id, shipped.status);
  } catch (error) {
    console.warn("Problem:", error.message);
  } finally {
    console.log("Order", order.id, "done");
  }
```

Run it.
The console shows `Tracking started`, then the same six lines the chain printed, in the same order: `Order 101 prepared`, `Order 102 prepared`, `Order 101 shipped`, `Order 101 done`, the warning for 102, and `Order 102 done`.

Read `track` and `trackWithAwait` side by side, because they are the same program.

| The chain | The async function |
| --- | --- |
| `prepare(order).then((prepared) => { ... })` | `const prepared = await prepare(order);` and the lines after it |
| `return ship(prepared);` and the next `.then((shipped) => ...)` | `const shipped = await ship(prepared);` and the lines after it |
| `.catch((error) => ...)` | `catch (error) { ... }` |
| `.finally(() => ...)` | `finally { ... }` |

Each `await` cuts the function in two: everything after it is the callback a `then` would have held, and it runs later, when the promise settles.
That is why code after an `await` can be interrupted by other callbacks, while code without one never is.
An `async` function always returns a promise, even when it has no `await` or returns a plain value, so its caller can `await` it or call `then` on it in turn.

Try the two classic mistakes on purpose.
First, delete the word `await` before `prepare(order)` and run: the console shows `Order undefined undefined` for both orders, because `prepared` is now the promise itself, which has no `id` and no `status`, and `ship` then complains about `Order undefined`.
Put `await` back.
Second, delete `async` before `function trackWithAwait` and run: nothing prints except one red line, `SyntaxError: Unexpected reserved word`, pointing at the first `await`.
`await` is only allowed inside an `async` function, and a syntax error stops the whole file before any of it runs.
Put `async` back.

**If it breaks:** If the console shows `Order undefined undefined`, an `await` is missing before `prepare` or `ship`.
If the red `Order 102 has no address` line is still there, the `await ship(prepared)` line is outside the `try` braces.
If the console shows `SyntaxError: Unexpected reserved word`, the `async` before `function trackWithAwait` is missing.
If the code does not compile, check that `catch (error) {` and `finally {` each follow a closing `}` directly, and that every brace of the `try` is closed.

**Check:** Run the code.
The console shows `Tracking started` first, then `Order 101 prepared`, `Order 102 prepared`, `Order 101 shipped`, `Order 101 done`, a warning `Problem: Order 102 has no address`, and `Order 102 done`, with no red line.
The checks wait for the last line before they read the console.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
function prepare(order) {
  return new Promise((resolve) => {
    setTimeout(() => {
      order.status = "prepared";
      resolve(order);
    }, 100);
  });
}

function ship(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (order.address === undefined) {
        reject(new Error(`Order ${order.id} has no address`));
        return;
      }
      order.status = "shipped";
      resolve(order);
    }, 100);
  });
}

const first = { id: 101, item: "Notebook", address: "5500 N St Louis Ave" };
const second = { id: 102, item: "Calculator" };

function track(order) {
  return prepare(order)
    .then((prepared) => {
      console.log("Order", prepared.id, prepared.status);
      return ship(prepared);
    })
    .then((shipped) => {
      console.log("Order", shipped.id, shipped.status);
    })
    .catch((error) => {
      console.warn("Problem:", error.message);
    })
    .finally(() => {
      console.log("Order", order.id, "done");
    });
}

async function trackWithAwait(order) {
  try {
    const prepared = await prepare(order);
    console.log("Order", prepared.id, prepared.status);
    const shipped = await ship(prepared);
    console.log("Order", shipped.id, shipped.status);
  } catch (error) {
    console.warn("Problem:", error.message);
  } finally {
    console.log("Order", order.id, "done");
  }
}

trackWithAwait(first);
trackWithAwait(second);
console.log("Tracking started");
```

</details>
