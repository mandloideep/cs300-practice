---
title: Change text and classes
mode: edit
entry: index.html
inspector:
  views: [dom]
required: [status-text, first-item-done, counts-the-done-items]
---

Selecting an element gives us an object, and this step changes two of its properties: `textContent`, the text inside it, and `classList`, the classes our CSS styles.
Watch the status line and the first project in the result pane after each run.

```predict
After you replace the console log with the `textContent` line and run, what does the status line show?
- `Loading projects...`, because the HTML text always wins
- `Loading projects... 3 projects on the page.`
= `3 projects on the page.`
```

The workspace starts where Step 1 ended, without the misspelled line.
The status line still says `Loading projects...`, because the HTML put that text there and nothing has replaced it.
Replace the console log with a line that writes the count onto the page.

```js file="app.js" action="replace" anchor='console.log(projects.length, "projects on the page");'
status.textContent = `${projects.length} projects on the page.`;
```

Setting `textContent` throws away whatever was inside the paragraph and puts the new string there as plain text.

Now mark the first project as finished.
In the stylesheet, `.done .title` draws a line through the title, so finishing a project is a matter of adding one class to its `li`.

```js file="app.js" action="append"

projects[0].classList.add("done");
console.log("first project classes:", projects[0].className);
```

`classList.add` puts `done` beside any classes the element already has, and the log shows the full class attribute, which is now `done`.

The class we just added is a real attribute on a real node, so a selector can find it.
Count the finished projects and say so in the status line.

```js file="app.js" action="append"

const finished = document.querySelectorAll("#project-list li.done");
status.textContent = `${finished.length} of ${projects.length} projects done.`;
```

The second `textContent` assignment replaces the first, so the page ends up with the sentence we wrote last.

## Read more

### Plain text, safely

`textContent` treats the string as plain text, so even if it contained `<b>`, the page would show the angle brackets rather than bold text.
That is what makes it safe for anything a user typed, and it is why we use it instead of `innerHTML` for text.

### The `classList` methods

`projects[0]` is the first item of the NodeList from Step 1.
`classList.add` adds a class, `classList.remove` takes one away, `classList.toggle` flips it, and `classList.contains` asks whether it is there.
We never assign to `className` to change one class, because that overwrites every class on the element.

### Updating a page by hand

That is the whole model of updating a page by hand: change the data, then find every element that shows it and set it again.
The React mental model topic starts from exactly this point.

**If it breaks:** If the status line still says `Loading projects...`, the assignment is to a different variable than `status`, or the script stopped on an earlier error; read the console.
If no project is struck through, the class name in `classList.add` does not match `.done` in `styles.css`.
If the count of finished projects is `0`, the `li.done` selector ran before the class was added; order matters in a script that runs top to bottom.

**Check:** Run the code.
The status line reads `1 of 3 projects done.`, the first project is struck through, and the console shows `first project classes: done`.
Press **Run checks**.

```quiz
Which line takes the `done` class off an item and keeps every other class it has?
- `item.className = ""`
= `item.classList.remove("done")`
- `item.textContent = ""`
> `classList.remove` takes away one class and leaves the rest; assigning to `className` replaces the whole class attribute, and `textContent` changes the text, not the classes.
```

<details>
<summary>app.js after this step</summary>

```js
const status = document.querySelector("#status");
const projects = document.querySelectorAll("#project-list li");
status.textContent = `${projects.length} projects on the page.`;

projects[0].classList.add("done");
console.log("first project classes:", projects[0].className);

const finished = document.querySelectorAll("#project-list li.done");
status.textContent = `${finished.length} of ${projects.length} projects done.`;
```

</details>
