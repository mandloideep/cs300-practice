---
title: A function remembers
mode: edit
entry: index.html
required: [remembers-the-line, two-checkers, reads-the-current-value]
---

Step 3 called the inner function while the outer one was still running.
This step returns the inner function instead, so that it is called **after** the outer function has finished, and asks whether it can still see the outer function's variables.
It can, and a function together with the variables it keeps from around it is called a **closure**.

**We used this in:** [Functions and callbacks](#/topic/functions-and-callbacks) passed a test function to `countWhere` and to `filter`; here a function builds those test functions for you.

Press **Run** and the console shows the five scores.

Write a function that makes and returns a test, instead of running one.

```js file="src/main.js" action="append"

function makeAtLeast(line) {
  const check = (score) => score >= line;
  return check;
}
```

`makeAtLeast` does not compare anything.
It creates an arrow function, `check`, whose body uses `line`, a parameter of `makeAtLeast`, and then returns that arrow function without calling it.

Predict before you run: by the time `atLeast80(85)` runs, `makeAtLeast` has already returned, so does the console show `true`, `false`, or `ReferenceError: line is not defined`?

```js file="src/main.js" action="append"

const atLeast80 = makeAtLeast(80);
console.log("atLeast80 holds", atLeast80);
console.log("Is 85 at least 80?", atLeast80(85));
```

Run it: `atLeast80 holds [Function check]` and `Is 85 at least 80? true`.
The call `makeAtLeast(80)` ran, set `line` to `80`, built `check`, handed it back, and finished.
Normally a function's variables are gone when it returns, but `check` still needs `line`, so JavaScript keeps that `line` alive for as long as `check` exists.
When `atLeast80(85)` runs, the lookup from Step 3 walks out of `check`, into the scope of the `makeAtLeast` call that created it, and finds `line` still holding `80`.

Each call of the outer function makes a new scope, so each function it returns remembers its own values.

```js file="src/main.js" action="append"

const atLeast60 = makeAtLeast(60);
console.log("At least 80:", scores.filter(atLeast80));
console.log("At least 60:", scores.filter(atLeast60));
```

Run the code: `At least 80: [92,88]` and `At least 60: [92,78,88,61]`.
`atLeast80` and `atLeast60` are made by the same code, and they keep two different `line` variables, `80` and `60`, from two different calls.
Both go straight into `filter` as callbacks, because each is a function that takes a score and returns `true` or `false`.

A closure keeps the **variable**, not a copy of its value at the time the function was made.

Predict before you run: `withCurve` is created while `curve` is `0`, and `curve` changes to `5` before the call, so does the console show `78`, `83`, or `NaN`?

```js file="src/main.js" action="append"

let curve = 0;
const withCurve = (score) => score + curve;
curve = 5;
console.log("78 with the curve:", withCurve(78));
```

Run it: `78 with the curve: 83`.
The function did not save `0` when it was created; it reads `curve` each time it runs, and at that moment `curve` is `5`.
Keep this in mind for the last step of the topic, where several callbacks share one changing variable.

Closures are how a function carries information into a place where it will be called later without you passing it in.
`filter` calls `atLeast80` with one score and nothing else, and the closure supplies the `80`.
A timer callback or a click handler is called later still, often long after the code that made it has finished, and it uses the variables around it in exactly this way.
In React, every event handler you write inside a component is a closure over that component's props and state.

One mistake to try on purpose.
In `makeAtLeast`, change `return check;` to `return check(line);` and run.
The console shows `atLeast80 holds true`, and then `TypeError: atLeast80 is not a function` with an **uncaught** badge: the parentheses called `check` right away, the parentheses mistake from the last topic, so the factory returned a boolean instead of a function.
Put `return check;` back.

**If it breaks:** If `atLeast80 holds` shows `true` or `false`, `makeAtLeast` returns the result of calling `check` instead of `check` itself.
If both filtered arrays are the same, both checkers were made with the same number.
If the curve line shows `78`, the assignment `curve = 5;` comes after the `console.log` line instead of before it.

**Check:** Run the code.
The console shows `atLeast80 holds [Function check]`, `Is 85 at least 80? true`, the two filtered arrays, and `78 with the curve: 83`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const scores = [92, 78, 55, 88, 61];

console.log("Scores:", scores);

function makeAtLeast(line) {
  const check = (score) => score >= line;
  return check;
}

const atLeast80 = makeAtLeast(80);
console.log("atLeast80 holds", atLeast80);
console.log("Is 85 at least 80?", atLeast80(85));

const atLeast60 = makeAtLeast(60);
console.log("At least 80:", scores.filter(atLeast80));
console.log("At least 60:", scores.filter(atLeast60));

let curve = 0;
const withCurve = (score) => score + curve;
curve = 5;
console.log("78 with the curve:", withCurve(78));
```

</details>
