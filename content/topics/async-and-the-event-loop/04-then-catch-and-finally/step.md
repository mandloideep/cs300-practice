---
title: Then, catch, and finally
mode: edit
entry: index.html
required: [chain-ships, catch-handles-the-rejection, finally-runs-for-both]
---

Real work comes in stages: an order is prepared, then shipped, and shipping can fail.
This step chains the two stages with `then`, sends a second order that has no address so that its promise is **rejected**, and handles the failure with `catch` and the clean-up with `finally`.
Watch where a rejection goes when nothing catches it, and how one `catch` at the end covers every stage above it.

**We used this in:** [Errors and debugging](#/topic/errors-and-debugging) caught an error with `try` and `catch`; a promise chain has its own `catch` for errors that happen later.

```demo name="promise-states"
```

`prepare` and `ship` each return a promise that settles after 100 ms.
`ship` calls `reject` with an error when the order has no address, which is how an executor reports a failure.
`track` prepares one order and logs it.
Press **Run** and after about 100 ms the console shows `Order 101 prepared`.

Ship the order once it is prepared.
Return the shipping promise from the first `then`, and add a second `then` for the shipped order.

```js file="src/main.js" action="replace" anchor='      console.log("Order", prepared.id, prepared.status);\n    });'
      console.log("Order", prepared.id, prepared.status);
      return ship(prepared);
    })
    .then((shipped) => {
      console.log("Order", shipped.id, shipped.status);
    });
```

```predict
When does the second `then` run?
- Immediately after the first
= About 100 ms after the first
- Never
```

Run it.
`Order 101 prepared` prints after about 100 ms and `Order 101 shipped` about 100 ms after that.
Every `then` returns a new promise, so you can call `then` on the result again; and when a callback returns a promise, the next `then` waits for that promise and receives its value.
That is how a chain runs stages one after another without nesting callbacks inside callbacks.

Now track the second order, which has no address.

```js file="src/main.js" action="append"
track(second);
```

```predict
After `Order 102 prepared`, what does the console show for order 102?
- `Order 102 shipped`
- Nothing at all
= A red line
```

Run it.
`Order 102 prepared` prints, and then a red line with an **uncaught** badge: `Error: Order 102 has no address`.
`ship` rejected, the second `then` was skipped because it handles only fulfilled values, and nothing in the chain handled the rejection, so the browser reports it as an **unhandled rejection**, the promise version of an uncaught error.

Add a `catch` at the end of the chain.

```js file="src/main.js" action="replace" anchor='      console.log("Order", shipped.id, shipped.status);\n    });'
      console.log("Order", shipped.id, shipped.status);
    })
    .catch((error) => {
      console.warn("Problem:", error.message);
    });
```

Run it.
The red line is gone, and a warning says `Problem: Order 102 has no address`.
A rejection skips every `then` below it until it reaches a `catch`, much as a `throw` skips the rest of the function until a `catch` takes it, so one `catch` at the end covers both stages.
After the `catch` has run, the chain carries on as fulfilled.

Last, a `finally` for work that should happen either way, such as updating the order screen.

```js file="src/main.js" action="replace" anchor='      console.warn("Problem:", error.message);\n    });'
      console.warn("Problem:", error.message);
    })
    .finally(() => {
      console.log("Order", order.id, "done");
    });
```

```predict
Which orders print a `done` line?
- Only 101
= Both
- Only 102
```

Run it.
Both: the console shows `Order 101 prepared`, `Order 102 prepared`, `Order 101 shipped`, `Order 101 done`, the warning for 102, and `Order 102 done`.
`finally` runs whether the chain was fulfilled or rejected, and its callback receives no value, because it is not meant to care which.
The two orders ran side by side, which is why their lines interleave: both were prepared at about 100 ms, and both shipping timers came due at about 200 ms.

## Read more

A `then` callback that throws is turned into a rejection too, so a bug inside a stage reaches the same `catch` as a failed request.
That is also why every chain needs a `catch` somewhere: a rejection that nothing handles is reported in red, and the work after it silently never happens.

Try the most common mistake on purpose: delete the word `return` before `ship(prepared)` and run.
The second `then` no longer waits; it runs at once with `undefined`, so both orders warn `Problem: Cannot read properties of undefined (reading 'id')`, and order 102's shipping promise, now outside the chain, fails as a red unhandled rejection.
Put `return` back.

**If it breaks:** If `Order 101 shipped` prints at the same moment as `Order 101 prepared` or prints `undefined`, the first `then` does not `return` the shipping promise.
If the red unhandled rejection is still there, the `catch` is attached to something other than the end of the chain; it should follow the second `then` with a dot.
If the console shows `SyntaxError` or the code does not compile, check that only the last call in the chain ends with `;` and that each stage starts with `.then`, `.catch`, or `.finally`.

**Check:** Run the code.
The console shows `Order 101 prepared`, `Order 102 prepared`, `Order 101 shipped`, `Order 101 done`, a warning `Problem: Order 102 has no address`, and `Order 102 done`, with no red line.
The checks wait for the last line before they read the console.
Press **Run checks** to confirm.

```quiz
The first stage of a chain rejects; what happens to the `then` callbacks below it?
- They all run with `undefined`
= They are skipped until the chain reaches a `catch`
- The chain stops silently, with nothing in the console
> A rejection passes over every `then` until a `catch` takes it, the way a `throw` skips the rest of a function.
```

```quiz
What does a `finally` callback receive?
- The fulfilled value
- The error
= Nothing
> `finally` runs whether the chain was fulfilled or rejected and is not told which, so it suits clean-up such as updating the order screen.
```

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

track(first);
track(second);
```

</details>
