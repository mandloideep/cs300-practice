---
title: Nested data and optional chaining
mode: edit
entry: index.html
required: [deep-path-reads, chain-stops-and-falls-back, each-student-gets-a-line, nullish-keeps-zero]
---

Real data is objects inside objects: a course has an instructor, the instructor has an office, the office has a room.
This step walks such a path one dot at a time, breaks on purpose when a value along the way is missing, and then fixes it with `?.`, which stops the walk at a missing value, and `??`, which supplies a fallback.
Watch the console for the one red line this step asks you to cause.

Press **Run**.
The console shows `Course: CS101 Introduction to Programming` and `Instructor: Ana Rivera`.
Look at the data first: `course.instructor` is an object, `course.instructor.office` is another one inside it, `course.ta` is `null` because no TA has been hired yet, and Bob has no `advisor` key at all.

Walk three levels down.

```js file="src/main.js" action="append"

console.log("Room:", course.instructor.office.room);
```

Run the code, and the console shows `Room: 204`.
Read the path left to right: start at `course`, follow `instructor` to its object, follow `office` to the next one, and read `room` there.
Each dot needs the value on its left to be an object.

Now ask for the name of the TA.
Predict before you run: does the console show `TA: undefined`, `TA: null`, or `TypeError: Cannot read properties of null (reading 'name')`?

```js file="src/main.js" action="append"

console.log("TA:", course.ta.name);
```

Run the code.
A red line with an **uncaught** badge says `TypeError: Cannot read properties of null (reading 'name')`.
`course.ta` is `null`, and there is nothing to the right of `null` to read, so the dot fails, the error stops the module at this line, and nothing after it runs.
This is the most common error in the course, and in React it usually means data that has not arrived yet.

Replace the dot after `ta` with `?.`, the **optional chaining** operator.

```js file="src/main.js" action="replace" anchor='console.log("TA:", course.ta.name);'
console.log("TA:", course.ta?.name);
```

Run the code.
The error is gone and the console shows `TA: undefined`.
`?.` checks the value on its left first: when it is `null` or `undefined`, the walk stops there and the whole expression is `undefined`; otherwise it reads the property as a dot would.

`undefined` is not something to show a student, so supply a fallback with `??`, the **nullish coalescing** operator.

```js file="src/main.js" action="replace" anchor='console.log("TA:", course.ta?.name);'
console.log("TA:", course.ta?.name ?? "no TA this term");
```

`a ?? b` is `a` unless `a` is `null` or `undefined`, and then it is `b`, so the console shows `TA: no TA this term`.
The two operators are made to be used together: `?.` stops the walk safely, and `??` decides what to show when it stopped.

The same pair handles a list where some objects lack a key.

```js file="src/main.js" action="append"

students.forEach((student) => {
  console.log(`${student.name}'s advisor: ${student.advisor?.name ?? "not assigned"}`);
});
```

Alice and Charlie show their advisors, and Bob shows `not assigned`: `student.advisor` is `undefined` for him, because reading a key an object does not have gives `undefined`, so `?.` stops and `??` fills in.

Last, why `??` and not the `||` you may have seen.
Predict before you run: does the console show `with ??: 0` or `with ??: 5`?

```js file="src/main.js" action="append"

const extraCredit = 0;
console.log("with ||:", extraCredit || 5);
console.log("with ??:", extraCredit ?? 5);
```

Run the code.
`with ||:` is `5` and `with ??:` is `0`.
`||` falls back whenever the left side is falsy, and `0`, `""`, and `false` are all falsy, so it throws away a real score of zero.
`??` falls back only for `null` and `undefined`, the values that mean "nothing here", which is almost always what you want for data.

One `?.` covers the rest of its path: in `course.ta?.office.room` the walk stops at the `null` and never reaches `.office`, so you do not need `?.` on every dot.
Put `?.` only where a value may really be missing; on a value that must exist, a plain dot and a loud error tell you about a bug sooner than a quiet `undefined` does.
Try it: change `course.instructor.office.room` to `course.instuctor.office.room`, with the `r` missing, run, and read `Cannot read properties of undefined (reading 'office')`, because the misspelled key is `undefined`; that error points straight at the typo, and a `?.` there would have hidden it.
Fix the spelling again.

**If it breaks:** If the red `TypeError` is still there after the replace, the `?.` went after `name` instead of between `ta` and `name`; it belongs right after the value that may be missing.
If Bob's line shows `undefined` instead of `not assigned`, the `?? "not assigned"` part is missing or sits outside the `${...}`.
If `with ??:` shows `5`, the line uses `||` twice.

**Check:** Run the code.
The console shows `Room: 204`, `TA: no TA this term` with no red line, one advisor line per student with `Bob's advisor: not assigned` in the middle, `with ||: 5`, and `with ??: 0`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const course = {
  code: "CS101",
  title: "Introduction to Programming",
  instructor: { name: "Ana Rivera", office: { building: "Science", room: "204" } },
  ta: null
};

const students = [
  { name: "Alice", advisor: { name: "Lee" } },
  { name: "Bob" },
  { name: "Charlie", advisor: { name: "Patel" } }
];

console.log("Course:", course.code, course.title);
console.log("Instructor:", course.instructor.name);

console.log("Room:", course.instructor.office.room);

console.log("TA:", course.ta?.name ?? "no TA this term");

students.forEach((student) => {
  console.log(`${student.name}'s advisor: ${student.advisor?.name ?? "not assigned"}`);
});

const extraCredit = 0;
console.log("with ||:", extraCredit || 5);
console.log("with ??:", extraCredit ?? 5);
```

</details>
