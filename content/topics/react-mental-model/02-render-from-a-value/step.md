---
title: Describe the panel from a value
mode: edit
entry: app.js
required: [panel-from-value, message-at-total]
---

This step turns Step 1 around while staying in plain JavaScript: one function takes the value and returns the markup the panel should have for it.
Watch the click handler shrink to two lines, and watch what happens to a text selection when the panel is rebuilt.

```predict
After you replace the hard-coded line with `renderPanel` and run, what does the panel show before any click?
- Only `Reviewed 0 of 3 concepts.`, as in the starter
- `Reviewed ${count} of ${total} concepts.`, with the dollar signs
= `Reviewed 0 of 3 concepts.` and, under it, `Keep going.`
```

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

`renderPanel` does not touch the page: it takes a number and returns a string of HTML, and the last line puts that string inside the panel.

Now make every click describe the panel again from the new value.

```js file="app.js" action="insert-after" anchor="  reviewed = reviewed + 1;"
  panel.innerHTML = renderPanel(reviewed);
```

Run, click once, drag to select the words in the first paragraph, and click again.

## Read more

In Step 1 every change to the data needed its own line for every element that showed it.
Here we write the description once, and whenever the value changes, we call the function and put its result on the page.

`renderPanel` returns the same output for the same input every time.
The `message` line uses the conditional operator: when `count` equals `total` it picks the string after `?`, otherwise the string after `:`.
The call after the function uses the current value, so the first view now comes from data rather than from a string we typed.

Compare the finished click handler with Step 1.
It no longer knows which paragraphs exist or what each one says.
It changes the value and asks for the whole panel again.
Adding a third paragraph now means changing `renderPanel` only, and no click can leave one paragraph out of date.
This is the idea React is built on: the screen is a function of the data.

There is a cost we can see.
The selection disappears on the second click, because `innerHTML` threw the old paragraphs away and built new ones from the string.
In a panel with a text field, the field would lose what you typed and lose keyboard focus the same way.
React keeps the describe-it-from-data idea and fixes this cost, which is what Step 3 shows.

**If it breaks:** If the panel is empty when the page loads, the `panel.innerHTML = renderPanel(reviewed);` line after the function is missing.
If the page shows `${count}` literally, the string in `renderPanel` uses quotes instead of backticks.

**Check:** Run the page and click three times.
The first paragraph counts up to `Reviewed 3 of 3 concepts.` and the second changes from `Keep going.` to `All concepts reviewed.`
Press **Run checks** to confirm.

```quiz
Why does a text selection in the panel disappear on the next click?
- `renderPanel` clears the selection on purpose
= `innerHTML` throws the old paragraphs away and builds new ones from the string
- The button takes the focus and the selection with it
> The selection belonged to the old paragraph elements; once `innerHTML` replaces them, the new paragraphs have the same words but are different elements.
```

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
