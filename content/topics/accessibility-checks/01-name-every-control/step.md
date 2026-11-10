---
title: Give every control a name
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [ProductsPage]
required: [search-has-a-label, category-has-a-label, label-moves-focus]
---

**We used this in:** [HTML structure](#/topic/html-structure/5), where every field in a form got a `label` whose `for` matched the field's `id`.

A screen reader announces a form control by its **accessible name**, and for an `input` or a `select` that name comes from its `label`.
The Products page has a search box and a category menu with no label at all, only a placeholder that disappears as soon as you type.
Step through the picture, then press **Products** in the result and tab to the two controls: a screen reader would call them "search, edit text" and "combo box", with nothing to say what either one is for.

```demo name="label-for"
{ "label": "Search", "id": "search", "for": "none" }
```

## Label the search box

In React the `for` attribute is written `htmlFor`, because `for` is a keyword in JavaScript.
Replace the search input with a field that holds a label and the input, tied together by `htmlFor` and `id`.

```jsx file="src/App.jsx" action="replace" anchor='        <input\n          type="search"\n          placeholder="Search products"\n          value={query}\n          onChange={handleSearch}\n        />'
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={handleSearch}
          />
        </div>
```

The placeholder is gone: a hint that vanishes on the first keystroke is not a name, and its gray text is usually too faint to read.

## Label the category menu

Do the same for the `select`.

```jsx file="src/App.jsx" action="replace" anchor='        <select value={category} onChange={(event) => setCategory(event.target.value)}>\n          <option value="all">All categories</option>\n          <option value="beauty">Beauty</option>\n          <option value="fragrances">Fragrances</option>\n        </select>'
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All categories</option>
            <option value="beauty">Beauty</option>
            <option value="fragrances">Fragrances</option>
          </select>
        </div>
```

Run the code, press **Products**, and click the word **Search**: the cursor moves into the box, because the label and the box are now one control with a larger target.

## Read more

### Where an accessible name comes from

The browser computes one name for every control, in this order: `aria-labelledby`, then `aria-label`, then a `label` tied by `for` and `id` or wrapped around the control, and only as a last resort the `title` or the `placeholder`.
A visible `label` is the right answer for a form field, because sighted users, screen reader users, and voice control users then all use the same words; someone who says "click Search" needs the word on the screen.
`aria-label` is for a control with no visible text, such as an icon button, where it gives a name that nothing on the screen shows.

### Wrapping instead of htmlFor

`<label>Search <input type="search" /></label>` ties the two together without an `id`, and [URL state](#/topic/url-state/1) used that form.
Both are correct; `htmlFor` and `id` keep working when a layout puts the label and the field in different containers, and an `id` must be unique on the page, so a component rendered twice needs a different one each time.

### React and the label

React passes `htmlFor` to the DOM as `for`, and `className` as `class`, for the same reason: they are JavaScript property names.
Writing `for` in JSX logs a warning in the console that asks for `htmlFor`; [JSX rules](#/topic/jsx-rules) lists the renamed attributes.

**If it breaks:** If clicking **Search** does not move the cursor into the box, `htmlFor` and `id` differ; compare them letter by letter.
If the console warns `Invalid DOM property 'for'`, write `htmlFor`.
If the select still has no name in the checks, its `label` names `search` instead of `category`.

**Check:** Run the code, press **Products**, and click each label: the cursor moves to its control.
Then press **Run checks**.

```quiz
Which of these gives the search box a name that a screen reader announces and that stays on the screen while the shopper types?
- `placeholder="Search products"`
= `<label htmlFor="search">Search</label>` with `id="search"` on the input
- A paragraph that says Search just above the box
> A placeholder disappears on the first keystroke and is only a last-resort name, and a nearby paragraph is not tied to the box at all; a label is both visible and part of the accessible name.
```
