---
title: Describe the panel from a value
mode: edit
entry: app.js
required: [panel-from-value, message-at-total]
---

In Step 1 every change to the data needed its own line for every element that showed it.
Now we turn that around while staying in plain JavaScript.
We write one function that takes the value and returns the markup the panel should have for it.
Then, whenever the value changes, we call the function and put its result on the page.

The workspace already has the pieces from Step 1, rearranged a little.
The paragraphs now live inside an empty `<div id="panel">`, and the script fills the panel once with a hard-coded string.
Press **Run** and click the button: the count never moves, because that string never changes.

Replace the hard-coded line with a function that describes the panel, followed by a call that uses it.

```js file="app.js" action="replace" anchor='panel.innerHTML = "<p>Reviewed 0 of 3 concepts.</p>";'
function renderPanel(count) {
  const message = count === total ? "All concepts reviewed." : "Keep going.";
  return `<p>Reviewed ${count} of ${total} concepts.</p><p>${message}</p>`;
}

panel.innerHTML = renderPanel(reviewed);
```

`renderPanel` does not touch the page.
It takes a number and returns a string of HTML, so the same input always gives the same output.
The `message` line uses the conditional operator: when `count` equals `total` it picks the string after `?`, otherwise the string after `:`.
The last line calls the function with the current value and puts the result inside the panel, so the first view now comes from data rather than from a string we typed.

Now make every click describe the panel again from the new value.

```js file="app.js" action="insert-after" anchor="  reviewed = reviewed + 1;"
  panel.innerHTML = renderPanel(reviewed);
```

Compare this with Step 1.
The click handler no longer knows which paragraphs exist or what each one says.
It changes the value and asks for the whole panel again.
Adding a third paragraph now means changing `renderPanel` only, and no click can leave one paragraph out of date.
This is the idea React is built on: the screen is a function of the data.

There is a cost we can see.
Click once, then drag to select the words in the first paragraph, and click again.
The selection disappears, because `innerHTML` threw the old paragraphs away and built new ones from the string.
In a panel with a text field, the field would lose what you typed and lose keyboard focus the same way.
React keeps the describe-it-from-data idea and fixes this cost, which is what Step 3 shows.

**Check:** Run the page and click three times.
The first paragraph counts up to `Reviewed 3 of 3 concepts.` and the second changes from `Keep going.` to `All concepts reviewed.`
Press **Run checks** to confirm.

**If it breaks:** If the panel is empty when the page loads, the `panel.innerHTML = renderPanel(reviewed);` line after the function is missing.
If the page shows `${count}` literally, the string in `renderPanel` uses quotes instead of backticks.

<details>
<summary>app.js after this step</summary>

```js
const panel = document.querySelector("#panel");
const button = document.querySelector("#review");
const total = 3;
let reviewed = 0;

function renderPanel(count) {
  const message = count === total ? "All concepts reviewed." : "Keep going.";
  return `<p>Reviewed ${count} of ${total} concepts.</p><p>${message}</p>`;
}

panel.innerHTML = renderPanel(reviewed);

button.addEventListener("click", () => {
  if (reviewed === total) {
    return;
  }
  reviewed = reviewed + 1;
  panel.innerHTML = renderPanel(reviewed);
});
```

</details>
