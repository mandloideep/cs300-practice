---
title: Links and images with alt text
mode: edit
entry: index.html
required: [external-link, image-with-alt, page-anchor]
---

This step adds the two elements that point somewhere: `<a>` for links and `<img>` for images.
Both depend entirely on their attributes, so watch which attribute carries the address and which carries the words a reader sees or hears.

```demo name="alt-text"
```

Start with a link to another site.
Add a third paragraph after the one that welcomes everyone.

```html file="index.html" action="insert-after" anchor="    <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>"
    <p>Bring your questions and the <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">MDN learning pages</a>.</p>
```

`href` is the address the link points at, and the text between the tags is what the reader clicks.

Now an image.
Put it right under the main heading.

```html file="index.html" action="insert-after" anchor="    <h1>CS300 Study Group</h1>"
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 4'%3E%3Crect width='6' height='4' rx='0.4' fill='%23dbe7f3'/%3E%3Ccircle cx='3' cy='2' r='1.2' fill='%23003da5'/%3E%3C/svg%3E" alt="The study group logo: a blue circle on a light blue square" width="120" height="80" />
```

`src` says where the picture is, and `alt` is the text that stands in for it when it cannot be seen.

The last kind of link points to a place on the same page.
It needs two halves: an `id` on the element to jump to, and a link whose `href` is `#` followed by that id.
Give the meetings heading an id first.

```html file="index.html" action="replace" anchor="    <h2>When we meet</h2>"
    <h2 id="meetings">When we meet</h2>
```

Then add the link, just above the welcome paragraph, so that it sits under the image.

```predict
After you add the link and run, what happens when you click Jump to the meeting times?
- A new tab opens on a page called meetings
= The result scrolls so the When we meet heading is at the top
- Nothing, because an id only matters to CSS
```

```html file="index.html" action="insert-before" anchor="    <p>Welcome to the study group.</p>"
    <p><a href="#meetings">Jump to the meeting times</a></p>
```

Run the page and click the link: an `id` is unique on the page, which makes it a safe target.

## Read more

A page that only talks to itself is a document; a page that points somewhere is the web.
That is why Step 1 introduced attributes before anything else: `<a>` and `<img>` are almost nothing without them.

`<a>` is the anchor element.
The address is in the attribute, not in the content.
This `href` starts with `https://`, so it is an **external link** to another site.
A link to a page of your own site is written as a path instead, such as `href="about.html"`, and the browser looks for that file next to the current one.

`<img>` is a void element with two attributes that are never optional.
In a project folder `src` is a path to a file beside `index.html`, such as `images/logo.svg`; this site keeps no image files, so this `src` carries the picture itself as a **data URL**, and the browser treats it exactly as it would treat a file.
`alt` is read aloud by a screen reader, shown by the browser when the file fails to load, and indexed by a search engine.
Write what the picture shows, not the word "image".
`width` and `height` tell the browser how much room to reserve before the picture arrives, so the text below does not jump when it loads.

The jump link scrolls so that the heading with `id="meetings"` is at the top of the result.
There is exactly one place called `meetings`, so the browser never has to guess which element you meant.

**If it breaks:** If the link shows the address instead of the words, the `href` is written between the tags instead of inside the opening tag.
If the image area is empty with a small icon, the `src` value is broken; copy the line again.
If the jump link does nothing, the `id` on the heading and the part after `#` in the link do not match exactly, including capital letters.

**Check:** Run the page.
The logo sits under the heading, the jump link scrolls to the meetings, and the MDN link opens another site.
Press **Run checks** to confirm the external link, the image with its `alt`, and the page anchor.

```quiz
Which alt text is right for the study group logo?
- `alt="image"`
- `alt="logo.svg"`
= `alt="The study group logo: a blue circle on a light blue square"`
> The alt text replaces the picture for anyone who cannot see it, so it says what the picture shows; the word image and the file name tell a listener nothing.
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
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 4'%3E%3Crect width='6' height='4' rx='0.4' fill='%23dbe7f3'/%3E%3Ccircle cx='3' cy='2' r='1.2' fill='%23003da5'/%3E%3C/svg%3E" alt="The study group logo: a blue circle on a light blue square" width="120" height="80" />
    <p><a href="#meetings">Jump to the meeting times</a></p>
    <p>Welcome to the study group.</p>
    <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
    <p>Bring your questions and the <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">MDN learning pages</a>.</p>
    <h2 id="meetings">When we meet</h2>
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
