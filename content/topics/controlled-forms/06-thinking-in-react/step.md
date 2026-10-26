---
title: "Thinking in React, on the product page"
mode: read
---

The React documentation has a short essay called "Thinking in React" that describes how to design an app before writing it.
Its five steps are the plan we have been following since Week 10 without naming it, and now that you have props, state, callback props, and controlled forms, you can read it as four questions.
Here they are, asked of the product page we built in [Lists and keys](#/topic/lists-and-keys): a category select, a checkbox that pretends the load failed, a top-rated row, and the full list.

## 1. What are the pieces?

Draw a box around every part of the page that does one job, and give it a name.

- `App` holds the heading, the controls, and the two lists.
- `ProductList` turns an array into a list, or shows a message when the array is empty.
- `ProductCard` shows one product.

Each box becomes a component, and a box that appears twice, like `ProductList`, becomes one component used twice.
That is the first of the five official steps, break the UI into a component hierarchy.

## 2. What changes over time?

Build the page with fixed data first, which is the second official step, and then ask of every value on the page whether it changes while the page is open.

| Value | Changes? | Stored how |
| --- | --- | --- |
| The six products | No | A constant |
| The chosen category | Yes, when the shopper picks one | State |
| Whether the load "failed" | Yes, when the checkbox is toggled | State |
| The visible products | Yes, but only because the category changed | Computed during render |
| The top-rated products | Yes, but only because the visible products changed | Computed during render |
| The error message | Yes, but only because `failed` changed | Computed during render |

This is the third official step, find the minimal state.
Only two values earn a `useState`.
Everything else is computed from them with `filter` and a ternary, the way `titleTooShort` was computed from `title` in Step 2.
A value that is computed cannot disagree with the value it came from, which is why we never store it.

## 3. Who owns it?

For each piece of state, find every component that reads it or changes it, and put the state in the closest component that contains them all.

- `category` is set by the select in `App` and read by both `ProductList`s, so it lives in `App`.
- `failed` is set by the checkbox and read by the error branch, both in `App`, so it lives in `App`.

This is the fourth official step, identify where the state should live.
In [Events and lifting state](#/topic/events-and-lifting-state) we moved `category` up from `CategoryFilter` to `App` for exactly this reason: a value two components need lives in the parent they share.

## 4. How does it change?

Every change is an event in some component that ends in a setter in the owner.

- The select's `onChange` calls `setCategory` with `event.target.value`.
- The checkbox's `onChange` calls `setFailed` with `event.target.checked`.

When the component with the event is not the owner, the owner passes a function down, the `onSelect` and `onAdd` props of the last topic, and the child calls it.
This is the fifth official step, add inverse data flow, and it is the "actions up" half of the rule.

## The four questions, in one table

| Question | Official step | What you write |
| --- | --- | --- |
| What are the pieces? | 1. Break the UI into components | One function per box |
| What changes over time? | 2. Build a static version, then 3. find the minimal state | `useState` for each value that changes and cannot be computed |
| Who owns it? | 4. Identify where state lives | The state line in the closest shared parent |
| How does it change? | 5. Add inverse data flow | Handlers in the owner, `on` props to the children |

## Try it on the form

Ask the four questions of the `AddProductForm` you built in this topic.
The pieces are the form and the three fields.
The values that change are the three fields, kept in one object, and the two rules are computed from it.
The form owns `fields`, because only the form reads and changes them, while `items` lives in `App`, because the list reads it and the form changes it.
The change is `handleChange` for every keystroke and `handleSubmit` for the submit, which calls `onAdd` to reach the owner of `items`.

## What comes next

Everything so far happened inside the page: state in, JSX out.
Next week's first topic, Effects, is about the moments a component has to reach outside: to the console, to `localStorage`, to a timer, or to the browser window.

**Check:** Take the Week 8 CourseHub, or any page you have built this term, and answer the four questions for it on paper.
If every value on the page is either a constant, a piece of state with one owner, or something computed from state, the design is done.

**If it breaks:** If you find a value that two components each keep their own copy of, that is the signal to move it up, and the Step 2 and Step 3 traces of the last topic show what the move looks like.
