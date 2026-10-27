---
title: Breakpoints in DevTools
mode: edit
entry: index.html
required: [alice-average, bob-average, no-nan]
links:
  - kind: reading
    title: "MDN: JavaScript debugging and error handling"
    url: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript
---

Some bugs raise no error at all: the code runs to the end and prints the wrong value.
This step finds one by **pausing** the code in the middle of a loop with a `debugger` statement and watching the variables change one pass at a time in the browser's DevTools.
Watch the value of `total` on each pause, and notice the pass where it stops being a number.

**We used this in:** [JavaScript basics](#/topic/javascript-basics) traced a loop by hand, in a table with one row per pass; DevTools fills in that table for you from the real code.

Press **Run** and the console shows `Alice: NaN` and `Bob: NaN`, with no red line.
`NaN` means "not a number": somewhere a calculation got a value that is not a number, and every calculation after it is `NaN` too.
You could add a `console.log` on every line, but a breakpoint shows every variable at once, without changing what the code prints.

First, open DevTools on the result.
In Chrome or Edge, right-click inside the result pane, on the sentence it shows, and choose **Inspect**; on a Mac you can also press Command, Option, and I together, and on Windows or Linux F12 or Control, Shift, and I.
DevTools opens beside or below the page.
Right-clicking the result is the useful habit, because the lab runs your code inside a frame of its own, and **Inspect** points DevTools at that frame rather than at the lab around it.
Leave DevTools open for the rest of this step.

Now add a `debugger` statement inside the loop, after the line that adds to `total`.

```predict
What does a `debugger;` line do when DevTools is closed?
- It pauses the code anyway, until you open DevTools
= Nothing at all
- It throws a `SyntaxError`
```

```js file="src/main.js" action="insert-after" anchor="    total += scores[i];"
    debugger;
```

`debugger;` is a breakpoint written in the code: when DevTools is open, the browser stops on that line and shows you everything; when DevTools is closed, the line does nothing at all.

Run the code with DevTools open.
DevTools switches to its **Sources** panel and highlights the `debugger` line, and a **Paused in debugger** bar appears over the page.
The tab at the top of the code has a long random name instead of `main.js`, because the lab gives your files a temporary address for each run, but the code in it is your `src/main.js`.
On the right, the **Scope** section lists the variables of `average` at this moment: `scores` is `[95, 88, 92]`, `i` is `0`, and `total` is `95`.
You can also hover over a variable in the code to see its value.

Press the **Resume** button, the triangle at the top of the right-hand side, or F8.
The loop runs one more pass and stops on the same line again: `i` is `1` and `total` is `183`.

```predict
On which pause does `total` stop being a number?
- The third
= The fourth
- Never, because the bug is somewhere else
```

Press **Resume** twice more and read `total` each time.
On the third pause `i` is `2` and `total` is `275`, all three scores added.
On the fourth pause `i` is `3` and `total` is `NaN`.
`scores` has three items, at indexes `0`, `1`, and `2`, so `scores[3]` is `undefined`, and `275 + undefined` is `NaN`.
The loop ran one pass too many, because its test is `i <= scores.length`.

Press **Resume** until the code finishes; Bob's scores pause four more times, or you can press the **Deactivate breakpoints** button, the arrow with a line through it, and then **Resume** once.
While the code is paused, the whole lab page is frozen, including the editor, which is normal; it comes back the moment the code runs on.

Fix the test so the loop stops after the last index.

```js file="src/main.js" action="replace" anchor="  for (let i = 0; i <= scores.length; i++) {"
  for (let i = 0; i < scores.length; i++) {
```

Run once more with DevTools open, and the fourth pause never comes: the loop stops after `i` is `2`.
Then remove the `debugger` line, because a breakpoint left in the code pauses the next person who opens DevTools.

```js file="src/main.js" action="delete" anchor="    debugger;"
```

Run it, and the console shows `Alice: 91.7` and `Bob: 74.0`.

## Read more

The `debugger` statement is the fastest way into the Sources panel in the lab, because it finds your file for you.
Once DevTools is paused in your file, you can also click a line number in the code to set a breakpoint there without typing anything, and click it again to remove it; right-click a line number and choose **Add conditional breakpoint** to stop only when an expression such as `i === 3` is true, which skips straight to the pass you care about.
The buttons beside **Resume** step through the code: **Step over** (F10) runs the current line and stops on the next one, and **Step into** (F11) follows a function call inside.

While paused, the **Console** tab of DevTools runs in the paused function, so typing `scores[i]` there shows its value at that moment.
That console is also where `console.table`, `console.group`, `console.count`, and `console.time` from the last step print; try `console.table(students)` there once the code has finished.
DevTools also shows the full stack trace of an uncaught error, with each frame a link, while the lab's console pane shows the first frame only.

Reach for a breakpoint when a value is wrong and you do not know where it goes wrong, and for a `console.log` when you already know which value to watch.

**If it breaks:** If the code does not pause, DevTools was closed when you pressed **Run**, or it is open on the lab page rather than on the result; open it with **Inspect** on the result and run again.
If the page stays frozen, the code is still paused: switch to DevTools and press **Resume**, or deactivate breakpoints.
If the console still shows `NaN`, the loop test still reads `<=`.

**Check:** Run the code.
The console shows `Alice: 91.7` and `Bob: 74.0`, and nothing prints `NaN`.
Press **Run checks** to confirm.

```quiz
A loop over a three-item array has the test `i <= scores.length`; what is the last value of `i` inside the loop?
- `2`
= `3`
- `4`
> The test lets `i` reach `scores.length`, one past the last index, so `scores[3]` is `undefined` and the total becomes `NaN`.
```

<details>
<summary>src/main.js after this step</summary>

```js
const students = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: [73, 80, 69] }
];

function average(scores) {
  let total = 0;
  for (let i = 0; i < scores.length; i++) {
    total += scores[i];
  }
  return total / scores.length;
}

for (const student of students) {
  console.log(`${student.name}: ${average(student.scores).toFixed(1)}`);
}
```

</details>
