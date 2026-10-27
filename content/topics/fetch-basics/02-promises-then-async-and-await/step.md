---
title: Promises, then async and await
mode: edit
entry: index.html
inspector:
  views: []
required: [order-is-start-x-end-y-z, status-after-the-wait]
---

This step waits for the same promise twice: first with `then`, then with `async` and `await`, the syntax this course uses from here on.
Watch which lines wait and which do not: only the function that holds the `await` pauses, and the rest of the script carries on.

```demo name="promise-states"
```

The starter has a function we wrote for you, `delay`, which returns a promise that fulfills after some milliseconds.
Every promise has a `then` method that takes a callback to run when the promise fulfills.
Add a one second wait between `Start` and `End`.

```js file="app.js" action="insert-before" anchor='console.log("End");'
delay(1000).then(() => {
  console.log("The promise resolved");
  status.textContent = "The wait is over.";
});
```

Run it: `Start`, then `End` immediately, then the message a second later, because `then` registers the callback and returns at once.

Now write the same wait as an `async` function above the logs.

```demo name="async-await-unroll"
```

```js file="app.js" action="insert-before" anchor='console.log("Start");'
async function demo() {
  console.log("X");
  await delay(1000);
  console.log("Y");
  status.textContent = "The wait is over.";
  console.log("Z");
}

```

Inside an `async` function, `await` pauses that function at a promise and resumes it with the value once the promise fulfills.
Then call it in place of the `then` chain.

```predict
After you call `demo()` in place of the chain and run, in what order do the words arrive?
- Start, End, X, Y, Z
- Start, X, Y, Z, End
= Start, X, End, Y, Z
```

```js file="app.js" action="replace" anchor='delay(1000).then(() => {\n  console.log("The promise resolved");\n  status.textContent = "The wait is over.";\n});'
demo();
```

Run it and compare the console with your prediction.

## Read more

A callback handed to `setTimeout` works, but callbacks that wait for other callbacks nest into a staircase that Week 7 called callback hell.
Modern browser functions return a **promise** instead: an object that stands for a value that is not here yet.
A promise is **pending** until the work finishes, then it is **fulfilled** with a value or **rejected** with an error, and once settled it never changes again.

You will not write your own promises in this course; `fetch` and the other browser functions make them for you, and `delay` exists only so we can watch the timing without a network.

`then` returns at once, so `End` does not wait for it, exactly as `setTimeout` did not wait.
Chains of `then` read better than nested callbacks, and one `catch` at the end handles a failure anywhere in the chain, but the code still reads inside out.

The console shows `Start`, `X`, `End`, `Y`, `Z`.
`demo` runs synchronously until its first `await`, which is why `X` prints right away.
At the `await` the function pauses and hands control back to the line after `demo()`, so `End` prints next.
A second later the promise fulfills, the function resumes from where it paused, and `Y` and `Z` print.

Three rules carry the whole feature.
`async` goes before a function and makes it return a promise.
`await` goes before a promise and pauses only the function it is in.
`await` is allowed only inside an `async` function (and at the top level of a module, which this course does not use).
Forget the `await` and you get the promise object itself instead of the value, which is the most common async bug: `Promise {<pending>}` in a log where you expected data.

**If it breaks:** If `Y` and `Z` print before `End`, the `await` is missing, so nothing paused.
If the console says `await is only valid in async functions`, the `async` keyword is missing from `demo`.
If `X` never prints, `demo` is defined but the `demo();` call was not added.

**Check:** Run the code and read the console: `Start`, `X`, `End`, `Y`, `Z`, with a pause before `Y`.
The status line reads `The wait is over.` after the pause.
Press **Run checks**.

```quiz
What does `await delay(1000)` inside `demo` pause?
- The whole script, until the promise fulfills
= Only `demo`; the line after the `demo()` call runs meanwhile
- Nothing; `await` only marks the line for the reader
> `await` hands control back to whoever called the function, which is why `End` prints during the wait and `Y` prints after it.
```

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
  console.log("X");
  await delay(1000);
  console.log("Y");
  status.textContent = "The wait is over.";
  console.log("Z");
}

console.log("Start");
status.textContent = "Waiting...";
demo();
console.log("End");
```

</details>
