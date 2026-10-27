---
title: Change the value, watch only that part update
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash]
  watch: [ReviewPanel]
required: [panel-updates, only-text-changed]
---

Now the same study tracker is written in React, and the value that changes lives in **state**.
Watch the inspector's **Boundaries** and **Flash** views: on a click React calls only the component whose state changed and updates only the text that differs.

```demo name="inspector-tour"
```

`src/App.jsx` holds three components: `Header` describes the heading, `ReviewPanel` describes the panel, and `App` puts the two together.
Press **Run** and look at the result with the inspector's **Boundaries** view on: each component's output has a labeled outline.
Click the button: nothing happens, because `reviewed` is a constant zero and the button has no click handler yet.

`useState` gives a component a piece of state, and it comes from the `react` package, so the file needs to import it first.
Add the import at the very top of the file; the block below shows it above the existing first line.

```jsx file="src/App.jsx" action="replace" anchor="function Header() {"
import { useState } from "react";

function Header() {
```

Next, make `reviewed` a piece of state instead of a constant.

```jsx file="src/App.jsx" action="replace" anchor="  const reviewed = 0;"
  const [reviewed, setReviewed] = useState(0);
```

`reviewed` is the current value, starting at `0`, and `setReviewed` is the function we call to ask for a new value.

Finally, give the button a click handler that asks for the next value, and switch the button off once every concept is reviewed.

```predict
After you add the handler and click with Flash on, which outline flashes?
- All three: `App`, `Header`, and `ReviewPanel`
- `App` and `ReviewPanel`, but not `Header`
= Only `ReviewPanel`
```

```jsx file="src/App.jsx" action="replace" anchor='      <button type="button">Review one concept</button>'
      <button type="button" disabled={reviewed === total} onClick={() => setReviewed(reviewed + 1)}>
        Review one concept
      </button>
```

The handler only asks for a new value; it does not touch any paragraph, and it does not call `ReviewPanel` itself.

```demo name="render-cycle"
```

Run the page, turn on the inspector's **Flash** view next to **Boundaries**, and click the button.
Then repeat the experiment from Step 2: click once, select the words in the first paragraph, and click again.

## Read more

A component is a JavaScript function whose name starts with a capital letter and that returns JSX, the HTML-like markup you see inside `return ( ... )`.
`src/main.jsx` hands `App` to React and tells it which element on the page to fill; the next topic walks through that file line by line.
`ReviewPanel` describes the panel from `reviewed`, the way `renderPanel` did in Step 2.

In Step 2 we kept the value in a `let` variable and called `renderPanel` ourselves after each change.
In React we keep a changing value in state and let React call the component again when it changes.
`useState(0)` returns two things in an array, and the square brackets unpack them into two names.
We never assign to `reviewed` directly; calling `setReviewed` is what tells React the panel needs describing again.

`onClick` takes a function, just as `addEventListener("click", ...)` did in Step 1, and React calls it when the button is clicked.
`disabled={reviewed === total}` is described from the value too, so the button turns itself off at three with no extra code in the handler.

On each click React calls `ReviewPanel` again with the new value, compares the JSX it returns with the JSX from last time, and changes only what differs on the page: the number and, at three, the message and the button.
Only the `ReviewPanel` outline flashes.
`Header` and `App` did not run again, because their state did not change.

This time the selection survives, because React changed the text inside the paragraph instead of throwing the paragraph away.
We describe the whole panel from data, as in Step 2, and the page is updated as carefully as in Step 1, without us writing those updates.

**If it breaks:** If the result pane shows `useState is not defined`, the import line is missing or misspelled at the top of `src/App.jsx`.
If the count stays at 0, check that `onClick` calls `setReviewed`, not `reviewed`, and that the old `const reviewed = 0;` line is gone.
If the editor reports an error on the button, compare the opening tag carefully: `onClick` takes `{() => setReviewed(reviewed + 1)}` in braces, not quotes.

**Check:** With **Boundaries** and **Flash** open, click **Review one concept** three times.
The count goes from 0 to 3, the message changes at 3, the button turns off, and on every click only `ReviewPanel` flashes.
Press **Run checks** to confirm.

```quiz
Why does a text selection in the first paragraph survive a click in this version?
- React disables selection changes while it renders
= React reuses the same paragraph and changes only the text inside it
- `useState` saves the selection along with the value
> React compares the new JSX with the old and updates only what differs, so the `<p>` element stays and only its number changes; `innerHTML` in Step 2 replaced the element itself.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

function Header() {
  return (
    <header>
      <h1>Study tracker</h1>
      <p>This header never changes, so React has no reason to touch it.</p>
    </header>
  );
}

function ReviewPanel() {
  const total = 3;
  const [reviewed, setReviewed] = useState(0);

  return (
    <section>
      <p>Reviewed {reviewed} of {total} concepts.</p>
      <p>{reviewed === total ? "All concepts reviewed." : "Keep going."}</p>
      <button type="button" disabled={reviewed === total} onClick={() => setReviewed(reviewed + 1)}>
        Review one concept
      </button>
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <ReviewPanel />
    </main>
  );
}
```

</details>
