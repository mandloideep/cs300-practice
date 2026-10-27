---
title: Use a check
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [button-kept, next-heading, next-paragraph]
---

This step starts with checks that fail, and you make them pass by reading what they ask for.
The checks pane is how the lab tells you a step is done, and its hints are written to point at the exact thing to fix.
Read the checks pane before you type anything, then again after every run.

Scroll to the checks pane, the last pane on the right.
It ran when the step opened and says **1 of 4 pass**.
Each check is one line with a mark: a check mark when it passes, a cross when it does not, and under every cross a **hint** that says what to look at.
Three of the checks carry a **required** badge, and the step is complete when every required check passes; the fourth is a stretch goal you can leave for later.

The check that already passes is `The Say hello to the console button is still there`: it is there so that an edit for this step does not quietly undo the last one.
The two required checks that fail ask for a heading and a sentence after the button.

```jsx file="src/App.jsx" action="insert-after" anchor='      <button type="button" onClick={handleClick}>Say hello to the console</button>'
      <h2>Next up</h2>
      <p>The inspector, which shows the parts of this page.</p>
```

Before you type it exactly, try the heading as `Next Up`, with a capital `U`, and run.
Predict first: will the heading check pass, fail, or pass with a warning?
It fails, and its hint quotes what it found, `Next Up`, beside what it expected; a check compares exactly, the way the computer does.
Change the `U` back to `u` and run: the heading check and the sentence check pass, and the pill at the top of the checks pane says **Step complete**.

The checks run on their own after every run.
**Run checks** under the editor runs them again without running the code again, which matters on steps where you click around in the result first and the checks read what the page shows at that moment.

The stretch goal asks for a fourth item in the plan.

```jsx file="src/App.jsx" action="insert-after" anchor="        <li>Run and look</li>"
        <li>Read the checks</li>
```

Run, and all four checks pass.
A check that is not required never stops a step from being complete, but it usually points at something worth doing.

## When you are stuck

**Show solution** opens a window with your file on one side and the finished file on the other, with the lines that differ marked.
Read the difference first; it usually shows the one character you missed.
Only **Load solution** replaces your files, and **Keep my files** closes the window with nothing changed.
Looking at the solution is allowed and expected, but type the fix yourself, so that next time you do not need to look.

**Check:** Run the code.
The page shows the button, then the heading `Next up` and the sentence about the inspector, and the plan has four items.
The checks pane says **Step complete**, and the step list at the bottom of the page marks this step as done.

**If it breaks:** If the heading check still fails after you fixed the capital letter, read its hint again: an extra space, a missing letter, or an `h3` instead of an `h2` all count as different.
If the sentence check fails, the paragraph must come right after the `h2` and mention the inspector.
If the button check fails, the edit replaced the button line instead of going after it; press **Reset to starter** and type the edit again.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
console.log("App.jsx ran once, when the page loaded.");

export default function App() {
  function handleClick() {
    console.log("The button was clicked.");
  }

  return (
    <main>
      <h1>My first week in the lab</h1>
      <p>This page is a small React app, and I just changed it.</p>
      <ul className="plan">
        <li>Read the explanation</li>
        <li>Type the edit</li>
        <li>Run and look</li>
        <li>Read the checks</li>
      </ul>
      <button type="button" onClick={handleClick}>Say hello to the console</button>
      <h2>Next up</h2>
      <p>The inspector, which shows the parts of this page.</p>
    </main>
  );
}
```

</details>
