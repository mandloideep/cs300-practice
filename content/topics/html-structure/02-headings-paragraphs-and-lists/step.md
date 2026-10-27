---
title: Headings, paragraphs, and lists
mode: edit
entry: index.html
required: [heading-outline, bullet-list, numbered-steps]
---

This step fills the body with the three kinds of text content every page uses: headings, paragraphs, and lists.
The rule behind all three is the same one from the lesson: a tag says **what the content is**, never how it should look.
Watch how little the result changes when only the meaning changes, such as a bulleted list becoming a numbered one.

```demo name="structure-not-style"
```

The skeleton from Step 1 is in place, and the body holds one heading and one paragraph.
Add a second paragraph under the first.

```html file="index.html" action="insert-after" anchor="    <p>Welcome to the study group.</p>"
    <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
```

Run the page: the two paragraphs sit in separate blocks, and `<strong>` marks one word as important inside the line.

Now add a section with a heading and a bulleted list.

```predict
After you add the h2 and the ul with three li items and run, what does the page show under the paragraphs?
- One line with the three meeting times run together
= A smaller heading, then three items, each on its own line with a bullet
- A smaller heading, then three items numbered 1, 2, and 3
```

```html file="index.html" action="insert-after" anchor="    <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>"
    <h2>When we meet</h2>
    <ul>
      <li>Tuesday, 4 pm, in the library</li>
      <li>Thursday, 4 pm, online</li>
      <li>Saturday, 10 am, in the lab</li>
    </ul>
```

`<h2>` names a section of the page, `<ul>` is an unordered list, and each `<li>` is one item in it.

Add one more section, this time a numbered list.

```html file="index.html" action="insert-after" anchor="    </ul>"
    <h2>How a session goes</h2>
    <ol>
      <li>Someone shares the step they are stuck on.</li>
      <li>We read the error together before changing anything.</li>
      <li>Everyone tries the fix on their own copy.</li>
    </ol>
```

`<ol>` is an ordered list, and the browser numbers the items for you, because these steps happen in order.

## Read more

`<p>` is a block element: it takes the full width and starts on a new line, which is why the two paragraphs sit in separate blocks with space between them.
`<strong>` is an inline element: it sits inside the line and marks the word as important, so a screen reader can stress it.
`<b>` would make the word bold too, but it says nothing about why, which is the difference between describing content and decorating it.

The page's one `<h1>` names the page, and each `<h2>` names a section of it.
Headings are about hierarchy, not size; if you want smaller text, CSS does that, and skipping from `<h1>` to `<h4>` leaves a hole in the outline that screen reader users navigate by.
The browser draws a bullet for each item of a `<ul>`, because the order of these meetings does not matter.

The numbered list uses the same `<li>` tag as before; only the container changes, because only the meaning changed.
Try swapping `<ol>` for `<ul>` and running: the numbers become bullets, and nothing else in the file had to change.

**If it breaks:** If a list item appears outside its list, an `</li>` or `</ul>` is missing; every item sits between the opening and closing tag of its list.
If the bullets run together on one line, the items are not wrapped in `<li>`.
If the check complains about the outline, a heading is the wrong level; the page has one `<h1>` and the sections use `<h2>`.

**Check:** Run the page.
It reads as one `<h1>`, two paragraphs, a bulleted list under one `<h2>`, and a numbered list under another.
Press **Run checks** to confirm the heading outline and both lists.

```quiz
Which element heads a smaller section inside a section that starts with an `<h2>`?
- `<h4>`, because it is smaller than `<h3>`
= `<h3>`, with CSS deciding the size
- `<p><strong>`, because it looks like a heading
> Heading levels describe the outline, so the next level down is `<h3>`; skipping to `<h4>` leaves a gap that screen reader users notice, and size is a job for CSS.
```

<details>
<summary>index.html after this step</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CS300 Study Group</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <h1>CS300 Study Group</h1>
    <p>Welcome to the study group.</p>
    <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
    <h2>When we meet</h2>
    <ul>
      <li>Tuesday, 4 pm, in the library</li>
      <li>Thursday, 4 pm, online</li>
      <li>Saturday, 10 am, in the lab</li>
    </ul>
    <h2>How a session goes</h2>
    <ol>
      <li>Someone shares the step they are stuck on.</li>
      <li>We read the error together before changing anything.</li>
      <li>Everyone tries the fix on their own copy.</li>
    </ol>
  </body>
</html>
```

</details>
