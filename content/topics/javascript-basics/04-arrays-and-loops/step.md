---
title: Arrays and loops, with a boundary trace
mode: edit
entry: src/main.js
required: [index-and-length, loop-stops-at-the-end, for-of-greets, push-and-includes]
---

One variable holds one value, and a list of them is an **array**: values in order, in square brackets, each at a numbered position called its **index**.
This step reads an array by index, loops over it, and walks one step too far on purpose.
Watch the last pass of the loop: the index past the end gives `undefined`, not an error.

```demo name="array-index-walk"
```

Press **Run**.
`names[0]` is the first name, because indexes start at `0`, not `1`, and `names.length` is `4`.
Those two facts together decide where the last item is.

```js file="src/main.js" action="append"

console.log("Last:", names[names.length - 1]);
console.log("Past the end:", names[names.length]);
```

Run the code.
Four items have the indexes `0`, `1`, `2`, and `3`, so the last one is at `length - 1`, and `names[4]` quietly gives you `undefined`.

A **loop** runs the same lines once per item.
The classic `for` loop counts an index from `0` upward, and this version has a mistake in it on purpose.

```predict
After you append this loop and run, what is the last line of the numbered list?
- `4. Diana`
= `5. undefined`
- `RangeError: index 4 is out of bounds`
```

```js file="src/main.js" action="append"

for (let i = 0; i <= names.length; i++) {
  console.log(`${i + 1}. ${names[i]}`);
}
```

Run the code and read the numbered list: `1. Alice` through `4. Diana`, and then `5. undefined`.
The condition `i <= names.length` lets `i` reach `4`, which is `length`, one past the last index; fix it with `<`.

```js file="src/main.js" action="replace" anchor="for (let i = 0; i <= names.length; i++) {"
for (let i = 0; i < names.length; i++) {
```

Run again: four lines, no `undefined`.

Most loops do not need the index at all.

```js file="src/main.js" action="append"

for (const name of names) {
  console.log(`Hello, ${name}!`);
}
```

`for...of` hands you each item in turn, with no counter to get wrong.

Arrays, unlike strings, can be changed in place.

```js file="src/main.js" action="append"

names.push("Eve");
console.log("Count now:", names.length);
console.log("Has Eve:", names.includes("Eve"));
```

`push` adds an item at the end, and `includes` asks whether an item is in the array.

## Read more

### Why the index past the end is quiet

A page full of products, students, or messages needs a list, and in JavaScript a list is an array.
`names[4]` is past the end, and JavaScript does not complain; it quietly gives you `undefined`, which then breaks something three lines later.
Keep that in mind for the loop.

### The trace

Trace the loop the way the lesson did.
The three parts in the parentheses are the start, `let i = 0`; the condition checked before every pass, `i <= names.length`; and the update after every pass, `i++`, which adds one.

| Pass | `i` | `i <= 4` | Prints |
| --- | --- | --- | --- |
| 1 | 0 | true | `1. Alice` |
| 2 | 1 | true | `2. Bob` |
| 3 | 2 | true | `3. Charlie` |
| 4 | 3 | true | `4. Diana` |
| 5 | 4 | true | `5. undefined` |
| stop | 5 | false | |

The condition lets `i` reach `4`, which is `length`, one past the last index.
This is the off-by-one error, and `<=` where `<` belongs is its most common form.
With `<`, the pass where `i` is `4` never happens.
Whenever a loop prints one extra item or one too few, check the condition first.

### for...of and const

`for...of` is the loop to reach for unless you need the number.
`const` works here because `name` is a fresh variable on every pass.

### Changing an array under const

`push` adds an item at the end, and the array that `names` points at now has five items.
`names` is a `const`, and that is fine: `const` stops you from pointing the name at a different array, not from changing the contents of this one.
`includes` asks whether an item is in the array, the same question `includes` asked about a string in Step 2.

**If it breaks:** If the numbered list has five lines, the condition still uses `<=`.
If it has three, the condition is `i < names.length - 1`, which stops one early.
If `Has Eve` is `false`, the `push` line is below the `includes` line, or it pushes a different spelling.

**Check:** Run the code.
The console shows the first and last names, `undefined` for the index past the end, a numbered list of four, four greetings, and then `5` and `true`.
Press **Run checks** to confirm, including that `5. undefined` is gone.

```quiz
`names` is declared with `const`; what happens when the code runs `names.push("Eve")`?
- `TypeError: Assignment to constant variable.`
= The array gains `Eve` at the end, because `const` only stops the name from pointing at a different array
- Nothing, because `push` returns a new array and leaves `names` alone
> Unlike a string method, `push` changes the array it is called on; `const` protects the name, not the contents.
```

<details>
<summary>src/main.js after this step</summary>

```js
const names = ["Alice", "Bob", "Charlie", "Diana"];

console.log("First:", names[0]);
console.log("Count:", names.length);

console.log("Last:", names[names.length - 1]);
console.log("Past the end:", names[names.length]);

for (let i = 0; i < names.length; i++) {
  console.log(`${i + 1}. ${names[i]}`);
}

for (const name of names) {
  console.log(`Hello, ${name}!`);
}

names.push("Eve");
console.log("Count now:", names.length);
console.log("Has Eve:", names.includes("Eve"));
```

</details>
