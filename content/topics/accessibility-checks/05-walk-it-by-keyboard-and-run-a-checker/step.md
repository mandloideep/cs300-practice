---
title: Walk it by keyboard and run a checker
mode: read
---

The four fixes in this topic are the problems that keep appearing in student projects, and two kinds of check find them: a walk through the page with the keyboard alone, and an automated checker such as Lighthouse.
Neither is enough alone, because a checker cannot tell whether the focus went somewhere sensible, and a keyboard walk does not measure contrast.
This step is the routine to run on your Capstone and the record to keep of it.

```quiz
Which of these can an automated checker find on its own?
= A form field with no label
- Focus left on the old link after a route change
- Link text that is accurate but confusing
> A checker reads the page at one moment, so it finds missing names, contrast, and skipped headings; whether focus moved and whether words make sense need a person.
```

## The keyboard walk

Put the mouse aside, click the address bar, and press **Tab** to move into the page.

| Key | What should happen |
| --- | --- |
| **Tab** and **Shift+Tab** | Every link, field, and button is reached, in the order they appear, and nothing else is |
| Each stop | A focus ring you can see, on every background, in light and dark mode |
| **Enter** on a link | The new page, with focus on its heading, as Step 2 made it |
| **Enter** or **Space** on a button | The action, with the result announced or focused, such as an error message after a failed submit |
| Arrow keys in a `select` | The options change without opening a new page |
| **Escape** in a dialog or menu | It closes, and focus returns to the control that opened it |

A stop with no ring, a control **Tab** never reaches, or a place the focus cannot leave is a failure, whatever a checker says.

## The automated check

Open your Capstone's preview or deployed address in Chrome, open DevTools, choose the **Lighthouse** panel, tick only **Accessibility**, choose **Navigation** mode, and press **Analyze page load**.
Lighthouse runs axe, the same engine this site's own tests run on every kind of page, and lists each failed rule with the elements it found.
Run it on each route, not only the home page, because each page has its own form, list, and headings.

The free **axe DevTools** browser extension runs the same rules from its own DevTools panel and can scan the page again after you open a menu or show an error, which a page-load report cannot see.

## Three widths

In DevTools, turn on the device toolbar with **Ctrl+Shift+M** or **Cmd+Shift+M** and look at each page at 375, 768, and 1280 pixels wide.
Nothing should be cut off or need sideways scrolling, and the focus ring should stay visible when the layout changes.
That is the Capstone's eighth verification case, and the keyboard walk is its seventh.

## Read more

### What a checker reports, and what it means

| Rule | Usually means |
| --- | --- |
| Form elements must have labels | A field with only a placeholder, as in Step 1 |
| Heading levels should only increase by one | An `h3` right after an `h1`, as in Step 3 |
| Links must have discernible text | An image link with no `alt`, as in Step 4 |
| Elements must meet minimum color contrast | Gray text on a light background, often a placeholder or a muted note |
| Document should have one main landmark | A layout with no `main`, or one `main` per component |

Fix the cause, run the checker again, and keep the before and after; the Capstone's release-candidate change can be exactly that.

### Your record

For the Capstone's verification cases, write down the page, the key or the tool, what you expected, and what you saw, and keep a screenshot of the Lighthouse result for at least one route.
A score of 100 is not the goal; the goal is no failed rule you have not read and either fixed or explained.

**Check:** You can name the keys of the keyboard walk and what each should do, run Lighthouse's accessibility audit on one page, and say which of the four problems in this topic a checker finds and which need the walk.
Then press **Mark this step as read**.

```quiz
Lighthouse reports no accessibility failures on your Capstone's home page. What does that tell you about the detail page?
- It passes too, because the pages share a stylesheet
= Nothing; each route has its own content, so run the audit on it as well
- It passes, because Lighthouse checks every route it can find
> An audit checks the one page it loaded, in the state it was in; every route, and every state such as an error, is a separate check.
```

```quiz
On the keyboard walk, focus reaches a button but no ring appears. What is the most likely cause?
- The button has no `aria-label`
= A stylesheet removed the outline, as `outline: none` does, with nothing in its place
- The button is not inside a `form`
> The browser draws a ring by default; it disappears when a rule removes the outline, and the fix is a `:focus-visible` style you can see.
```
