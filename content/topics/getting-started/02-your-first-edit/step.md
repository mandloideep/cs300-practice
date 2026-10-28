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
The page is a tiny React app, and you do not need to know React yet: the lesson here is the site, not the code.
Watch the result pane after each run, because that is where an edit shows up.

```demo name="edit-run-loop"
```

The result pane already shows the starter page: a heading and one sentence.
The site ran the starter for you when the step opened, and the status pill at the top of the result says **Ready**.
In the editor, the file that is open is `src/App.jsx`, the file both edits change; the tree beside the code shows it selected inside the `src` folder.

Each edit below is a card.
Its first line names the file, and its second line says where the code goes: which existing line it replaces, or which line it goes after or before.
Find that line in the editor, then type the code in the card.

```predict
You type the first edit below and do not press Run yet; what does the result pane show?
= The old sentence, because the page changes only when you run
- The new sentence, as soon as you finish typing
- A red error, until the line is complete
```

The first edit replaces the sentence with a longer one.

```jsx file="src/App.jsx" action="replace" anchor="      <p>This page is a small React app.</p>"
      <p>This page is a small React app, and I just changed it.</p>
```

Select the whole line in the editor, from the spaces at its start to `</p>`, and type the new line over it.
Look at the result: it still shows the old sentence, because the result is the last run, not the file you are typing.

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
Run again: the result shows a boxed list of three items, the loop you will follow in every edit step.

## Read more

Keep the indentation at the start of each line; the code would run without it, but every file in this course is indented so that you can see what sits inside what.
The editor closes a tag for you when you type `<li>`, so watch that you do not end up with two `</li>` on one line.

The editor notices what you changed: an edited file shows a dot after its name in the tree, and the editor's header says `1 file edited` instead of `Starter files`.
Your edits are kept in this browser as you type, so you can close the tab and come back to them.

**If it breaks:** If the result pane says **Did not compile**, read the message under it: it names the file and the line, and the most common cause is a tag that is not closed, such as `<li>` without `</li>`.
If the list is missing, the second edit went somewhere else; compare your file with the panel at the end of this step.
If you want to start over, **Reset to starter** puts the original file back after asking you first.

**Check:** Run the code.
The result shows the heading `My first week in CS300`, the new sentence, and the three-item list.
The checks pane, the last pane on the right, lists three checks, and each one passes with a check mark.

```quiz
You closed the browser tab halfway through a step; what happens to your edits?
- They are lost, and the step starts from the starter
= They come back, because the site keeps them in this browser as you type
- They come back only if you pressed Run before closing
> CS300 Practice saves every edited file in this browser as you type, so the step opens with your files, run or not.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
export default function App() {
  return (
    <main>
      <h1>My first week in CS300</h1>
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
