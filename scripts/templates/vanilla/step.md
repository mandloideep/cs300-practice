---
title: {{stepTitle}}
mode: edit
entry: index.html
---

Open `src/main.js`.
Say in two or three sentences what the student sees now and what this step changes.
Keep one sentence per line, and never use the em dash character.

Create a paragraph and add it to `<main>`.

```js file="src/main.js" action="append"

const paragraph = document.createElement("p");
paragraph.textContent = "This paragraph came from the first edit block of this step.";
main.append(paragraph);
```

Explain beside the edit what it does and why the student types it rather than pastes it.
An `append` edit adds its lines at the end of the file, and the blank first line of the fence is added too; the other actions place the code relative to an anchor, which is a complete line of the file as it stands at that point in the step.

**Check:** Run the code.
The paragraph appears below the heading.
Press **Run checks** to confirm.

**If it breaks:** If the paragraph is missing, check the console for an error naming `main`; the first line of the file must still select it.

<details>
<summary>src/main.js after this step</summary>

```js
const main = document.querySelector("main");

const paragraph = document.createElement("p");
paragraph.textContent = "This paragraph came from the first edit block of this step.";
main.append(paragraph);
```

</details>
