---
title: The call stack
mode: edit
entry: index.html
required: [last-in-first-out, stack-inside-pack, ship-after-script, ship-stack-alone]
---

Before any timer or promise, JavaScript keeps one list of the functions that are running right now, the **call stack**.
This step watches that stack grow and shrink as an order is placed, prepared, and packed, prints it from inside the innermost function, and then hands one job to a timer to see what the stack looks like when that job finally runs.
Watch which function finishes first, and which names are missing from the timer's stack.

**We used this in:** [Errors and debugging](#/topic/errors-and-debugging) read the stack trace of an error, and [Fetch basics](#/topic/fetch-basics) saw a zero delay timer run after the rest of the script; this step shows why both look the way they do.

```demo name="call-stack"
```

Three functions call each other: `placeOrder` calls `prepare`, and `prepare` calls `pack`.
Each one logs when it starts and when it ends.

```predict
Which line does the console show right after `start pack`?
- `end placeOrder`
- `end prepare`
= `end pack`
```

Press **Run**.
The console shows `start placeOrder`, `start prepare`, `start pack`, `end pack`, `end prepare`, `end placeOrder`.

A call puts a **frame** for the function on top of the stack, and the caller waits underneath until that frame is finished and removed.
So the last function to start is the first to end, like a stack of plates where you can only take the top one.
`placeOrder` cannot print `end placeOrder` while `prepare` is still on top of it.

Print the stack from inside `pack`.
`new Error(...)` captures the stack at the moment it is made, even if you never throw it, so its `stack` is a picture of what is running.

```js file="src/main.js" action="insert-after" anchor='  console.log("start pack");'
  console.log(new Error("Stack inside pack").stack);
```

```predict
How many `at` lines does the stack printed inside `pack` have?
- One
= Four
- Three
```

Run it.
Four, read from the top down:

```text
Error: Stack inside pack
    at pack (src/main.js:3:15)
    at prepare (src/main.js:9:3)
    at placeOrder (src/main.js:15:3)
    at src/main.js:19:1
```

`pack` is on top because it is running, `prepare` and `placeOrder` wait under it, and the bottom frame is the script itself, which called `placeOrder` on its last line.
It is the same list as a stack trace in the last topic, taken without an error.

Add one more line at the end of the script.

```js file="src/main.js" action="append"
console.log("script done");
```

Run it, and `script done` prints last, after `end placeOrder`, because the script's own frame was waiting at the bottom all along.

Now give shipping to a timer instead of calling it directly.
Add these lines inside `placeOrder`, after the call to `prepare`.

```js file="src/main.js" action="insert-after" anchor="  prepare();"
  setTimeout(function ship() {
    console.log("start ship");
    console.log(new Error("Stack inside ship").stack);
  }, 0);
```

The function given to `setTimeout` has a name, `ship`, so that it shows up by name in the stack.

```predict
Where does `start ship` appear in the console?
- Right after `end prepare`
- Right after `end placeOrder`
= After `script done`
```

Run it.
`start ship` comes after `script done`, and the stack printed inside it has a single line:

```text
Error: Stack inside ship
    at ship (src/main.js:18:17)
```

`placeOrder` is not in it, and neither is the script, because by the time `ship` ran, both had finished and their frames were gone.
`setTimeout` did not call `ship`; it handed `ship` to the browser and returned at once, and the browser called `ship` later, on an empty stack.

That is the whole rule this topic builds on.
JavaScript runs one frame at a time on one stack, and nothing can interrupt the frame on top.
A callback that is waiting for a timer, a click, or a promise can only run once the stack is **empty**, when the current script or callback has finished completely.
The next step looks at where those callbacks wait in the meantime.

## Read more

The empty stack has a consequence for errors that surprises everyone once, so try it on purpose.
Add `throw new Error("The truck is late");` as the last line inside `ship`, and wrap the whole `setTimeout(...)` call, all four lines, in `try {` and `} catch (error) { console.log("caught:", error.message); }`.
Run it.
The console shows a red **uncaught** line, `Error: The truck is late`, and no `caught:` line.
The `try` belonged to `placeOrder`, and `placeOrder` had finished long before `ship` ran, so there was no `catch` on the stack to take the error.
Remove the `throw` and the `try` again; the promise steps later in this topic show where a `catch` for later work belongs.

A stack also has a limit.
A function that calls itself forever adds frames and never removes any, and the browser stops it with `RangeError: Maximum call stack size exceeded`.

**If it breaks:** If `start ship` prints before `end placeOrder`, `ship` is being called directly instead of being passed to `setTimeout`.
If the pack stack has fewer `at` lines than four, the `new Error` line is outside `pack`.
If nothing prints at all, look for a missing `)` after the `0` at the end of the `setTimeout` call.

**Check:** Run the code.
The console shows the six start and end lines nested as above, the four frame stack from inside `pack`, `script done`, and last `start ship` with a one frame stack.
Press **Run checks** to confirm.

```quiz
When does a callback passed to `setTimeout(callback, 0)` run?
- Immediately, before the next line
= Once the stack is empty, after the current script has finished
- Exactly one millisecond later, even in the middle of a function
> Nothing interrupts the frame on top of the stack, so a timer's callback waits until the script or callback that is running has finished completely.
```

```quiz
A `try` and `catch` wraps a `setTimeout` call whose callback throws; what does the console show?
- The `catch` logs the error
= A red uncaught error
- Nothing, because errors inside timers are ignored
> The `try` was on the stack only while `setTimeout` was being called, and it had finished long before the callback ran and threw.
```

<details>
<summary>src/main.js after this step</summary>

```js
function pack() {
  console.log("start pack");
  console.log(new Error("Stack inside pack").stack);
  console.log("end pack");
}

function prepare() {
  console.log("start prepare");
  pack();
  console.log("end prepare");
}

function placeOrder() {
  console.log("start placeOrder");
  prepare();
  setTimeout(function ship() {
    console.log("start ship");
    console.log(new Error("Stack inside ship").stack);
  }, 0);
  console.log("end placeOrder");
}

placeOrder();
console.log("script done");
```

</details>
