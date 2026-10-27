---
title: Declare a function and call it
mode: edit
entry: index.html
required: [divider-printed-twice, lines-in-order]
---

A **function** is a named block of code that you write once and run as many times as you like.
This step declares one that prints a divider line in a small gradebook and then calls it in two places.
Watch for the difference between writing a function down and running it: the first does nothing you can see.

**We used this in:** [JavaScript basics](#/topic/javascript-basics) used arrow functions such as `getGrade` and handed small functions to `map` and `filter`; this topic slows down and looks at what a function is and what happens when it runs.

Press **Run** and the console shows three lines: `CS300 gradebook`, `Alice: 92`, and `Bob: 78`.
We want a line of dashes under the title and another after the last student.
Rather than typing the same `console.log` twice, we give that job a name.

Predict before you run: once you add the function below, does the console show the dashes once, twice, or not at all?

```js file="src/main.js" action="append"

function printDivider() {
  console.log("----------");
}
```

This is a **function declaration**: the keyword `function`, a name, a pair of parentheses, and a body in braces.
Run the code, and the console still shows the same three lines and no dashes.
A declaration only stores the instructions under the name `printDivider`; nothing inside the braces runs until something **calls** the function.

A call is the name followed by parentheses.
Put the first one right under the title.

```js file="src/main.js" action="insert-after" anchor='console.log("CS300 gradebook");'
printDivider();
```

Predict before you run: the call sits above the function in the file, so does the console show the dashes, or `ReferenceError: printDivider is not defined`?
Run it, and the dashes appear under the title.
JavaScript reads every function declaration in a file before it runs the first line, so a declared function can be called from anywhere in the file, even above it.

Now the second call, after the last student.

```js file="src/main.js" action="insert-after" anchor='console.log("Bob: 78");'
printDivider();
```

Run the code, and the dashes appear twice.
Each call jumps into the body, runs it from the top, and comes back to the line after the call, so two calls print two dividers from one definition.
If we later want a longer divider, we change one line inside the function and both places change with it.

A function is the first tool you have for not repeating yourself, and it is also the way you give a piece of a program a name that says what it does.
`printDivider()` reads as a sentence; `console.log("----------")` makes you work out what the dashes are for.
Every React component you write later in the semester is a function like this one, called by React instead of by you.

Two mistakes to try on purpose.
Delete the parentheses from the last call so that it reads `printDivider;`, and run: the second divider disappears, and nothing is red.
The bare name only mentions the function; without parentheses it is never called, and Step 5 comes back to this mistake because it is the most common one with functions.
Put the parentheses back, then misspell the call as `printDivder();` and run: the console shows `ReferenceError: printDivder is not defined`, because no function has that name.
Fix the spelling before you go on.

**If it breaks:** If no dashes appear at all, check that each call ends with `()` and that the name matches the declaration exactly, including the capital `D`.
If the dashes appear three times, one of the calls was typed twice.
If the result pane says **Your code did not compile**, a brace is usually missing at the end of the function; the body opens with `{` and closes with `}` on its own line.

**Check:** Run the code.
The console shows the title, a line of dashes, Alice and Bob, and a second line of dashes, five lines in all.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
console.log("CS300 gradebook");
printDivider();
console.log("Alice: 92");
console.log("Bob: 78");
printDivider();

function printDivider() {
  console.log("----------");
}
```

</details>
