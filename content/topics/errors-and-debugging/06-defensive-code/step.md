---
title: Defensive code
mode: edit
entry: index.html
required: [numbers-from-strings, empty-is-not-zero, wrong-type-is-loud]
---

Data that comes from outside your code, from a form, a file, or an API, is often not the shape you expected: numbers arrive as strings, lists arrive empty, and sometimes a value is the wrong type altogether.
This step makes `average` **defensive**: it accepts the input it can make sense of, gives a clear answer for the case that really happens, and refuses loudly the input that means something upstream is broken.
Watch for the difference between a guard that handles a case and a guard that hides a bug.

The starter computes averages for four students from an import.
Bob's scores came from a form, so they are strings; Diana has just joined, so her list is empty; and Frank's scores were pasted as one string instead of a list.
Predict before you run: Bob's scores are `"73"`, `"80"`, and `"69"`, so does the console show `Bob: 74.0`, an error, or some other number?
Press **Run**.
The console shows `Alice: 91.7`, `Bob: 246023.0`, `Diana: NaN`, and `Frank: NaN`, and not one red line.
`0 + "73"` is the string `"073"`, because `+` with a string joins instead of adding, so Bob's total became `"0738069"`, and dividing that by 3 turned it back into a number.
Three wrong answers and no error is the worst kind of bug: nothing tells you to look.

Turn each score into a number before adding it.

```js file="src/main.js" action="replace" anchor="    total += score;"
    total += Number(score);
```

`Number("73")` is `73`, and `Number(95)` is still `95`, so the function now accepts both forms.
Run it: `Bob: 74.0`.
Diana and Frank are still `NaN`: Diana's total is `0` divided by `0` scores, and Frank's string is looped over one character at a time, and `Number(",")` is `NaN`.

Now guard the two other cases at the top of `average`, before any arithmetic.

```js file="src/main.js" action="insert-after" anchor="function average(scores) {"
  if (!Array.isArray(scores)) {
    throw new TypeError(`expected an array of scores, got ${typeof scores}`);
  }
  if (scores.length === 0) {
    return null;
  }
```

`Array.isArray(scores)` is `true` only for an array; `typeof` would not do here, because `typeof []` is `"object"`, the same as for any object.
An empty list is a real situation, a student with no scores yet, so the function answers it with `null`, "no average", rather than inventing a number.
A string where a list belongs is not a situation the gradebook should ever be in, so the function throws a `TypeError`, the built-in error type for a value of the wrong type, and says what it got.

Predict before you run: what does the console show for Diana now, `Diana: NaN`, `Diana: 0.0`, or a red line?
Run it.
A red line: `TypeError: Cannot read properties of null (reading 'toFixed')`.
`average` now says "no average" with `null`, and the loop still tries to format it as a number.
That error is useful: the function's answer changed, and the code that uses the answer has to decide what to do with it.

Make the loop handle both outcomes: `null` gets its own line, and a thrown error skips that student with a warning, the same `try` and `catch` per student as in Step 2.
Replace the two lines inside the loop.

```js file="src/main.js" action="replace" anchor='  const value = average(student.scores);\n  console.log(student.name + ":", value.toFixed(1));'
  try {
    const value = average(student.scores);
    if (value === null) {
      console.log(student.name + ": no scores yet");
    } else {
      console.log(student.name + ":", value.toFixed(1));
    }
  } catch (error) {
    console.warn(student.name, "skipped:", error.message);
  }
```

Predict before you run: what happens to Frank, a line that says `Frank: NaN`, a warning that names the problem, or nothing at all?
Run it.
The console shows `Alice: 91.7`, `Bob: 74.0`, `Diana: no scores yet`, and a warning, `Frank skipped: expected an array of scores, got string`.
Every student gets an honest line, and the one with broken data says exactly what is broken.

The line between defending and hiding is whether the guard tells the truth.
Try the tempting shortcut on purpose: change `return null;` to `return 0;` and run.
Diana prints `Diana: 0.0`, a failing grade for a student who has not taken anything yet, and nothing warns you; change it back.
The same goes for writing `const list = scores || [];` to make every bad value "work": Frank would quietly get no scores, and the paste mistake would never be found.
So handle quietly only the cases that can really happen, an empty list or a number typed as a string, and let everything else fail loudly with a message that says what was wrong.

Try one more on purpose: add `{ name: "Eve" }`, with no `scores` key at all, to the array and run.
The warning `Eve skipped: expected an array of scores, got undefined` appears, because a missing key reads as `undefined`, which is not an array.
That is the right answer: a missing key is often a typo upstream, like the `score` for `scores` in the last step, and turning it into "no scores yet" would hide the typo.
Delete Eve again when you have seen it.

Put guards where data enters your code, in the function that receives the import or the form or the response, and then trust the data inside.
A guard on every line of every function makes code hard to read and still misses the case you did not think of.
`Number()` has traps of its own: `Number("")` is `0` and `Number("absent")` is `NaN`, so a stricter version would also check `Number.isNaN` on each converted score and throw for it.

**If it breaks:** If Bob is still `246023.0`, the `+=` line adds `score` rather than `Number(score)`.
If Diana shows a red line about `toFixed`, the loop does not check `value === null` before formatting it.
If Frank shows a red line instead of a warning, the `try` does not wrap the call to `average`, or the `catch` is missing.

**Check:** Run the code.
The console shows `Alice: 91.7`, `Bob: 74.0`, `Diana: no scores yet`, and a warning that says `Frank skipped: expected an array of scores, got string`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const imported = [
  { name: "Alice", scores: [95, 88, 92] },
  { name: "Bob", scores: ["73", "80", "69"] },
  { name: "Diana", scores: [] },
  { name: "Frank", scores: "91, 85" }
];

function average(scores) {
  if (!Array.isArray(scores)) {
    throw new TypeError(`expected an array of scores, got ${typeof scores}`);
  }
  if (scores.length === 0) {
    return null;
  }
  let total = 0;
  for (const score of scores) {
    total += Number(score);
  }
  return total / scores.length;
}

for (const student of imported) {
  try {
    const value = average(student.scores);
    if (value === null) {
      console.log(student.name + ": no scores yet");
    } else {
      console.log(student.name + ":", value.toFixed(1));
    }
  } catch (error) {
    console.warn(student.name, "skipped:", error.message);
  }
}
```

</details>
