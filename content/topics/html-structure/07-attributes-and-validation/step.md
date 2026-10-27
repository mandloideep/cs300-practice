---
title: Attributes, nesting, and validation
mode: read
---

Six steps built one page.
Before the CSS topic starts styling it, here is what we leaned on in every step, written down in one place.

## Attributes

An attribute is a name and a value inside an opening tag: `name="value"`.
The value is always in quotes, attributes are separated by spaces, and they never appear in a closing tag.

| Attribute | On | Says |
| --- | --- | --- |
| `lang` | `<html>` | The language of the page |
| `charset`, `name`, `content` | `<meta>` | Settings about the page |
| `href` | `<a>`, `<link>` | Where a link or a stylesheet is |
| `src`, `alt`, `width`, `height` | `<img>` | Where the picture is, what it shows, and how much room to keep for it |
| `id` | any element | A name that is unique on the page: a jump target, a label's `for`, a hook for JavaScript |
| `class` | any element | A name shared by any number of elements, for CSS to select |
| `for` | `<label>` | The `id` of the field the label belongs to |
| `name`, `type`, `value`, `required` | form fields | What the field is called when sent, what kind of input it takes, what it holds, and whether it may be empty |

`id` and `class` are the two you will write most from here on.
An `id` is unique: one element per page.
A `class` is reusable: write `class="card"` on ten elements and one CSS rule styles all ten.
The lesson's rule of thumb is classes for styling and ids for anchors and JavaScript.

Some attributes are boolean: `required`, `disabled`, `checked`.
Their presence is the whole value, so `required` is complete on its own, and `required="false"` still means required.

In CSS and in JavaScript the names get a prefix: `.card` means "elements with the class card" and `#join` means "the element whose id is join".
In the HTML itself there is no prefix; `class=".card"` is the classic mistake, and it matches nothing.

## Nesting

Elements nest, and the tree the browser builds is what you see in the DOM view.
Two rules keep the file and the tree in agreement.

Close elements in the reverse order you opened them.
`<p><strong>text</strong></p>` is right, and `<p><strong>text</p></strong>` is wrong, even though both have every tag.

Put block elements inside block elements, and inline elements inside anything.
A `<p>` cannot hold a `<ul>`, an `<h2>` cannot hold a `<p>`, and an `<a>` can hold text and a `<strong>` but not a `<section>`.

The browser never refuses a file.
When the tags do not add up it closes elements where it has to and carries on, so a missing `</section>` shows up as a footer nested inside the main content, not as an error message.
That is why we check with tools instead of trusting the page looks right.

## Three ways to check a page

**The DOM view** in this lab, and the **Elements** panel in your browser's DevTools (F12), show the tree the browser built.
When the tree does not match the file, the file has a nesting mistake, and the first branch that sits in the wrong place is next to it.

**The checks** in this lab read the tree too: they ask the questions a screen reader would ask.
Does every field have a label?
Is there one `<main>`?
Does every image have `alt` text?

**The W3C validator** at validator.w3.org reads a file or a URL and lists every rule it breaks, with a line number.
Run it on every page you hand in; a page with no errors there has no nesting mistakes and no unknown attributes.

## Semantic HTML, in one sentence

Choose the element that says what the content is, and leave how it looks to CSS.
`<h2>` because it is a section heading, not because the text should be big; `<strong>` because the word matters, not because it should be bold; `<nav>` because those are the page's links, not a `<div>` with a class that says so; `<button>` because it does something when pressed, which a `<div>` never will.
Every tool downstream, from screen readers to search engines to the CSS you write next week, reads the meaning first.

## What comes next

The page is complete and completely unstyled.
The CSS topic takes this same kind of page and adds a stylesheet to it, starting with how the browser decides which of two conflicting rules wins.

**Check:** Open any page you like in your browser, press F12, and find the Elements panel.
Find its `<main>`, count its `<h1>` elements, and look at one `<img>` for an `alt` attribute.
Most pages fail at least one of these, and now you can tell.

**If it breaks:** If a page of your own looks right but the validator lists errors, fix them from the top; one unclosed tag near the top often explains ten errors below it.
