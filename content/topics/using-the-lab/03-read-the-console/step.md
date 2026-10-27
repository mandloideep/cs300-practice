---
title: Read the console
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [load-message-once, click-message, button-renders]
---

This step makes the page print to the console, once when it loads and once for every click of a new button.
Then it breaks the code on purpose, so that you see what an error looks like before you meet one by accident.
Watch the console pane, under the result, after every run and every click.

```predict
After the first edit below, how many times does one run print `App.jsx ran once, when the page loaded.`?
- Twice, once for each file the page loads
= Once
- Once more on every run, so the lines pile up
```

The console pane says **Empty** at the moment, because the code prints nothing.
`console.log` prints whatever you give it to the console, and it is the tool you will reach for first whenever you want to know what your code is doing.

The first edit goes above the component, as the first lines of the file.

```jsx file="src/App.jsx" action="insert-before" anchor="export default function App() {"
console.log("App.jsx ran once, when the page loaded.");

```

The card ends with an empty line, so type the line and then press Enter once more to leave a blank line above `export`.

Run the code, and read the console: one line, with a **log** badge beside it.
Run again: still one line, because **Run** clears the console and starts the page from scratch, and the file runs once each time.

Next, a function that prints when it is called, placed as the first lines inside `App`.

```jsx file="src/App.jsx" action="insert-after" anchor="export default function App() {"
  function handleClick() {
    console.log("The button was clicked.");
  }

```

Nothing calls `handleClick` yet, so this edit changes nothing you can see.
The last edit adds a button under the list that calls it when it is clicked.

```jsx file="src/App.jsx" action="insert-after" anchor="      </ul>"
      <button type="button" onClick={handleClick}>Say hello to the console</button>
```

Run the code and read the console before you touch anything: `The button was clicked.` is already there once.
The checks did that: after every run they press the button once to see what it does, and they read the console the same way you do.
Now click **Say hello to the console** three times, and the console shows the message three more times, in the order the clicks happened.
## Break it on purpose

An error message has three parts, and the picture below takes one apart; step through it before you cause your own.

```demo name="error-decoder"
```

In the handler, change `console.log` to `consol.log`, with the `e` missing, and run the code.
The page looks exactly the same, because the misspelling is inside a function that runs only when the button is clicked.
The checks click it, though, so a red line appears at the top of the console with an **uncaught** badge: `ReferenceError: consol is not defined`.
Click the button yourself and the console shows the same error again, once for each click, and the click check now fails with a hint.

Read it in two parts.
`ReferenceError` is the kind of problem: the code used a name that does not exist.
`consol is not defined` names the exact word that is wrong.
Under the message, a link such as `src/App.jsx:5` names the file and the line; click it, and the editor jumps to that line with the cursor on it.

Put the `e` back, run, and click once more to see the message return.

## Read more

Every error you meet this semester has the shape you just read, a kind and a message and a place, and the console is where you read it.
Errors always sit at the top of the console pane, above the log lines, so a console with no red line at the top has none.
The **Clear** button at the top of the console pane empties it without running the code again, which helps when you want to see only what the next click prints.

**If it breaks:** If the load message appears twice in one run, the first edit was typed twice; there should be one `console.log` above `export`.
If clicking prints nothing, check that the button says `onClick={handleClick}` with a capital `C` in both places and no parentheses after `handleClick`.
If the console still shows `consol is not defined`, the misspelling is still in the file; the link under the error takes you to it.

**Check:** Run the code and click the button once.
The console shows `App.jsx ran once, when the page loaded.` once and `The button was clicked.` twice, once from the checks and once from you, with no red lines.

```quiz
The console shows `ReferenceError: totl is not defined` with the link `src/App.jsx:9`; what is wrong?
- Line 9 is missing a semicolon
= Line 9 uses the name `totl`, which nothing declared, probably a misspelling of `total`
- The file `App.jsx` could not be found
> A ReferenceError means a name that does not exist, the message names it, and the link names the line, so you know what to fix and where.
```

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
      </ul>
      <button type="button" onClick={handleClick}>Say hello to the console</button>
    </main>
  );
}
```

</details>
