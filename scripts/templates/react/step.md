---
title: {{stepTitle}}
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
---

Open `src/App.jsx`.
Say in two or three sentences what the student sees now and what this step changes.
Keep one sentence per line, and never use the em dash character.

Add a paragraph below the heading, inside `<main>`.

```jsx file="src/App.jsx" action="insert-before" anchor="    </main>"
      <p>This paragraph came from the first edit block of this step.</p>
```

Explain beside the edit what it does and why the student types it rather than pastes it.
The anchor is a complete line of the file as it stands at that point in the step, matched exactly, including its indentation.

**Check:** Run the code.
The paragraph appears below the heading.
Press **Run checks** to confirm.

**If it breaks:** If the paragraph is missing, make sure it sits inside `<main>`, before the closing tag.
If the result pane shows an error, the JSX has an unclosed tag; every `<p>` needs its `</p>`.

<details>
<summary>src/App.jsx after this step</summary>

```jsx
export default function App() {
  return (
    <main>
      <h1>{{title}}</h1>
      <p>This paragraph came from the first edit block of this step.</p>
    </main>
  );
}
```

</details>
