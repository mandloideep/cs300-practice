---
title: Pass a function to a function
mode: edit
entry: index.html
required: [passing-and-honors, inline-callback-called-per-score, filter-agrees]
---

Step 3 showed that a function is a value, and a value can be an argument.
This step writes `countWhere`, a function that counts the scores in a list that pass a test, where the test is a function you hand it.
A function passed to another function so that the other one can call it is a **callback**, and the thing to watch is who calls it: not you, but the function you handed it to.

**We used this in:** [JavaScript basics](#/topic/javascript-basics) passed callbacks to `map`, `filter`, and `forEach`; here you write the function on the other side, the one that receives the callback.

Press **Run** and the console shows the five scores.
`isPassing` and `isHonors` are already declared: each takes one score and returns `true` or `false`.

Write the function that takes a test as its second parameter.

```js file="src/main.js" action="append"

function countWhere(list, test) {
  let count = 0;
  for (const item of list) {
    if (test(item)) {
      count = count + 1;
    }
  }
  return count;
}
```

`test` is an ordinary parameter, and inside the loop it is called like any function: `test(item)`.
`countWhere` does not know what the test checks; it only knows that it can call it with an item and get back `true` or `false`.

Predict before you run: after the next edit, does the console show `Passing: 4`, `Passing: 0`, or `TypeError: test is not a function`?

```js file="src/main.js" action="append"

console.log("Passing:", countWhere(scores, isPassing));
console.log("Honors:", countWhere(scores, isHonors));
```

Run it: `Passing: 4` and `Honors: 1`.
In the first call, `test` is `isPassing`, so `countWhere` calls `isPassing` five times, once with each score, and counts the four that returned `true`.
In the second call the same loop runs `isHonors`, and only `92` passes.
Notice there are no parentheses after `isPassing` in the call: we hand over the function and let `countWhere` call it.

A test that you need once does not need a name; write it inline, as you did with `filter`.
This one also prints every time it is asked, so that you can watch `countWhere` call it.

```js file="src/main.js" action="append"

const belowEighty = countWhere(scores, (score) => {
  console.log("countWhere asked about", score);
  return score < 80;
});
console.log("Below 80:", belowEighty);
```

Run the code.
Five lines, `countWhere asked about 92` down to `countWhere asked about 61`, print before `Below 80: 3`.
You wrote the callback, but you never called it; `countWhere` did, from inside its loop, once per score and in the order of the list, and only when it had finished did it return the count.

Last, compare with the built-in method you already know.

```js file="src/main.js" action="append"

console.log("Passing with filter:", scores.filter(isPassing).length);
```

`filter` is a function on every array that takes a callback the same way `countWhere` does, calls it with each item, and keeps the items for which it returned `true`.
`Passing with filter: 4` agrees with `countWhere`, because both run the same test.

A function that takes another function as an argument is called a **higher-order function**, and `countWhere`, `map`, `filter`, and `forEach` are all examples.
The split is useful: the higher-order function owns the loop, and the callback owns the decision, so one loop serves every test you will ever write.
The browser uses the same split on a larger scale: in the DOM topic you hand a function to `addEventListener`, and the browser calls it every time the user clicks, the way `countWhere` called the test for every score.

One mistake to try on purpose.
In the `Passing` line, change `isPassing` to `isPassing()` and run.
The console shows `TypeError: test is not a function` with an **uncaught** badge, and none of the lines after it print.
The parentheses called `isPassing` right there, with no score, and handed `countWhere` its answer, `false`, instead of the function; the next step looks at this mistake closely.
Remove the parentheses again.

**If it breaks:** If the counts are `0`, check the `if (test(item))` line: the test must be called with `item`.
If every count is `5`, `count` is increased outside the `if`.
If the console shows `TypeError: test is not a function` for the `belowEighty` line, the arrow function is not inside the parentheses of the call; it is the second argument, after `scores` and a comma.

**Check:** Run the code.
The console shows `Passing: 4`, `Honors: 1`, the five `countWhere asked about` lines, `Below 80: 3`, and `Passing with filter: 4`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const scores = [92, 78, 55, 88, 61];

function isPassing(score) {
  return score >= 60;
}

function isHonors(score) {
  return score >= 90;
}

console.log("Scores:", scores);

function countWhere(list, test) {
  let count = 0;
  for (const item of list) {
    if (test(item)) {
      count = count + 1;
    }
  }
  return count;
}

console.log("Passing:", countWhere(scores, isPassing));
console.log("Honors:", countWhere(scores, isHonors));

const belowEighty = countWhere(scores, (score) => {
  console.log("countWhere asked about", score);
  return score < 80;
});
console.log("Below 80:", belowEighty);

console.log("Passing with filter:", scores.filter(isPassing).length);
```

</details>
