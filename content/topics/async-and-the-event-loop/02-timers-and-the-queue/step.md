---
title: Timers and the queue
mode: edit
entry: index.html
required: [delay-order, timers-wait-for-the-stack, break-cancelled]
---

A callback handed to `setTimeout` waits somewhere until it is allowed onto the stack, and that somewhere is the **task queue**.
This step sets up a study timer with three timers in the wrong order, then blocks the stack with a long calculation, and reads the time each callback really ran.
Watch the milliseconds: a timer's delay is the earliest it can run, not a promise that it will run then.

The starter records the moment it starts and has a helper, `stamp`, that logs a label with the milliseconds since then.
Press **Run** and the console shows `Study timer started after 0 ms`.

Set three timers, deliberately not in the order they are due.

```js file="src/main.js" action="append"

setTimeout(() => stamp("Break over"), 300);
setTimeout(() => stamp("Reading done"), 100);
setTimeout(() => stamp("Flashcards done"), 200);
stamp("Timers set");
```

Predict before you run: in which order do the three timers print, the order of the lines (break, reading, flashcards), the order of their delays (reading, flashcards, break), or all at once right after `Timers set`?
Run it.
The console shows `Timers set after 0 ms`, then `Reading done` after about 100 ms, `Flashcards done` after about 200, and `Break over` after about 300; the exact numbers wobble by a millisecond or two from run to run.
Each `setTimeout` returned at once, so `Timers set` printed in the same millisecond.
The browser kept the three callbacks and their due times, and as each time came, it put that callback in the task queue, where it waits for the stack to be empty.

Now keep the stack busy for a quarter of a second with a loop that does nothing but check the clock.

```js file="src/main.js" action="append"

const busyUntil = Date.now() + 250;
while (Date.now() < busyUntil) {}
stamp("Long calculation finished");
```

The loop stands in for any slow synchronous work, such as sorting a huge list.
Predict before you run: `Reading done` is due at 100 ms, so does it print after about 100 ms, after about 250 ms, or before `Long calculation finished`?
Run it.
`Long calculation finished after 250 ms` prints first, and only then `Reading done` and `Flashcards done`, both after about 250 ms, with `Break over` still at about 300.
The reading timer was due at 100 ms and went into the queue then, but the script was still on the stack, and nothing in the queue can run until the stack is empty.
Both overdue callbacks ran the moment the loop ended, one after the other, in the order they were due.
While the loop ran, the page could not respond to anything either, which is why slow work freezes a page.

Last, skip the break: keep the id that `setTimeout` returns, and cancel that timer before it fires.

```js file="src/main.js" action="replace" anchor='setTimeout(() => stamp("Break over"), 300);'
const breakTimer = setTimeout(() => stamp("Break over"), 300);
```

```js file="src/main.js" action="append"

clearTimeout(breakTimer);
stamp("Break skipped");
```

Predict before you run: does `Break over` still print, at about 300 ms?
Run it.
`Break skipped` prints right after the long calculation, and `Break over` never prints.
`setTimeout` returns a number that names the timer, and `clearTimeout` with that number removes the callback before it reaches the queue.

The browser's part in all this is the **event loop**: while the stack is empty, take the first callback from the queue, run it until the stack is empty again, and repeat.
Timers, clicks, and the arrival of network responses all add callbacks to the queue the same way, which is why the Week 6 click handlers and the fetch callbacks both ran "later".
A delay of `0` only means "as soon as the stack is empty", the case [Fetch basics](#/topic/fetch-basics) showed with its first timer.
A long synchronous loop is the one thing that makes every one of them wait, so long work should be broken up or moved off the main thread, a topic for later in the course.

Try the common mistake on purpose: change the `250` in `busyUntil` to `1000` and run.
For a whole second nothing happens, the lab's editor included, and then everything prints at once, every timer after about 1000 ms.
Change it back to `250`.

**If it breaks:** If the page freezes for a long time, the `while` loop's condition never becomes false; it must compare `Date.now()` with `busyUntil`, not with a fixed number.
If `Break over` still prints, the `clearTimeout` call passes something other than `breakTimer`, or `breakTimer` is not the variable that holds the break timer's id.
If every timer prints at 0 ms, the callbacks call `stamp` immediately: each `setTimeout` needs an arrow function, `() => stamp("...")`, not `stamp("...")`.

**Check:** Run the code.
The console shows `Study timer started` and `Timers set` at 0 ms, `Long calculation finished` and `Break skipped` at about 250 ms, then `Reading done` and `Flashcards done`, both at about 250 ms, and no `Break over`.
The checks wait a little over a third of a second for the timers before they read the console.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const start = Date.now();

function stamp(label) {
  console.log(`${label} after ${Date.now() - start} ms`);
}

stamp("Study timer started");

const breakTimer = setTimeout(() => stamp("Break over"), 300);
setTimeout(() => stamp("Reading done"), 100);
setTimeout(() => stamp("Flashcards done"), 200);
stamp("Timers set");

const busyUntil = Date.now() + 250;
while (Date.now() < busyUntil) {}
stamp("Long calculation finished");

clearTimeout(breakTimer);
stamp("Break skipped");
```

</details>
