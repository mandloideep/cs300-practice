---
title: "Data down, actions up"
mode: read
---

Every change in this topic followed one rule, and the flow view drew it for us on every click.
Here it is in words, so that you can carry it to the next app; click in the explainer first and watch the data go down and the event come up.

```demo name="props-flow"
```

## The rule

**Data flows down.**
A parent passes values to its children as props.
A child reads them and describes its part of the page; it never changes them.

**Actions flow up.**
A parent passes a function down as a prop.
The child calls that function when something happens, with whatever the parent needs to know, such as the chosen category id or the new product object.
The function belongs to the parent, so it can call the parent's setter.

| Direction | What travels | How |
| --- | --- | --- |
| Down | Data, as values | The parent writes `category={category}` on the child's tag |
| Up | Actions, as calls | The child calls `onSelect("beauty")`, a function the parent passed in |

## One click, traced

Here is the Step 3 trace again, with the code that produced each row.

1. The shopper clicks a button in `CategoryFilter`, and React runs the arrow function in its `onClick`.
2. That arrow function calls `onSelect(option.id)`, which is `handleSelect` from `App`, received as a prop.
3. `handleSelect` calls `setCategory("beauty")`, so the state in `App` changes.
4. React re-renders `App`, which passes the new `category` to `CategoryFilter` and `ProductList`, and both describe themselves again from the new value.

Nothing in the child ever reached into the parent.
It only called a function it was given.

## Why the parent owns the state

If `CategoryFilter` kept the category to itself, as it did in Step 1, `ProductList` could never see it, because data does not flow sideways or upward.
Putting the state in `App`, the closest component that contains everyone who needs it, lets `App` do three things: show the value, pass it to any child that needs it, and decide how it changes.

```predict
A new `SearchBox` inside `ProductList` must narrow the list, and nothing else on the page reads the search text; where should that text live?
- In `App`, because state always lives at the top
= In `ProductList`, the closest component that contains everyone who needs it
- In every `ProductCard`, so each card can decide whether to show itself
```

The rule for where state lives follows from that.

- A value only one component needs stays in that component, like `quantity` in a `ProductCard` in the last topic.
- A value two components need moves up to the closest parent they share.
- A value most of the app needs moves up to `App`, or later in the course to a context.

## Read more

### What lifting costs

Moving state up costs something: more components re-render on each change, which the Step 3 and Step 4 traces showed as a longer render set.
In exchange, every component that shows the value always agrees with it, which is the bug we could never quite fix in the Week 8 CourseHub when several parts of the page each kept their own copy.

### Naming

The parent's function is `handleSomething`; the prop it travels in is `onSomething`.
`handleSelect` and `onSelect`, `handleAdd` and `onAdd`.
Reading a child's parameter list, the `on` prefix tells you which props are callbacks before you read a line of its body.

### The three mistakes to look for first

1. The child calls `setCategory`, which it does not have; it should call the `on` prop it was given.
2. The parent passes the function with parentheses, `onSelect={handleSelect()}`, which calls it during render; pass `handleSelect` itself.
3. The handler changes the array in place with `push` and React sees no change; build a new array with `[...items, product]`.

### What comes next

The form in Step 4 read its fields from the DOM when it was submitted.
The next session makes the form fields themselves React state, so that the page can react to every keystroke: a **controlled form**, where the value flows down into the input and every change flows back up through `onChange`.
It is the same rule once more, applied one level lower.

**If it breaks:** If the two directions blur together, open Step 3 again, press a category with the **Flow** view open, and match each row of the trace to one line of code; the trace is the rule in motion.

**Check:** Draw the component tree for Step 4 on paper, mark where `items` lives, and draw one arrow for the data going down to `ProductList` and one for the action coming up from `AddProductForm`.
If both arrows meet at `App`, you have the pattern.

```quiz
A child needs to change a value that its parent owns; what does the child do?
- Assigns the new value to the prop it received
- Calls the parent's setter, which it can reach because the parent rendered it
= Calls a function the parent passed down as a prop, with what the parent needs to know
> Data goes down as props, and actions come up as calls to functions the parent passed in; only the parent's own function can call the parent's setter.
```
