---
title: The parentheses mistake
mode: edit
entry: index.html
required: [passes-the-function, reference-and-result, wrapped-with-an-argument]
---

`remindToStretch` and `remindToStretch()` look almost the same, and they mean different things: the first is the function, and the second runs it right now and stands for whatever it returned.
This step starts with the mistake already in the code, the most common one people make with callbacks, so that you can see what it does and fix it.
Then it shows the fix for the case that seems to need parentheses: a callback that has to pass an argument.

The starter has a study reminder and `runTwice`, a function that calls the task it is given two times.
The call on the second-to-last line hands it `remindToStretch()`, with parentheses.

Predict before you run: does the console show `Time to stretch.` twice, once followed by an error, or not at all?

Press **Run**.
The console shows `Before runTwice.`, then `Time to stretch.` once, then a red line at the top with an **uncaught** badge: `TypeError: task is not a function`.
`After runTwice.` never prints, because the error stopped the file at the line that threw.

Read the line `runTwice(remindToStretch());` the way JavaScript does: arguments are worked out before the call they belong to.
So `remindToStretch()` runs first, right there, and prints `Time to stretch.` once.
It has no `return`, so its value is `undefined`, and `undefined` is what `runTwice` receives as `task`.
Inside `runTwice`, `task()` tries to call `undefined`, and that is the `TypeError`.

Remove the parentheses after `remindToStretch`, and keep the pair that belongs to `runTwice`.

```js file="src/main.js" action="replace" anchor="runTwice(remindToStretch());"
runTwice(remindToStretch);
```

Run it: `Before runTwice.`, `Time to stretch.` twice, and `After runTwice.`, with no red line.
Now `runTwice` receives the function itself and calls it when it decides to, which here is twice.

The same difference shows when you store the two forms in variables.

Predict before you run: after the next edit, how many more times does `Time to stretch.` print, zero, one, or two?

```js file="src/main.js" action="append"

const reminder = remindToStretch;
const result = remindToStretch();
console.log("reminder holds:", reminder);
console.log("result holds:", result);
```

Run the code, and `Time to stretch.` prints exactly once more, from the second line.
`reminder holds: [Function remindToStretch]`: the variable holds the function, which has not run.
`result holds: undefined`: the parentheses ran the function on the spot, and the variable holds what it returned.

So what if the callback needs an argument?
`runTwice(remind("Drink some water."))` would make the same mistake, because the parentheses that pass the message also call `remind` right away.
The fix is to wrap the call in a small function of its own.

```js file="src/main.js" action="append"

function remind(message) {
  console.log(`Reminder: ${message}`);
}

runTwice(() => remind("Drink some water."));
```

`() => remind("Drink some water.")` is an arrow function with no parameters whose body is the call.
Writing it does not run `remind`; it makes a new function that will, when someone calls it.
`runTwice` calls that wrapper twice, and each time the wrapper calls `remind` with the message, so the console shows `Reminder: Drink some water.` two times.

Here is the rule in one line: when you hand over a function, write its name without parentheses, or wrap the call in `() => ...` when it needs arguments.
You will meet this mistake again in two places that look different and are the same.
In the DOM topic, `button.addEventListener("click", save())` runs `save` once while the page loads and never on a click.
In React, `onClick={removeItem(id)}` runs during every render instead of on the click, and `onClick={() => removeItem(id)}` is the fix, the same wrapper you just wrote.

One more to try on purpose.
Change the last line to `runTwice(remind("Drink some water."));` and run.
The console shows the reminder once and then `TypeError: task is not a function`, the exact error from the start of the step, because `remind` ran at once and returned `undefined`.
Put the wrapper back.

**If it breaks:** If you still see `TypeError: task is not a function`, look for a pair of parentheses directly after a function name inside another call's parentheses.
If `After runTwice.` is missing, the file stopped at an error; the red line at the top of the console names it, and its link takes you to the line.
If the water reminder prints once, the wrapper is missing: the argument to `runTwice` should start with `() =>`.

**Check:** Run the code.
The console shows `Time to stretch.` twice between `Before runTwice.` and `After runTwice.`, once more after it, the two `holds:` lines, and `Reminder: Drink some water.` twice, with no red line.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
function remindToStretch() {
  console.log("Time to stretch.");
}

function runTwice(task) {
  task();
  task();
}

console.log("Before runTwice.");
runTwice(remindToStretch);
console.log("After runTwice.");

const reminder = remindToStretch;
const result = remindToStretch();
console.log("reminder holds:", reminder);
console.log("result holds:", result);

function remind(message) {
  console.log(`Reminder: ${message}`);
}

runTwice(() => remind("Drink some water."));
```

</details>
