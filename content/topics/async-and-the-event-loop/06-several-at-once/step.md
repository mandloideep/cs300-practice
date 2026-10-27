---
title: Several at once
mode: edit
entry: index.html
required: [one-by-one-adds-up, together-overlaps, all-rejects-on-the-first-failure, settled-reports-each]
---

A course page needs three things before it can show anything: the course list, today's schedule, and the announcements.
This step loads them one after another with three `await` lines, then all at once with `Promise.all`, and times both; then it lets one of them fail and compares `Promise.all` with `Promise.allSettled`.
Watch the milliseconds: when the waits overlap, the total is the slowest wait, not the sum.

`load` returns a promise that fulfills with a value after some milliseconds, and `fail` returns one that rejects after some milliseconds; they stand in for three requests to a server.
`oneByOne` awaits the three loads in turn and logs how long that took.
Press **Run** and after about half a second the console shows `One by one: 452 ms ["3 courses","2 classes today","1 announcement"]`, with a number close to 450 that changes a little from run to run.
Each `await` waited for its load to finish before the next load even started, so the times added up: 200, then 150, then 100.

None of the three loads needs the others, so they can all be started first and awaited together.
Add a second function above `main`.

```js file="src/main.js" action="insert-before" anchor="async function main() {"
async function together() {
  const started = Date.now();
  const results = await Promise.all([
    load("3 courses", 200),
    load("2 classes today", 150),
    load("1 announcement", 100)
  ]);
  console.log("Together:", Date.now() - started, "ms", results);
}

```

And call it from `main`, after the first one has finished.

```js file="src/main.js" action="insert-after" anchor="  await oneByOne();"
  await together();
```

`Promise.all` takes an array of promises and returns one promise that fulfills when every one of them has, with an array of their values.
All three `load` calls run while the array is being built, so all three timers start in the same millisecond.

Predict before you run: about how long does `Together` take, about 450 ms, about 200 ms, or about 100 ms?
Run it.
`Together:` prints about 200 ms, the time of the slowest load, because the three waits overlapped instead of following each other.
The values come back in the order of the array, `["3 courses","2 classes today","1 announcement"]`, even though the announcement arrived first; `Promise.all` keeps each value in its place.

Now let the announcements fail while the courses still load.

```js file="src/main.js" action="insert-before" anchor="async function main() {"
async function oneFails() {
  try {
    const results = await Promise.all([load("3 courses", 200), fail("News is down", 100)]);
    console.log("All:", results);
  } catch (error) {
    console.warn("Promise.all rejected:", error.message);
  }
}

```

```js file="src/main.js" action="insert-after" anchor="  await together();"
  await oneFails();
```

Predict before you run: does the console show `All:` with the courses, a warning that `Promise.all` rejected, or a red uncaught line?
Run it.
A warning, `Promise.all rejected: News is down`, about 100 ms after `Together`, without waiting for the courses.
`Promise.all` rejects as soon as any one promise rejects, with that promise's error, and the values of the others are lost, so a page that uses it shows nothing if any part fails.

When each part is useful on its own, ask for every outcome instead.

```js file="src/main.js" action="insert-before" anchor="async function main() {"
async function settleEach() {
  const results = await Promise.allSettled([load("3 courses", 200), fail("News is down", 100)]);
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("fulfilled:", result.value);
    } else {
      console.log("rejected:", result.reason.message);
    }
  }
}

```

```js file="src/main.js" action="insert-after" anchor="  await oneFails();"
  await settleEach();
```

Predict before you run: after about 200 ms, does `settleEach` print one line, two lines, or a warning?
Run it.
Two lines: `fulfilled: 3 courses` and `rejected: News is down`.
`Promise.allSettled` never rejects; it waits for every promise to settle and fulfills with one object per promise, `{ status: "fulfilled", value }` or `{ status: "rejected", reason }`, so the page can show the courses and a message where the announcements would be.

Choose by what the page needs.
Use `Promise.all` when the parts only make sense together, such as a total that needs every number, and catch its rejection.
Use `Promise.allSettled` when each part can stand alone, such as the panels of a dashboard.
And keep the one-by-one `await` lines for work where each step needs the result of the one before, such as shipping an order only after it is prepared.

Try the common mistake on purpose.
In `together`, write the loads as three `await` lines inside the array, `[await load("3 courses", 200), await load("2 classes today", 150), await load("1 announcement", 100)]`, and run: `Together` takes about 450 ms again, because each `await` finished before the next load started, and `Promise.all` received values that were already there.
Put the version without `await` inside the array back.

**If it breaks:** If `Together` takes about 450 ms, something in the array is awaited one at a time; the array should hold the three promises themselves.
If a red unhandled rejection appears, the `Promise.all` that includes `fail` is outside the `try`, or `await` is missing in front of it.
If `settleEach` prints `rejected: undefined`, it reads `result.reason` without `.message`, or `result.error`, which does not exist.

**Check:** Run the code.
The console shows `One by one:` at about 450 ms, `Together:` at about 200 ms with the three values in order, the warning `Promise.all rejected: News is down`, `fulfilled: 3 courses`, and `rejected: News is down`.
The checks wait for the last line, about a second after the run, before they read the console.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
function load(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fail(message, ms) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error(message)), ms));
}

async function oneByOne() {
  const started = Date.now();
  const courses = await load("3 courses", 200);
  const schedule = await load("2 classes today", 150);
  const news = await load("1 announcement", 100);
  console.log("One by one:", Date.now() - started, "ms", [courses, schedule, news]);
}

async function together() {
  const started = Date.now();
  const results = await Promise.all([
    load("3 courses", 200),
    load("2 classes today", 150),
    load("1 announcement", 100)
  ]);
  console.log("Together:", Date.now() - started, "ms", results);
}

async function oneFails() {
  try {
    const results = await Promise.all([load("3 courses", 200), fail("News is down", 100)]);
    console.log("All:", results);
  } catch (error) {
    console.warn("Promise.all rejected:", error.message);
  }
}

async function settleEach() {
  const results = await Promise.allSettled([load("3 courses", 200), fail("News is down", 100)]);
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("fulfilled:", result.value);
    } else {
      console.log("rejected:", result.reason.message);
    }
  }
}

async function main() {
  await oneByOne();
  await together();
  await oneFails();
  await settleEach();
}

main();
```

</details>
