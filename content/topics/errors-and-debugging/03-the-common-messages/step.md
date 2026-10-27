---
title: The common messages
mode: edit
entry: index.html
required: [course-and-count, seats-left, first-student, waitlist]
links:
  - kind: reference
    title: "MDN: JavaScript error reference"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors
---

Most of the errors you will meet this semester are one of five messages, and each one points at a particular kind of mistake.
This step's starter was broken on purpose in four places, and each run shows only the first problem, because an uncaught error stops the script there.
Fix them one at a time, read each message before you fix it, and then break the file a fifth way yourself.

**We used this in:** [JavaScript basics](#/topic/javascript-basics) listed these five messages in a table in its last step; here you cause each one and read it in the lab.

```demo name="error-decoder"
```

`src/main.js` describes a course: an object with a code, a title, and a list of students, a seat limit, and a function that works out the seats left.

```predict
The starter has four mistakes; how many red lines does the console show when you run it?
- Four, one per mistake
= One
- None, because the page still loads
```

Press **Run**.
The console shows `Course: Web Development` and one red line, `ReferenceError: couse is not defined`, with the link `src/main.js:13`.
One, because the script stopped at line 13, and the three mistakes below it never ran.

**`x is not defined`** is a `ReferenceError`: the code used a name that no `const`, `let`, or `function` declared.
The name in the message is spelled exactly as the code spelled it, so compare it letter by letter with the declaration; here `couse` is missing an `r`.

```js file="src/main.js" action="replace" anchor='console.log("Enrolled:", couse.students.length);'
console.log("Enrolled:", course.students.length);
```

```predict
With the name fixed, what does the console show after `Enrolled: 3`?
- `Seats left: 27`
- Another `ReferenceError`
= A `TypeError`
```

Run it.
`Enrolled: 3` prints, and the red line is now `TypeError: course.students.length is not a function`, on line 14.

**`x is not a function`** means the code put parentheses after something that is not a function, and the message quotes the expression that was called.
`length` is a number, a property you read, not a method you call, so `length()` asks JavaScript to call `3`.

```js file="src/main.js" action="replace" anchor='console.log("Seats left:", seatsLeft(course.students.length()));'
console.log("Seats left:", seatsLeft(course.students.length));
```

Run it.
`Seats left: 27` prints, and the next red line is `TypeError: Cannot read properties of undefined (reading '0')`, on line 16.

**`Cannot read properties of undefined (reading 'x')`** means a dot or a bracket was used on a value that is `undefined`, and the word in the parentheses is the property that was being read.
So the question is: what is to the left of `[0]`?
`course.student`, without the `s`, which is a key the object does not have, so it is `undefined`, and `undefined[0]` cannot be read.
A misspelled property gives `undefined` quietly, with no error, and the error comes one step later, when something reads from that `undefined`.

```js file="src/main.js" action="replace" anchor="const first = course.student[0];"
const first = course.students[0];
```

```predict
With `students` spelled right, does the console now reach `Waitlist: 2`?
- Yes, every line prints
= No, one more red line appears
```

Run it.
`First student: ALICE` prints, and the last red line is `TypeError: Assignment to constant variable.`, on line 20.

**`Assignment to constant variable`** means a variable declared with `const` was given a new value.
`waitlist` changes on purpose, so it is one of the few variables that should be `let`.

```js file="src/main.js" action="replace" anchor="const waitlist = 0;"
let waitlist = 0;
```

Run it, and every line prints with no red line.

The fifth message you will cause yourself, because the lab does not let a starter that does not parse onto the page.
Delete the `)` before the `;` at the end of line 12, so that it reads `console.log("Course:", course.title;`, and run.
Nothing prints at all, not even the first line, and the result pane says **Your code did not compile.** with a link to line 12 and the message `Unexpected token, expected ","`.
That is a **syntax error**: the file is not valid JavaScript, so none of it runs, which is the difference from the four errors above, where every line before the broken one ran.
The browser's own console words it as `SyntaxError: missing ) after argument list`.
The line it names is where the parser gave up, which is sometimes a line or two after the missing bracket or quote, so look at the line above too.
Put the `)` back and run.

## Read more

Each of these messages names its cause if you read it word by word.
`not defined` is about a **name**, so look at spelling and at where the name was declared.
`not a function` is about **parentheses**, so look at what is being called.
`Cannot read properties of undefined` is about the value **to the left of the dot**, so ask where that value came from; it is the message you will see most often, because data from an API or a form is so often missing a key.
`Assignment to constant variable` is about **`const`**.
A syntax error is about **brackets, quotes, and commas**, and it stops the whole file.
When there are several red lines, fix the first one and run again, because the ones below it are often caused by it.

**If it breaks:** If a red line remains after all four fixes, click its link and compare the line with the solution in the panel below; the four broken spots were lines 13, 14, 16, and 19.
If the console shows `Cannot read properties of undefined (reading 'toUpperCase')`, the `[0]` was dropped, or `first` reads from an empty list.
If nothing prints at all, the `)` on line 12 is still missing.

**Check:** Run the code.
The console shows `Course: Web Development`, `Enrolled: 3`, `Seats left: 27`, `First student: ALICE`, and `Waitlist: 2`, with no red line.
Press **Run checks** to confirm.

```quiz
What does `TypeError: Cannot read properties of undefined (reading 'name')` tell you?
- The variable `name` was never declared
= The value just before `.name` is `undefined`
- `name` is misspelled in the object
> The word in the parentheses is the property being read, so look one step to the left and ask where that `undefined` came from.
```

```quiz
Which of the five errors keeps every line of the file from running, even the ones above it?
- `ReferenceError: x is not defined`
- `TypeError: Assignment to constant variable.`
= A syntax error
> A file with a syntax error never parses, so nothing runs; the other four stop the script only at the line that throws.
```

<details>
<summary>src/main.js after this step</summary>

```js
const course = {
  code: "CS300",
  title: "Web Development",
  students: ["Alice", "Bob", "Charlie"]
};
const maxSeats = 30;

function seatsLeft(enrolled) {
  return maxSeats - enrolled;
}

console.log("Course:", course.title);
console.log("Enrolled:", course.students.length);
console.log("Seats left:", seatsLeft(course.students.length));

const first = course.students[0];
console.log("First student:", first.toUpperCase());

let waitlist = 0;
waitlist = waitlist + 2;
console.log("Waitlist:", waitlist);
```

</details>
