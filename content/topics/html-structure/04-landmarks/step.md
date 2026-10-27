---
title: Landmarks instead of divs
mode: edit
entry: index.html
inspector:
  views: []
required: [four-landmarks, three-sections, no-wrapper-divs]
---

The page has grown, so someone grouped its parts with `<div>` elements: a top block, a content block with three groups inside, and a bottom block.
Press **Run** and open the inspector's **DOM** view.
It draws the tree of elements the browser built from the file, and every branch reads `div`.
A screen reader sees the same thing: boxes with no names, so it cannot offer "skip to the main content" or "go to the navigation".

`<div>` is a generic block container with no meaning of its own.
HTML5 added **landmark** elements that mean something: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>`.
They look exactly like `<div>` until a stylesheet says otherwise, so the only reason to use them is that they describe the page, which is the whole job of HTML.
This step swaps each `<div>` for the landmark that says what it is, and the DOM view shows the tree gaining names.

Start at the top.
The first block introduces the page, so it is a `<header>`.

```html file="index.html" action="replace" anchor='    <div class="top">'
    <header>
```

The group of links inside it is the page's navigation.

```html file="index.html" action="replace" anchor='      <div class="links">'
      <nav>
```

Opening tags changed, so their closing tags change too, or the tree the browser builds will not match the file.
The two closing `</div>` lines that end the links and the top block become `</nav>` and `</header>`, and the block that follows is the page's main content.

```html file="index.html" action="replace" anchor='      </div>\n    </div>\n    <div class="content">'
      </nav>
    </header>
    <main>
```

Run the page.
The stylesheet already has rules for `header` and `nav`, so the top of the page gains a border and the links spread out; the rules did nothing while there were no such elements.
In the DOM view the tree now reads `header`, `nav`, and `main`.

Inside the main content, each group has a heading and the content that belongs to it, which is what `<section>` is for.
Change the three groups one at a time.

```html file="index.html" action="replace" anchor='      <div id="about">'
      <section id="about">
```

```html file="index.html" action="replace" anchor='      </div>\n      <div id="meetings">'
      </section>
      <section id="meetings">
```

```html file="index.html" action="replace" anchor='      </div>\n      <div id="sessions">'
      </section>
      <section id="sessions">
```

The `id` attributes stay where they were: the jump links in the navigation point at them, and an id works on any element.
Now close the last section and the main content, and name the bottom block.

```html file="index.html" action="replace" anchor='      </div>\n    </div>\n    <div class="bottom">'
      </section>
    </main>
    <footer>
```

```html file="index.html" action="replace" anchor="    </div>\n  </body>"
    </footer>
  </body>
```

A page has exactly one `<main>`, because it is the one part a reader came for; `<header>` and `<footer>` can appear once for the page and again inside an `<article>` or `<section>` that has its own.
Hover a row in the DOM view and the result pane outlines that element, so you can match each branch of the tree with the box it draws.

**Check:** Run the page.
It looks the same as before except for the header and footer borders, and the DOM view shows `header`, `nav`, `main` with three `section` branches, and `footer`, with no `div` anywhere.
Press **Run checks** to confirm.

**If it breaks:** If the result pane shows the page but the tree in the DOM view nests the footer inside the main content, a closing tag was changed to the wrong name; the browser closes elements for you when it has to, and it guesses badly.
If a jump link stops working, an `id` was lost while changing a tag.
If the check still finds a `div`, search the file for `div` and replace the pair it belongs to.

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
    <header>
      <h1>CS300 Study Group</h1>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 4'%3E%3Crect width='6' height='4' rx='0.4' fill='%23dbe7f3'/%3E%3Ccircle cx='3' cy='2' r='1.2' fill='%23003da5'/%3E%3C/svg%3E" alt="The study group logo: a blue circle on a light blue square" width="120" height="80" />
      <nav>
        <a href="#about">About</a>
        <a href="#meetings">Meeting times</a>
        <a href="#sessions">How a session goes</a>
      </nav>
    </header>
    <main>
      <section id="about">
        <h2>About the group</h2>
        <p>Welcome to the study group.</p>
        <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
        <p>Bring your questions and the <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">MDN learning pages</a>.</p>
      </section>
      <section id="meetings">
        <h2>When we meet</h2>
        <ul>
          <li>Tuesday, 4 pm, in the library</li>
          <li>Thursday, 4 pm, online</li>
          <li>Saturday, 10 am, in the lab</li>
        </ul>
      </section>
      <section id="sessions">
        <h2>How a session goes</h2>
        <ol>
          <li>Someone shares the step they are stuck on.</li>
          <li>We read the error together before changing anything.</li>
          <li>Everyone tries the fix on their own copy.</li>
        </ol>
      </section>
    </main>
    <footer>
      <p>Run by students, for students.</p>
    </footer>
  </body>
</html>
```

</details>
