---
title: Update the page by hand
mode: edit
entry: app.js
required: [status-updates, remaining-updates]
---

Before we write any React, we look at how we have been updating pages so far.
This workspace is plain HTML, CSS, and JavaScript, the same kind of page we built for CourseHub in Week 8.
There is no React here at all.

The page tracks how many of three concepts you have reviewed.
The number lives in one variable, `reviewed`, and it is shown in two places: the status line and the line that says how many are left.

Press **Run**, then click **Review one concept** a few times.
The console prints `reviewed is now 1`, then `2`, then `3`, but the page still says `Reviewed 0 of 3 concepts.`
The data changed and the page did not, because nothing told the page to change.
In plain JavaScript that job is ours: every time the data changes, we find each element that shows it and update it by hand.

Open `app.js` and find the click handler.
After the line that adds one to `reviewed`, tell the status line its new text.

```js file="app.js" action="insert-after" anchor="  reviewed = reviewed + 1;"
  statusLine.textContent = `Reviewed ${reviewed} of ${total} concepts.`;
```

`statusLine` is the element we selected at the top of the file with `document.querySelector("#status")`.
Setting `textContent` replaces the text inside that one paragraph.
The template literal builds the sentence from the current values of `reviewed` and `total`.

Run the page and click again.
The status line now counts up, but the line below it still says `3 concepts left.`
That is the cost of updating by hand: we updated one place that shows the value and forgot the other.
Add the second update right after the first one, just above the `console.log` line.

```js file="app.js" action="insert-before" anchor='  console.log("reviewed is now", reviewed);'
  remainingLine.textContent = `${total - reviewed} concepts left.`;
```

Now both paragraphs agree with the data.
Look at what we had to know to get there: which elements show the value, what each one should say, and that every one of them must be touched on every change.
A page with ten values shown in thirty places needs thirty of these lines, and missing one is a bug that only appears after a click.

React starts from the other end.
Instead of writing the steps that change the page, we write one description of what the page should look like for a given value, and React makes the page match it.
Here is the same status line written that way, so you can hold the two side by side; we build it for real in Step 3.

```jsx
<p>Reviewed {reviewed} of {total} concepts.</p>
<p>{total - reviewed} concepts left.</p>
```

**Check:** Run the page and click **Review one concept**.
Both paragraphs change on every click, they always add up to three, and the console still prints the new value each time.
Press **Run checks** to confirm.

**If it breaks:** If nothing on the page changes, the new lines are probably outside the click handler; they must sit between `reviewed = reviewed + 1;` and the closing `});`.
If the console shows `statusLine is not defined`, check the spelling against the `const statusLine` line at the top of the file.

<details>
<summary>app.js after this step</summary>

```js
const statusLine = document.querySelector("#status");
const remainingLine = document.querySelector("#remaining");
const button = document.querySelector("#review");
const total = 3;
let reviewed = 0;

button.addEventListener("click", () => {
  if (reviewed === total) {
    return;
  }
  reviewed = reviewed + 1;
  statusLine.textContent = `Reviewed ${reviewed} of ${total} concepts.`;
  remainingLine.textContent = `${total - reviewed} concepts left.`;
  console.log("reviewed is now", reviewed);
});
```

</details>
