---
title: The browser needs type module
mode: edit
entry: index.html
required: [script-in-head, rows-render, still-a-module]
---

Every `import` so far has worked because of one attribute in `index.html`: `type="module"` on the `<script>` tag that loads `src/main.js`.
This step removes the attribute on purpose so you can read what the browser says without it, and then moves the tag into the `<head>`, where a module script still works.
Watch the result pane and the top of the console.

Press **Run**.
The page shows the five curved rows, and the console shows five lines from `students.js ran` to `main.js ran`.

Open `index.html`.
The script tag is the last line inside `<body>`, after the list it fills.
Remove the attribute first: change the tag to `<script src="/src/main.js"></script>`, with no `type`.
Predict before you run: do the rows render as before, does the page stay unrendered with an empty console, or does the console show an error about the `import` statement?
Run the code.
The page says `The gradebook has not rendered yet.`, and the console shows one red line with an **uncaught** badge: `SyntaxError: Cannot use import statement outside a module`, pointing at `src/main.js:1`.
Without `type="module"`, the browser loads the file as a **classic script**, the older kind, and in a classic script `import` is not a statement at all; the browser cannot even read the file, so not one line of it runs.
Put ` type="module"` back in the tag and run again; the rows return.

Now move the tag.
Delete it from the end of `<body>`.

```html file="index.html" action="delete" anchor='    <script type="module" src="/src/main.js"></script>'
```

Put the same tag in the `<head>`, under the stylesheet link.

```html file="index.html" action="insert-after" anchor='    <link rel="stylesheet" href="/styles.css" />'
    <script type="module" src="/src/main.js"></script>
```

Predict before you run: the script now comes before the `<ul id="grades">` that it fills.
Does the page show the five rows, the page with no rows and no error, or an error because `#grades` does not exist yet?
Run the code.
The five rows render exactly as before.
A module script never runs where the browser meets it: the browser downloads it and its imports while it keeps reading the HTML, and runs it only after the whole document has been built, so `#grades` is there by the time `main.js` looks for it.
This is called being **deferred**, and every module script is deferred without you asking.

Keep the attribute from here on.
If you remove it again now that the tag is in the `<head>`, the page stays unrendered and the lab's console stays empty, because a classic script in the `<head>` runs before the lab's console starts listening; the browser's own console, opened with F12, still shows the `SyntaxError`.

The two kinds of script differ in more than `import`.
A classic script runs the moment the browser reaches its tag, unless it has `defer`, so a classic script in the `<head>` would find no `#grades` at all.
Its top-level variables are shared with every other classic script on the page, which is how two scripts written by two people could break each other by both declaring a `count`.
A module script is deferred, keeps its top-level names to itself unless it exports them, runs once however many files import it, and may use `import` and `export`.
The browser asks you to opt in with `type="module"` so that the millions of older pages written as classic scripts keep working.

In [Application architecture](#/topic/app-architecture) CourseHub loaded `app.js` with `type="module"` for the same reason, and a Vite project's `index.html` does too.
On your own computer, a page whose scripts are modules has to be served by a local server such as Live Server; opened straight from a folder, with an address that starts with `file://`, Chrome refuses to load module files at all.

**If it breaks:** If the console shows `Cannot use import statement outside a module`, the tag is missing `type="module"`; it is spelled with a lowercase `m` and in quotes.
If the result pane says it cannot find the script, the `src` changed while you moved the tag; it is `/src/main.js`.
If the rows appear twice, the old tag is still at the end of `<body>`.

**Check:** Run the code.
The tag sits in the `<head>` with `type="module"`, the five curved rows render, and the console has no red lines.
Press **Run checks** to confirm.

<details>
<summary>index.html after this step</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CS300 gradebook</title>
    <link rel="stylesheet" href="/styles.css" />
    <script type="module" src="/src/main.js"></script>
  </head>
  <body>
    <main>
      <h1>CS300 gradebook</h1>
      <p id="summary">The gradebook has not rendered yet.</p>
      <ul id="grades"></ul>
    </main>
  </body>
</html>
```

</details>
