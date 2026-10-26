---
title: "Data down, events up"
mode: read
---

In Step 3 the state lived inside `ReviewPanel`, and that worked because `ReviewPanel` was the only component that needed it.
Real pages are rarely that tidy.
Suppose `Header` should also say how many concepts are left.
`Header` cannot read a variable that lives inside `ReviewPanel`, because each component is its own function with its own local variables.

React's answer is a rule of direction that every React app follows.
**Data flows down** from a parent component to its children.
**Events flow up** from a child to the parent that owns the data.

## Data down

We move the state up to the closest component that contains everyone who needs it.
Here that is `App`, because `App` renders both `Header` and `ReviewPanel`.

```jsx
export default function App() {
  const total = 3;
  const [reviewed, setReviewed] = useState(0);

  return (
    <main>
      <Header left={total - reviewed} />
      <ReviewPanel reviewed={reviewed} total={total} onReview={() => setReviewed(reviewed + 1)} />
    </main>
  );
}
```

`left={total - reviewed}` looks like an HTML attribute, but it passes a JavaScript value to the child.
Values passed this way are called **props**.
`Header` receives `left` and `ReviewPanel` receives `reviewed` and `total`.
Neither child owns those values; each one only describes its part of the page from what it was given.

```jsx
function Header({ left }) {
  return (
    <header>
      <h1>Study tracker</h1>
      <p>{left} concepts left.</p>
    </header>
  );
}
```

The curly braces in `function Header({ left })` unpack the `left` prop from the object React passes to every component.

## Events up

A child must not change a prop.
If `ReviewPanel` did `reviewed = reviewed + 1`, nothing would update, because `App` still holds the real value in its state.
Instead, `App` passes a function down as a prop, here named `onReview`, and the child calls it when something happens.

```jsx
function ReviewPanel({ reviewed, total, onReview }) {
  return (
    <section>
      <p>Reviewed {reviewed} of {total} concepts.</p>
      <button type="button" disabled={reviewed === total} onClick={onReview}>
        Review one concept
      </button>
    </section>
  );
}
```

Follow one click all the way around:

1. You click the button inside `ReviewPanel`.
2. React calls `onReview`, the function `App` passed down.
3. That function calls `setReviewed` in `App`, so the event has travelled up to the owner of the data.
4. React calls `App` again with the new state.
5. `App` passes the new values down as props, and React calls `Header` and `ReviewPanel` with them.
6. React compares the new JSX with the old and changes only the text that differs.

If this version were in the editor with **Flash** on, all three outlines would flash on each click, because the state now lives in `App` and `App` passes new props to both children.
That is the trade we make when we lift state up: more components re-run, and in exchange every component that shows the value always agrees with it.

## What to take from this topic

In Step 1 we changed the page by hand and had to remember every element that showed the value.
In Step 2 we described the page from a value and rebuilt it on every change.
In Step 3 React let us describe the page from state while it updated only what changed.
Here we saw how components share that state: the owner keeps it, passes values down as props, and passes functions down so that children can send events back up.

You will practice props, destructuring, and passing functions in [Components and props](#/topic/components-and-props).
Next, [Vite project anatomy](#/topic/vite-project-anatomy) sets up a real React project on your computer and shows how `index.html`, `main.jsx`, and `App.jsx` connect.

**Check:** Without looking back, explain in two sentences where the `reviewed` state should live when both `Header` and `ReviewPanel` need it, and how a click in `ReviewPanel` changes it.
If your answer names `App` as the owner and `onReview` as the way up, you have the model this topic is about.

**If it breaks:** If the six numbered steps feel abstract, go back to Step 3 and click the button with **Flash** on while reading them; steps 4 through 6 are exactly what the flash shows, with the state one level lower.
