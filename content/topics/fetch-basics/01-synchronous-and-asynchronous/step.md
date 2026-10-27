---
title: Synchronous and asynchronous
mode: edit
entry: index.html
inspector:
  views: []
required: [order-is-a-c-e-b-d, status-written-twice]
---

**We used this in:** [DOM and events](#/topic/dom-events) registered a click handler and saw that it runs later, when the event happens.

By default JavaScript runs **synchronously**: one line at a time, in order, and each line finishes before the next one starts.
Run the starter and the console shows `A`, `B`, `C`, in the order of the lines.
That is fine while every line is fast.
A request to a server takes anywhere from fifty milliseconds to several seconds, and if JavaScript stopped at that line to wait, the whole page would freeze: no scrolling, no clicks, no typing, until the answer came back.

So the browser does the slow work elsewhere and calls a function of ours back when it is done, the way it called our click handler back in Week 6.
`setTimeout` is the simplest way to see this.
It asks the browser to run a function after a delay, and it returns immediately.
Wrap the second log in a timer with a delay of zero.

```js file="app.js" action="replace" anchor='console.log("B");'
setTimeout(() => {
  console.log("B");
}, 0);
```

Run it.
The order is now `A`, `C`, `B`, even though the delay is zero.
A zero delay does not mean "now"; it means "as soon as the script is finished".
The timer's callback waits in a queue, and nothing in that queue runs until every synchronous line has finished.

Add a second timer with a real delay, and one more synchronous log after it.

```js file="app.js" action="insert-after" anchor='console.log("C");'
setTimeout(() => {
  console.log("D");
  status.textContent = "The one second timer finished, long after the script.";
}, 1000);
console.log("E");
```

Before running, predict the order.
Then run and read the console: `A`, `C`, `E`, `B`, `D`.
All five synchronous letters and both registrations happen first, then the queue is checked, then `B` runs, and a second later `D` runs.
This is the Week 7 trace exercise, and the rule it teaches is the one that explains every network request in this course: **synchronous code runs to the end first, then the callbacks run in the order their work finished**.

Make the status line say what the script knows at the moment it finishes.

```js file="app.js" action="replace" anchor='status.textContent = "The script finished.";'
status.textContent = "The script finished. Both timers are still waiting.";
```

Watch the page after a run.
It shows that sentence first, and a second later the `D` callback replaces it.
Nothing was frozen in between; the page was simply waiting, and a user could have clicked or typed.
That is the difference between synchronous and asynchronous: the slow work happens later, and the page stays responsive meanwhile.

**Check:** Run the code and read the console from the top: `A`, `C`, `E`, `B`, `D`.
The status line changes once when the script ends and again after a second.
Press **Run checks**.

**If it breaks:** If `B` prints before `C`, the `console.log("B")` call is outside the arrow function, so it runs synchronously.
If `D` never prints, the delay is written as `1000` milliseconds inside the parentheses after the function, not before it.
If the status line never changes a second time, the assignment is outside the `D` callback.

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");

console.log("A");
setTimeout(() => {
  console.log("B");
}, 0);
console.log("C");
setTimeout(() => {
  console.log("D");
  status.textContent = "The one second timer finished, long after the script.";
}, 1000);
console.log("E");
status.textContent = "The script finished. Both timers are still waiting.";
```

</details>
