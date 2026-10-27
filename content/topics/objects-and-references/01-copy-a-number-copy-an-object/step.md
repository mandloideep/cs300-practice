---
title: Copy a number, copy an object
mode: edit
entry: index.html
required: [number-is-copied, object-is-shared, function-changes-the-original]
---

This step copies a number into a second variable, then copies an object the same way, and changes each copy.
The two cases look identical on the page and behave differently, and that difference explains most of the surprises in this topic and many of the React bugs later in the course.
Watch which original changes and which does not.

**We used this in:** [JavaScript basics](#/topic/javascript-basics), where `alice.grade = ...` changed an object in place and `map` built new objects instead.

Press **Run**.
The console shows `score: 85` and `student: {"name":"Alice","score":85}`, one number and one object with the same score.

Predict before you run the first edit: after the curve, does the console show `score after the curve: 85` or `score after the curve: 90`?

```js file="src/main.js" action="append"

let curvedScore = score;
curvedScore = curvedScore + 5;
console.log("curvedScore:", curvedScore);
console.log("score after the curve:", score);
```

Run the code.
`curvedScore` is `90` and `score` is still `85`.
`let curvedScore = score` copied the number `85` into a new variable, so the two have nothing to do with each other after that line; changing one cannot reach the other.
Strings and booleans behave the same way, because they are values too.

Now do the same with the object.
Predict before you run: does the console show `student after the change: {"name":"Alice","score":85}` or `student after the change: {"name":"Alice","score":90}`?

```js file="src/main.js" action="append"

const sameStudent = student;
sameStudent.score = 90;
console.log("sameStudent:", sameStudent);
console.log("student after the change:", student);
console.log("Same object?", sameStudent === student);
```

Run the code.
Both lines show a score of `90`, and `Same object?` is `true`.
A variable never holds an object itself; it holds a **reference**, an arrow that points to the object.
`const sameStudent = student` copied the arrow, not the object, so there are two arrows and still only one object, and a change made through either arrow is a change to that one object.

The same thing happens when you hand an object to a function.

```js file="src/main.js" action="append"

const addBonus = (record) => {
  record.score = record.score + 5;
};
addBonus(student);
console.log("student after addBonus:", student);
```

The parameter `record` receives a copy of the arrow, so `record` and `student` point to the same object, and the function changes Alice's score to `95` for everyone who holds an arrow to her.
A function that receives a number gets a copy of the number instead, and nothing it does to its parameter reaches the caller.

Think of it as two rules.
Numbers, strings, booleans, `null`, and `undefined` are **primitive values**, and assigning one copies the value.
Objects and arrays are reached through references, and assigning one copies the reference.
An array is an object too, so `const sameScores = scores` followed by `sameScores.push(100)` changes `scores` as well.

`const` does not stop any of this.
`const student` promises that the variable `student` keeps pointing to the same object; it says nothing about what is inside the object, which is why `sameStudent.score = 90` is allowed.
Try it: add a line `student = { name: "Bob", score: 70 };` at the end, run, and read `TypeError: Assignment to constant variable.` at the top of the console, because that line tries to point the arrow somewhere else.
Delete the line again.

To get a second, independent object, you have to make one, with `{ ...student }` or the way `map` did in JavaScript basics; Step 3 shows how.
React depends on exactly this: it notices a change in state only when it receives a new object, not when the old one was changed in place.

**If it breaks:** If the console shows `TypeError: Assignment to constant variable.` after the first edit, a line assigns to `score` itself, which is a `const`; add `5` to `curvedScore` instead.
If `student after the change` shows `85`, the line assigns to `student.name` or to a new object instead of `sameStudent.score`.
If `student after addBonus` still shows `90`, the function was declared but `addBonus(student);` was never called.

**Check:** Run the code.
The console shows `curvedScore: 90` beside `score after the curve: 85`, both objects with a score of `90` and `Same object? true`, and `student after addBonus: {"name":"Alice","score":95}`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const score = 85;
const student = { name: "Alice", score: 85 };

console.log("score:", score);
console.log("student:", student);

let curvedScore = score;
curvedScore = curvedScore + 5;
console.log("curvedScore:", curvedScore);
console.log("score after the curve:", score);

const sameStudent = student;
sameStudent.score = 90;
console.log("sameStudent:", sameStudent);
console.log("student after the change:", student);
console.log("Same object?", sameStudent === student);

const addBonus = (record) => {
  record.score = record.score + 5;
};
addBonus(student);
console.log("student after addBonus:", student);
```

</details>
