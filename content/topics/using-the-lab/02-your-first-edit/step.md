---
title: Your first edit
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [heading-kept, paragraph-changed, plan-listed]
---

This step changes a page by typing two edits into the editor and running the code.
The page is a tiny React app, and you do not need to know React yet: the lesson here is the lab, not the code.
Watch the result pane after each run, because that is where an edit shows up.

The result pane already shows the starter page: a heading and one sentence.
The lab ran the starter for you when the step opened, and the status pill at the top of the result says **Ready**.
In the editor, the tab that is open is `src/App.jsx`, the file both edits change.

Each edit below is a card.
Its first line names the file, and its second line says where the code goes: which existing line it replaces, or which line it goes after or before.
Find that line in the editor, then type the code in the card.

The first edit replaces the sentence with a longer one.

```jsx file="src/App.jsx" action="replace" anchor="      <p>This page is a small React app.</p>"
      <p>This page is a small React app, and I just changed it.</p>
```

Select the whole line in the editor, from the spaces at its start to `</p>`, and type the new line over it.
Keep the six spaces of indentation at the start; the code would run without them, but every file in this course is indented so that you can see what sits inside what.

Press **Run** under the editor, or press `Ctrl+Enter` (`Cmd+Enter` on a Mac) while the cursor is in the editor.
The status pill says **Compiling**, then **Ready**, and the sentence in the result pane is the new one.

The second edit adds a short list after the sentence.

```jsx file="src/App.jsx" action="insert-after" anchor="      <p>This page is a small React app, and I just changed it.</p>"
      <ul className="plan">
        <li>Read the explanation</li>
        <li>Type the edit</li>
        <li>Run and look</li>
      </ul>
```

Put the cursor at the end of the line the card names, press Enter, and type the five lines.
The editor closes a tag for you when you type `<li>`, so watch that you do not end up with two `</li>` on one line.
Run again: the result shows a boxed list of three items, the loop you will follow in every edit step.

Predict before you look at the tab name: has the editor noticed that you changed a file?
It has: the tab of an edited file shows a dot after its name, and the editor's header says `1 file edited` instead of `Starter files`.
Your edits are kept in this browser as you type, so you can close the tab and come back to them.

**Check:** Run the code.
The result shows the heading `My first week in the lab`, the new sentence, and the three-item list.
The checks pane, the last pane on the right, lists three checks, and each one passes with a check mark.

**If it breaks:** If the result pane says **Did not compile**, read the message under it: it names the file and the line, and the most common cause is a tag that is not closed, such as `<li>` without `</li>`.
If the list is missing, the second edit went somewhere else; compare your file with the panel below.
If you want to start over, **Reset to starter** puts the original file back after asking you first.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
export default function App() {
  return (
    <main>
      <h1>My first week in the lab</h1>
      <p>This page is a small React app, and I just changed it.</p>
      <ul className="plan">
        <li>Read the explanation</li>
        <li>Type the edit</li>
        <li>Run and look</li>
      </ul>
    </main>
  );
}
```

</details>
