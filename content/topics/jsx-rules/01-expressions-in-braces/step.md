---
title: Expressions in braces
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App]
required: [count-from-data, joined-list]
---

**We used this in:** [Vite project anatomy](#/topic/vite-project-anatomy) showed that `App.jsx` returns the JSX that appears inside `#root`.

This topic starts from the starter app of our Week 10 Session 1 example, and this step makes its page read its numbers and names from data.
JSX is JavaScript underneath, so any JavaScript **expression** inside a pair of curly braces shows its value on the page.
Watch for the variable names: after each edit they should turn into values, never appear as text.

```demo name="jsx-to-calls"
```

Press **Run** and read the result: the second paragraph admits that two concepts should render from data, but only one hard-coded sentence is on the page.
Over five steps we make it honest, one JSX rule at a time.

`App` already has one value, `const course = "CS300";`.
Add a second value under it: an array with the names of our two concepts.

```jsx file="src/App.jsx" action="insert-after" anchor='  const course = "CS300";'
  const topics = ["JSX expressions", "Root rendering"];
```

These two lines are ordinary JavaScript inside the component function, before the `return`, where a component prepares the values it is about to show.

Now replace the hard-coded paragraph with one that reads its numbers from data.

```jsx file="src/App.jsx" action="replace" anchor="      <p>Two concepts should render from data, but this starter contains only one hard-coded result.</p>"
      <p>{course} renders {topics.length} concepts from data.</p>
```

`{course}` shows the value of the variable, and `{topics.length}` is a property read that shows `2`.

Last, make the concept name come from the array and add one sentence built from two more kinds of expression.

```predict
After this edit and a run, what does the new last paragraph read?
- Week 9 + 1 covers JSX expressions and Root rendering.
= Week 10 covers JSX expressions and Root rendering.
- Week 10 covers JSX expressions,Root rendering.
```

```jsx file="src/App.jsx" action="replace" anchor="      <p><strong>JSX expressions:</strong> Values render inside braces.</p>"
      <p><strong>{topics[0]}:</strong> Values render inside braces.</p>
      <p>Week {9 + 1} covers {topics.join(" and ")}.</p>
```

`{topics[0]}` reads the first item of the array, `{9 + 1}` is arithmetic that shows `10`, and `{topics.join(" and ")}` calls a method and shows the string it returns.

## Read more

**JSX** is the HTML-like syntax inside `return ( ... )`.
It is not HTML; the build tool turns each tag into a JavaScript function call.
Because it is JavaScript underneath, we can put any JavaScript **expression** inside a pair of curly braces, and React shows its value.
If you are comfortable with template literals, it is the same idea: `` `Hello ${name}` `` becomes `Hello {name}`.

Add a concept to the array later and the count sentence corrects itself, which is the point of rendering from data.

Anything that produces a value works inside braces: variables, property reads, arithmetic, function and method calls, and template literals.
Statements do not work, because they do not produce a value; an `if` or a `for` inside braces is a syntax error, and the next steps show what to use instead.

**If it breaks:** If the page shows the words `course` or `topics.length` instead of their values, the braces around them are missing.
If the result reports `topics is not defined`, the array line is missing or sits outside the `App` function.
If the result pane shows a compile error that points at a brace, count the braces on that line: every `{` needs its `}`.

**Check:** The result reads **CS300 renders 2 concepts from data.**, then **JSX expressions:** with its sentence, then **Week 10 covers JSX expressions and Root rendering.**
No variable names appear as text on the page.
Press **Run checks** to confirm.

```quiz
Which of these can go inside a pair of braces in JSX?
- `if (topics.length > 1) { "many" }`
- `for (const topic of topics) { topic }`
= `topics.length > 1 ? "many" : "one"`
> Braces take an expression, something that produces a value; the conditional operator produces one, while `if` and `for` are statements and do not.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
export default function App() {
  const course = "CS300";
  const topics = ["JSX expressions", "Root rendering"];

  return (
    <main>
      <h1>React, Vite, JSX, and Rendering</h1>
      <p>{course} renders {topics.length} concepts from data.</p>
      <p><strong>{topics[0]}:</strong> Values render inside braces.</p>
      <p>Week {9 + 1} covers {topics.join(" and ")}.</p>
    </main>
  );
}
```

</details>
