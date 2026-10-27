---
title: Ordering puzzles
mode: edit
entry: index.html
required: [puzzle-one, puzzle-two, puzzle-three, puzzle-four]
---

There is one more queue to meet: promise callbacks do not wait in the timer queue but in a faster one, the **microtask queue**, which is emptied completely after every piece of code that runs.
This step is four short puzzles that mix plain code, promise callbacks, and timers.
For each one, write down the order you expect before you run it, then let the console correct you.

Each puzzle is a function, and each starts 100 ms after the one before it, from its own timer, so that the lines of one puzzle never mix with the next.
Every line is numbered with its puzzle.
Press **Run** and the console shows `1 sync`.

Puzzle one: a timer, a promise callback, and a plain log, in that order in the code.
`Promise.resolve()` makes a promise that is already fulfilled, so its `then` callback is ready to run as soon as it is allowed to.

```predict
With the two lines below added above `console.log("1 sync")`, in which order does puzzle one print?
- `1 timer`, `1 microtask`, `1 sync`
= `1 sync`, `1 microtask`, `1 timer`
- `1 sync`, `1 timer`, `1 microtask`
```

```js file="src/main.js" action="insert-before" anchor='  console.log("1 sync");'
  setTimeout(() => console.log("1 timer"), 0);
  Promise.resolve().then(() => console.log("1 microtask"));
```

Run it.
`1 sync`, `1 microtask`, `1 timer`.
The plain log runs first because the script is still on the stack.
When the script ends, the event loop empties the microtask queue before it takes the next task from the timer queue, so the promise callback beats a timer that was set earlier with a delay of zero.

Puzzle two adds a chain of two `then` callbacks and `queueMicrotask`, which puts a function straight onto the microtask queue.
Add the function above the call to `puzzleOne`.

```js file="src/main.js" action="insert-before" anchor="puzzleOne();"
function puzzleTwo() {
  setTimeout(() => console.log("2 timer"), 0);
  Promise.resolve()
    .then(() => console.log("2 first then"))
    .then(() => console.log("2 second then"));
  queueMicrotask(() => console.log("2 queueMicrotask"));
  console.log("2 sync");
}

```

And start it 100 ms after the run.

```js file="src/main.js" action="append"
setTimeout(puzzleTwo, 100);
```

```predict
After `2 sync`, in which order do the other four lines print?
- `2 first then`, `2 second then`, `2 queueMicrotask`, `2 timer`
- `2 queueMicrotask`, `2 first then`, `2 second then`, `2 timer`
= `2 first then`, `2 queueMicrotask`, `2 second then`, `2 timer`
```

Run it.
`2 sync`, `2 first then`, `2 queueMicrotask`, `2 second then`, `2 timer`.
When `puzzleTwo` ran, only two microtasks were queued: the first `then`, because its promise was already fulfilled, and the `queueMicrotask` function.
The second `then` belongs to the promise that the first `then` returns, which is fulfilled only once the first callback has run, so it joins the end of the queue then, behind `queueMicrotask`.
The timer still waits for the whole microtask queue, including the callback that was added while it was being emptied.

Puzzle three: a timer that queues a microtask, and a microtask that sets a timer.

```js file="src/main.js" action="insert-before" anchor="puzzleOne();"
function puzzleThree() {
  setTimeout(() => {
    console.log("3 first timer");
    Promise.resolve().then(() => console.log("3 microtask from the timer"));
  }, 0);
  setTimeout(() => console.log("3 second timer"), 0);
  Promise.resolve().then(() => {
    console.log("3 microtask");
    setTimeout(() => console.log("3 timer from the microtask"), 0);
  });
}

```

```js file="src/main.js" action="append"
setTimeout(puzzleThree, 200);
```

```predict
Where does `3 microtask from the timer` print?
- After `3 second timer`
= Right after `3 first timer`
- Last of all
```

Run it.
`3 microtask`, `3 first timer`, `3 microtask from the timer`, `3 second timer`, `3 timer from the microtask`.
The microtask runs first, as in puzzle one, and sets a third timer, which goes to the back of the timer queue.
Then the first timer runs, and the microtask queue is emptied again the moment it finishes, before the second timer gets its turn.
That is the rule in full: **one task, then every microtask, then the next task**, where a task is the script or one timer, click, or other callback from the browser.

Puzzle four: an `async` function with an `await`.

```js file="src/main.js" action="insert-before" anchor="puzzleOne();"
async function checkIn() {
  console.log("4 before await");
  await Promise.resolve();
  console.log("4 after await");
}

function puzzleFour() {
  setTimeout(() => console.log("4 timer"), 0);
  checkIn();
  console.log("4 sync after the call");
}

```

```js file="src/main.js" action="append"
setTimeout(puzzleFour, 300);
```

```predict
Which line comes right after `4 before await`?
- `4 after await`
- `4 timer`
= `4 sync after the call`
```

Run it.
`4 before await`, `4 sync after the call`, `4 after await`, `4 timer`.
`checkIn` runs like any function until its `await`; the rest of it, the part a `then` callback would hold, becomes a microtask, so it runs after `puzzleFour` has finished and before the timer.

## Read more

Every puzzle follows the same three rules.
Plain code runs to the end, and nothing interrupts it.
Then every microtask runs: promise callbacks, the code after an `await`, and `queueMicrotask` functions, including the ones added while the queue is being emptied.
Then one task from the task queue runs, a timer or an event, and the cycle starts again.
The browser draws the page between tasks, not between microtasks, which is why a promise chain that never ends would freeze a page as surely as a `while` loop.

The puzzles are about order, not about time.
`fetch`, clicks, and real timers decide **when** a promise settles or a task is queued; these rules decide what runs **first** once several things are ready.

Try the common mistake on purpose.
In `puzzleOne`, replace `Promise.resolve()` with `new Promise((resolve) => setTimeout(resolve, 0))`, a promise made from a timer as in Step 3, and run: now `1 timer` prints before `1 microtask`.
The `then` callback is still a microtask, but the promise is not fulfilled until its own timer has run, after the first one, so there is nothing to run until then.
Put `Promise.resolve()` back.

**If it breaks:** If a puzzle's lines are mixed with another puzzle's, two puzzles start from the same timer delay; they should start at 0, 100, 200, and 300 ms.
If a puzzle prints nothing, its `setTimeout(puzzleName, delay)` line is missing at the end of the file, or the function name is misspelled there.
If `4 after await` prints before `4 sync after the call`, the `await` is missing in `checkIn`.

**Check:** Run the code.
The console shows the four puzzles in turn, each in the order explained above, ending with `4 timer`.
The checks wait for `4 timer` before they read the console.
Press **Run checks** to confirm.

```quiz
After the script ends, which runs first: a `setTimeout(..., 0)` callback set at the top, or a `then` callback on `Promise.resolve()` set below it?
- The timer, because it was set first
= The `then` callback
- Whichever the browser picks
> When a task ends, the event loop empties the microtask queue before it takes the next task, so a promise callback beats a zero delay timer.
```

```quiz
A timer callback queues a microtask, and a second timer is already waiting; when does that microtask run?
= Right after the first timer's callback, before the second timer
- After the second timer
- After every timer in the queue
> One task, then every microtask, then the next task: the microtask queue is emptied after each timer callback, not only after the script.
```

<details>
<summary>src/main.js after this step</summary>

```js
function puzzleOne() {
  setTimeout(() => console.log("1 timer"), 0);
  Promise.resolve().then(() => console.log("1 microtask"));
  console.log("1 sync");
}

function puzzleTwo() {
  setTimeout(() => console.log("2 timer"), 0);
  Promise.resolve()
    .then(() => console.log("2 first then"))
    .then(() => console.log("2 second then"));
  queueMicrotask(() => console.log("2 queueMicrotask"));
  console.log("2 sync");
}

function puzzleThree() {
  setTimeout(() => {
    console.log("3 first timer");
    Promise.resolve().then(() => console.log("3 microtask from the timer"));
  }, 0);
  setTimeout(() => console.log("3 second timer"), 0);
  Promise.resolve().then(() => {
    console.log("3 microtask");
    setTimeout(() => console.log("3 timer from the microtask"), 0);
  });
}

async function checkIn() {
  console.log("4 before await");
  await Promise.resolve();
  console.log("4 after await");
}

function puzzleFour() {
  setTimeout(() => console.log("4 timer"), 0);
  checkIn();
  console.log("4 sync after the call");
}

puzzleOne();
setTimeout(puzzleTwo, 100);
setTimeout(puzzleThree, 200);
setTimeout(puzzleFour, 300);
```

</details>
