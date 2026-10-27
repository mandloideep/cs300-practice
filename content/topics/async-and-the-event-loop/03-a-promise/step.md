---
title: A promise
mode: edit
entry: index.html
required: [executor-runs-at-once, then-runs-later, settles-once]
---

A **promise** is an object that stands for a value you do not have yet, such as a course list that is still on its way.
This step builds one by hand from a timer, logs it before and after it has its value, and attaches callbacks with `then`.
Watch which lines print immediately, which wait, and what a promise looks like while it waits.

**We used this in:** [Fetch basics](#/topic/fetch-basics) waited on promises that `fetch` and a ready-made `delay` function made; here you make the promise yourself, so you can see what is inside one.

The starter has a catalog of three courses.
Press **Run** and the console shows `Catalog has 3 courses`.

Pretend that the catalog comes from a server and takes 150 ms to arrive.
`loadCourses` returns a new promise; the function passed to `new Promise` is called the **executor**, and it receives `resolve`, a function to call once the value is ready.

```js file="src/main.js" action="append"

function loadCourses() {
  return new Promise((resolve) => {
    console.log("Request sent");
    setTimeout(() => resolve(catalog), 150);
  });
}
```

The timer plays the part of the network: after 150 ms it calls `resolve(catalog)`, and that is the moment the promise gets its value.
Nothing calls `loadCourses` yet, so this edit prints nothing new.

Call it and log what comes back.

```js file="src/main.js" action="append"

const request = loadCourses();
console.log("Right away:", request);
```

Predict before you run: what does the second line show, `Right away: ["CS200","CS300","CS315"]`, `Right away: [Promise]`, or `Right away: undefined`?
Run it.
The console shows `Request sent` and then `Right away: [Promise]`.
`loadCourses` returned at once with the promise itself, not with the courses, which do not exist yet; the lab prints any promise as `[Promise]`, while the browser's own console shows `Promise {<pending>}`.
`Request sent` came first because the executor runs immediately, inside `new Promise`, before `loadCourses` even returns.

A promise starts **pending**.
When the executor calls `resolve`, it becomes **fulfilled** with that value; when something goes wrong, the executor can call `reject` instead and the promise becomes **rejected**, which is the next step.
Either way it is now **settled**, and a settled promise never changes again.

To use the value, give the promise a callback with `then`.

```js file="src/main.js" action="append"

request.then((courses) => {
  console.log("Loaded:", courses);
});
console.log("Waiting for the course list...");
```

Predict before you run: does `Loaded:` print before or after `Waiting for the course list...`?
Run it.
After: `Waiting for the course list...` prints at once, and about 150 ms later `Loaded: ["CS200","CS300","CS315"]`.
`then` only registers the callback and returns; the callback runs when the promise is fulfilled, with the value passed to `resolve`.

Last, ask the same promise again, long after it was fulfilled.

```js file="src/main.js" action="append"

setTimeout(() => {
  request.then((courses) => {
    console.log("Still there later:", courses.length, "courses");
  });
}, 300);
```

Predict before you run: at 300 ms the promise was fulfilled long ago, so does the new `then` callback run with the courses, run with `undefined`, or never run?
Run it.
`Still there later: 3 courses` prints.
A promise keeps its value once it is settled, and a `then` attached afterwards still runs, soon, with that same value.
That is what makes a promise better than a plain callback: anyone can ask it for the value, before or after it arrives, and every one of them gets it.

Compare it with the timers of the last step.
A timer runs one callback once, and if you were not there with your callback when it was set, you missed it.
A promise is a value with a state, pending, then fulfilled or rejected, and `then` means "when you are settled, call this".

Try the common mistakes on purpose.
Inside the executor, call `resolve` a second time right after the timer line, with `resolve(["only this one?"])`, and run: `Loaded:` prints `["only this one?"]`, because the first call to `resolve` settles the promise and the timer's later call is ignored.
Remove that line, then replace the three lines of the first `request.then` with the single line `request.then(console.log("Loaded:", request));` and run: `Loaded: [Promise]` prints at once, because the argument is evaluated immediately and `then` received `undefined` instead of a function.
Put both back as they were.

**If it breaks:** If the console shows `Right away: undefined` and then `TypeError: Cannot read properties of undefined (reading 'then')`, `loadCourses` is missing its `return`, so it returns `undefined` instead of the promise.
If `Loaded:` never prints, the timer calls something other than `resolve`, or the executor does not take `resolve` as its parameter.
If `Loaded:` prints `undefined`, `resolve` was called with nothing; it should receive `catalog`.

**Check:** Run the code.
The console shows `Catalog has 3 courses`, `Request sent`, `Right away: [Promise]`, `Waiting for the course list...`, then `Loaded: ["CS200","CS300","CS315"]`, and last `Still there later: 3 courses`.
The checks wait for the last line before they read the console.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const catalog = ["CS200", "CS300", "CS315"];

console.log("Catalog has", catalog.length, "courses");

function loadCourses() {
  return new Promise((resolve) => {
    console.log("Request sent");
    setTimeout(() => resolve(catalog), 150);
  });
}

const request = loadCourses();
console.log("Right away:", request);

request.then((courses) => {
  console.log("Loaded:", courses);
});
console.log("Waiting for the course list...");

setTimeout(() => {
  request.then((courses) => {
    console.log("Still there later:", courses.length, "courses");
  });
}, 300);
```

</details>
