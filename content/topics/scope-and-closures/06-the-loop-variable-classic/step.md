---
title: The loop variable classic
mode: edit
entry: index.html
required: [var-prints-three-threes, let-prints-each, reminders-for-the-roster]
---

**We used this in:** [Functions and callbacks](#/topic/functions-and-callbacks) ran a callback later with `setTimeout`, after the rest of the file.

This step puts the whole topic together in one famous puzzle: a loop that sets a timer on each pass, where each timer prints the loop counter.
With `var` the three timers print the same number, and with `let` they print three different ones.
Watch the output and then work out why, using three ideas from this topic: `var` ignores blocks, a callback runs after the file finishes, and a closure reads a variable's current value.

The starter loops three times with a `var` counter, and each pass sets a 50 millisecond timer whose callback prints `i`.

```predict
When you run the starter, what does the console show?
- `var i is 0`, `var i is 1`, `var i is 2`
- `var i is 2` three times
= `var i is 3` three times
```

Press **Run**, and the console shows `var i is 3` three times.
Here is the order of events.
The loop runs to the end first: it sets three timers, and it adds one to `i` after each pass until `i < 3` is false, which happens when `i` is `3`.
Only then, 50 milliseconds later, do the callbacks run, because a timer's callback always waits for the rest of the file, as in the last step of the previous topic.
There is a single `i`, because a `var` belongs to the whole file and not to each pass of the loop, as Step 2 showed.
All three callbacks close over that same `i`, and a closure reads the variable's value at the moment it runs, as `withCurve` did in Step 4; by then the one `i` holds `3`.

Now the same loop with `let`.

```predict
After the next edit, what do the new lines show?
- `let j is 3` three times
= `let j is 0`, `let j is 1`, `let j is 2`
```

```js file="src/main.js" action="append"

for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log("let j is", j);
  }, 100);
}
```

Run it: after the three `var` lines come `let j is 0`, `let j is 1`, and `let j is 2`.
A `let` in the head of a `for` loop is different in exactly the way that matters here: the loop creates a **new** `j` for each pass, a block-scoped variable like the ones in Step 1, and copies the current value into it.
Each callback closes over the `j` of its own pass, and nothing changes that `j` afterwards, so each one prints the value it was made with.
The timers still run after the loop has finished; what changed is how many variables there are.

Here is why the puzzle matters: the same mistake with a real array is a bug that prints wrong data instead of a wrong number.

```js file="src/main.js" action="append"

for (let index = 0; index < roster.length; index++) {
  setTimeout(() => {
    console.log(`Reminder ${index + 1} goes to ${roster[index]}.`);
  }, 150);
}
```

Run the code, and three reminders follow, `Reminder 1 goes to Alice.` through `Reminder 3 goes to Charlie.`
Each callback reads `roster[index]` with the `index` of its own pass, so each student gets their own reminder.
The delays are different, 50, 100, and 150 milliseconds, only to keep the three groups of lines apart in the console.
The checks wait for the last group before they read the console, so give them a moment after **Run**.

## Read more

Before `let` existed, programmers fixed this by wrapping the body of the loop in a function and calling it with `i`, so that each call made a new scope; you may see that pattern in old code, and you never need to write it.
Today the fix is the habit from Step 2: never write `var`, and a loop counter is a `let`.
The same reasoning will explain a React puzzle later in the course, where a handler or a timer inside a component sees an older value than you expected, because it closed over the variables of the render that created it.

Try the bug on purpose.
In the reminder loop, change `let index` to `var index` and run.
The three reminders become `Reminder 4 goes to undefined.` three times: one shared `index` ended at `3`, one past the last student, and `roster[3]` does not exist.
Change it back to `let`.

**If it breaks:** If the `let` lines also print `3` three times, the counter is declared with `var` or above the loop; `let j = 0` belongs inside the parentheses of the `for`.
If a group of lines is missing, check that the `console.log` is inside the arrow function and the delay comes after it, inside the parentheses of `setTimeout`.
If the reminders show `undefined`, the loop runs past the end of the roster, so check `index < roster.length` and `let index`.

**Check:** Run the code and wait a moment.
The console shows `var i is 3` three times, then `let j is 0`, `let j is 1`, and `let j is 2`, then the three reminders for Alice, Bob, and Charlie.
Press **Run checks** to confirm.

```quiz
Why do the three `var` callbacks all print `3`?
- The timers are too slow to catch the earlier values
= There is one shared `i`, and it is already `3` when the callbacks run
- `setTimeout` adds one to `i` before it calls the callback
> The loop finishes before any timer fires, and all three callbacks read the same `var`.
```

```quiz
What is the modern fix for this loop?
- A longer delay
- Moving the timer above the loop
= Declaring the counter with `let`
> A `let` in the head of a `for` loop makes a new variable for each pass, so each callback keeps its own value.
```

<details>
<summary>src/main.js after this step</summary>

```js
const roster = ["Alice", "Bob", "Charlie"];

for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log("var i is", i);
  }, 50);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log("let j is", j);
  }, 100);
}

for (let index = 0; index < roster.length; index++) {
  setTimeout(() => {
    console.log(`Reminder ${index + 1} goes to ${roster[index]}.`);
  }, 150);
}
```

</details>
