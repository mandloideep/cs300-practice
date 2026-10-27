---
title: Block scope
mode: edit
entry: index.html
required: [inside-the-block, outer-variable-updated, last-student]
---

**We used this in:** [Functions and callbacks](#/topic/functions-and-callbacks) passed values into functions through parameters; this topic asks where each name can be seen, which is what makes a function able to remember a value later in the topic.

Every variable has a **scope**: the part of the program where its name means something.
This step shows the smallest scope there is, the **block**, the code between a pair of braces in an `if` or a loop.
Watch what happens when a line outside the braces asks for a variable that was declared inside them.

Press **Run** and the console shows `Inside the if: Above the B line.`
The score is 84, so the `if` runs, and `message` is declared with `const` inside its braces.

Suppose we want to print the message after the `if` as well.

```predict
After the next edit, what does the console show for the new line?
- `Outside the if: Above the B line.`
= `ReferenceError: message is not defined`
- `Outside the if: undefined`
```

```js file="src/main.js" action="append"
console.log("Outside the if:", message);
```

Run it, and the console shows `Inside the if: Above the B line.` and, at the top, a red line with an **uncaught** badge: `ReferenceError: message is not defined`.
A variable declared with `const` or `let` belongs to the block it is declared in.
The `message` inside the braces was created when the `if` started and was gone when it ended, so the last line asks for a name that does not exist out there.

To use a value after the block, declare the variable before it, outside the braces.

```predict
The inner `const message` stays for now, so what does `Outside the if:` show after the next edit?
- `Above the B line.`
= `Below the B line.`
```

```js file="src/main.js" action="insert-before" anchor="if (score >= 80) {"
let message = "Below the B line.";
```

Run the code: `Inside the if: Above the B line.` and `Outside the if: Below the B line.`
There are now two variables named `message`, one outside the block and one inside.
Inside the braces, the inner one **shadows** the outer one: the name finds the nearest declaration, so the `if` set and printed its own `message` and left the outer one alone.

Remove `const` from the line inside the `if`, so that it changes the outer variable instead of declaring a new one.

```js file="src/main.js" action="replace" anchor='  const message = "Above the B line.";'
  message = "Above the B line.";
```

Run it, and both lines show `Above the B line.`
With no `const` or `let`, the line is an assignment, and JavaScript looks outward from the block for a `message` to assign to; it finds the `let` above the `if`.
That is also why the outer one is `let`: the block changes it.

A loop body is a block too, and the same pattern collects a value from it.

```js file="src/main.js" action="append"

const roster = ["Alice", "Bob", "Charlie"];
let lastStudent = "nobody";
for (const student of roster) {
  lastStudent = student;
}
console.log("Last student:", lastStudent);
```

`student` is declared by the loop and lives in its block, a new one for each pass.
`lastStudent` is declared outside, so every pass can assign to it and the line after the loop can read it: `Last student: Charlie`.

## Read more

Block scope is a feature, not an obstacle.
A name that exists only inside the braces cannot clash with a name somewhere else in the file, and a reader knows that nothing outside can change it.
The habit that follows is to declare a variable in the smallest block that needs it, and move the declaration outward only when a later line really needs the value, as we did twice here.
The next step meets the older keyword `var`, which ignores blocks, and shows why that caused so many bugs that `let` and `const` were added.

One mistake to try on purpose.
Add `console.log(student);` after the loop's closing brace and run: `ReferenceError: student is not defined`, for the same reason as the first error in this step.
Delete the line again.

**If it breaks:** If the console shows `ReferenceError: message is not defined`, the `let message` line is missing or sits inside the braces; it belongs above `if`.
If `Outside the if` shows `Below the B line.`, the line inside the `if` still starts with `const`.
If the console shows `Assignment to constant variable`, the outer `message` was declared with `const`; it must be `let` because the block changes it.

**Check:** Run the code.
The console shows `Inside the if: Above the B line.`, `Outside the if: Above the B line.`, and `Last student: Charlie`, with no red line.
Press **Run checks** to confirm.

```quiz
A `const` is declared inside the braces of an `if`; what happens when a line after the closing brace reads it?
- It reads the value the block set
- It reads `undefined`
= It throws a `ReferenceError`
> A `const` or `let` belongs to the block it is declared in and does not exist outside it.
```

```quiz
The outer scope has `let message`, and a block declares its own `const message`; what does the block's declaration do?
= It shadows the outer one inside the block and leaves it unchanged
- It changes the outer `message`
- It throws an error, because the name is taken
> The name finds the nearest declaration, so inside the braces `message` means the inner one.
```

<details>
<summary>src/main.js after this step</summary>

```js
const score = 84;

let message = "Below the B line.";
if (score >= 80) {
  message = "Above the B line.";
  console.log("Inside the if:", message);
}
console.log("Outside the if:", message);

const roster = ["Alice", "Bob", "Charlie"];
let lastStudent = "nobody";
for (const student of roster) {
  lastStudent = student;
}
console.log("Last student:", lastStudent);
```

</details>
