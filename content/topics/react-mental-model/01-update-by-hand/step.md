---
title: Update the page by hand
mode: edit
entry: app.js
required: [status-updates, remaining-updates]
---

Before we write any React, this step updates a page the way we have so far: by hand, in plain JavaScript, with no React at all.
The page shows one value, `reviewed`, in two places, and you will watch what happens when the value changes and nothing tells the page.

```predict
When you run the starter and click Review one concept three times, what does the status line say?
- `Reviewed 3 of 3 concepts.`
- `Reviewed 1 of 3 concepts.`
= `Reviewed 0 of 3 concepts.`
```

The number lives in one variable, `reviewed`, and it is shown in the status line and in the line that says how many are left.
Press **Run**, then click **Review one concept** a few times, and read the console beside the page.

Open `app.js` and find the click handler.
After the line that adds one to `reviewed`, tell the status line its new text.

```js file="app.js" action="insert-after" anchor="  reviewed = reviewed + 1;"
  statusLine.textContent = `Reviewed ${reviewed} of ${total} concepts.`;
```

Run the page and click again: the status line now counts up, but the line below it still says `3 concepts left.`
Add the second update right after the first one, just above the `console.log` line.

```js file="app.js" action="insert-before" anchor='  console.log("reviewed is now", reviewed);'
  remainingLine.textContent = `${total - reviewed} concepts left.`;
```

Now both paragraphs agree with the data, because we touched every element that shows it.

React starts from the other end: we write one description of what the page should look like for a given value, and React makes the page match it.
Here is the same status line written that way, so you can hold the two side by side; we build it for real in Step 3.

```jsx
<p>Reviewed {reviewed} of {total} concepts.</p>
<p>{total - reviewed} concepts left.</p>
```

## Read more

This workspace is plain HTML, CSS, and JavaScript, the same kind of page we built for CourseHub in Week 8.

In the starter the console prints `reviewed is now 1`, then `2`, then `3`, but the page still says `Reviewed 0 of 3 concepts.`
The data changed and the page did not, because nothing told the page to change.
In plain JavaScript that job is ours: every time the data changes, we find each element that shows it and update it by hand.

`statusLine` is the element we selected at the top of the file with `document.querySelector("#status")`.
Setting `textContent` replaces the text inside that one paragraph.
The template literal builds the sentence from the current values of `reviewed` and `total`.

After the first edit we updated one place that shows the value and forgot the other; that is the cost of updating by hand.
Look at what we had to know to fix it: which elements show the value, what each one should say, and that every one of them must be touched on every change.
A page with ten values shown in thirty places needs thirty of these lines, and missing one is a bug that only appears after a click.

**If it breaks:** If nothing on the page changes, the new lines are probably outside the click handler; they must sit between `reviewed = reviewed + 1;` and the closing `});`.
If the console shows `statusLine is not defined`, check the spelling against the `const statusLine` line at the top of the file.

**Check:** Run the page and click **Review one concept**.
Both paragraphs change on every click, they always add up to three, and the console still prints the new value each time.
Press **Run checks** to confirm.

```quiz
In this plain JavaScript page, what makes a paragraph change after `reviewed` changes?
- The browser notices that the variable changed and redraws the page
= A line of ours that sets the `textContent` of that paragraph
- The `console.log` line, which prints the value to the page
> Plain JavaScript keeps no link between a variable and the elements that show it, so every element must be updated by a line we write, on every change.
```

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
