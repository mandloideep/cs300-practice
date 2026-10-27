---
title: Functions are values
mode: edit
entry: index.html
required: [function-is-a-value, second-name, rules-in-an-array]
---

In JavaScript a function is a value, the same kind of thing as a number or a string: you can store it in a variable, give it a second name, and keep it in an array.
This step does all three with two grading rules, a curve and a cap.
Watch the difference between the name of a function on its own and the same name followed by parentheses; the rest of this topic depends on it.

Press **Run** and the console shows `Curved 80: 85`.
`addCurve(80)` is a call, so what reaches `console.log` is the number the function returned.

Predict before you run: after the next edit, does the line `The value itself:` show `85`, `[Function addCurve]`, or `undefined`?

```js file="src/main.js" action="append"

console.log("addCurve is a", typeof addCurve);
console.log("The value itself:", addCurve);
```

Run it: `addCurve is a function` and `The value itself: [Function addCurve]`.
Without parentheses, `addCurve` is not a call; it is the function itself, and the lab's console prints a function as its name in brackets.
`typeof` has a word for this type too, `function`, beside `string`, `number`, and `boolean` from [JavaScript basics](#/topic/javascript-basics).

Because the function is a value, assigning it to another variable gives the same function a second name.

```js file="src/main.js" action="append"

const adjust = addCurve;
console.log("Called through adjust:", adjust(70));
```

`const adjust = addCurve;` copies no code and runs nothing; both names now point at one function.
Calling `adjust(70)` runs the body of `addCurve` and prints `Called through adjust: 75`.

A function can also be written as an expression on the right of `=`, the way a number or a string is.

```js file="src/main.js" action="append"

const capAt100 = function (score) {
  return score > 100 ? 100 : score;
};
console.log("Capped 104:", capAt100(104));
```

This is a **function expression**: the keyword `function` with no name of its own, stored in a `const`.
It behaves like the declaration once it exists, so `capAt100(104)` returns `100`.
The one difference you will notice is that a function expression cannot be called above its line, because the `const` does not exist yet; a declaration can, as Step 1 showed.
The `? :` is the ternary operator from the roster dashboard: if the score is over 100, the value is `100`, and otherwise it is the score.

Last, put both rules in an array and apply them one after the other.

```js file="src/main.js" action="append"

const rules = [addCurve, capAt100];
let finalScore = 98;
for (const rule of rules) {
  finalScore = rule(finalScore);
}
console.log("After every rule:", finalScore);
```

The array holds two functions, not two results, because neither name has parentheses.
The loop takes each one in turn, calls it with the current score, and keeps what it returns: `98` becomes `103` with the curve and `100` with the cap.
Run the code and the console shows `After every rule: 100`.

Storing functions is not a trick for its own sake.
Once a function is a value, one piece of code can choose which function to run, or hand a function to another function and let that one decide when to call it.
The loop above already does a small version of that: it does not know what any rule does, only that each one takes a score and returns a score.
The next step writes a function that takes another function as its argument, which is exactly what `map` and `filter` did in JavaScript basics.

One mistake to try on purpose.
Change the array to `[addCurve(), capAt100()]` and run: `After every rule:` never prints, and the console shows `TypeError: rule is not a function` with an **uncaught** badge.
The parentheses called each function right away with no score, so the array held two results, `NaN` and `undefined`, and the loop tried to call a number.
Take the parentheses out again.

**If it breaks:** If `The value itself:` shows a number, the line has `addCurve()` with parentheses; the point is to log the function without calling it.
If the console shows `Cannot access 'capAt100' before initialization`, the call is above the `const capAt100` line; a function expression exists only from its line down.
If `After every rule:` prints `103`, the array has only `addCurve` in it.

**Check:** Run the code.
The console shows `addCurve is a function`, `The value itself: [Function addCurve]`, `Called through adjust: 75`, `Capped 104: 100`, and `After every rule: 100`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
function addCurve(score) {
  return score + 5;
}

console.log("Curved 80:", addCurve(80));

console.log("addCurve is a", typeof addCurve);
console.log("The value itself:", addCurve);

const adjust = addCurve;
console.log("Called through adjust:", adjust(70));

const capAt100 = function (score) {
  return score > 100 ? 100 : score;
};
console.log("Capped 104:", capAt100(104));

const rules = [addCurve, capAt100];
let finalScore = 98;
for (const rule of rules) {
  finalScore = rule(finalScore);
}
console.log("After every rule:", finalScore);
```

</details>
