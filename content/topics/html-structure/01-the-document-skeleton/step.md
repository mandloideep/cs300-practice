---
title: The document skeleton
mode: edit
entry: index.html
required: [lang-on-html, head-describes-the-page, body-has-a-heading]
---

Every web page you have ever opened is an HTML document, and every HTML document has the same skeleton.
In Week 3 we wrote it by hand for the first time, and this topic does the same, one piece at a time, in a workspace that runs the page as you type.

Press **Run** and look at the result pane.
It shows the words `Welcome to the study group.` and nothing else, because that is all the body contains.
Open `index.html` in the editor and read it top to bottom before changing anything.

- `<!doctype html>` is the first line and tells the browser this is an HTML5 document; it is a declaration, not a tag.
- `<html>` is the root element; everything else sits inside it.
- `<head>` holds information about the page that is not drawn on the page: the title, links to stylesheets, and `<meta>` settings.
- `<body>` holds everything the reader sees.

Most elements come as a pair: an opening tag such as `<body>`, some content, and a closing tag with a slash such as `</body>`.
The tag, the content, and the closing tag together are one **element**.

The root element is missing one thing: the language of the page.
Screen readers use it to choose a voice, and browsers use it to offer translation, so every page we write says which language it is in.

```html file="index.html" action="replace" anchor="<html>"
<html lang="en">
```

`lang="en"` is an **attribute**: a name, an equals sign, and a value in quotes, written inside the opening tag.
Attributes add information to an element without becoming part of its content.

Now fill in the head.
Three lines belong in every page we write this semester, and they go before the stylesheet link.

```html file="index.html" action="insert-after" anchor="  <head>"
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CS300 Study Group</title>
```

The first `<meta>` tells the browser how to read the characters in the file, so that an accented letter or an emoji is not turned into junk.
The second tells a phone to show the page at the phone's own width instead of pretending to be a desktop; without it, every page looks tiny on a phone, and the responsive layouts in the CSS topic cannot work.
`<title>` is the text in the browser tab and in a bookmark; the result pane has no tab, so you will not see it, but the check reads it.
`<meta>` is a **void element**: it has no content and no closing tag, which is why the line ends with `/>`.
Browsers accept `<meta charset="UTF-8">` without the slash too; we write the slash because our tools format it that way.

The body still holds bare text.
Text that is not inside an element has no meaning the browser can use, so replace it with a heading and a paragraph.

```html file="index.html" action="replace" anchor="    Welcome to the study group."
    <h1>CS300 Study Group</h1>
    <p>Welcome to the study group.</p>
```

`<h1>` is the main heading of the page, and a page has exactly one.
`<p>` is a paragraph.
The browser adds space above and below each of them, and a screen reader can jump straight to the heading, which plain text never allowed.

**Check:** Run the page.
The result shows a large heading over one paragraph.
Press **Run checks** to confirm that the root element carries `lang`, the head has the title and both `<meta>` lines, and the body has a heading.

**If it breaks:** If the result pane is blank, a tag is probably unclosed; the browser does not report HTML mistakes, it guesses, so compare the file with the panel below.
If the check says the title is missing, the `<title>` line is inside `<body>` instead of `<head>`; only the head describes the page.
If the heading looks like plain text, check for `<h1>` without its closing `</h1>`.

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
  </body>
</html>
```

</details>
