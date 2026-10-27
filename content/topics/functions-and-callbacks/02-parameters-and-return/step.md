---
title: Parameters and return
mode: edit
entry: index.html
required: [percent-returned, lab-percent, log-is-not-return]
---

The divider in Step 1 did the same thing every time.
Most functions take values in and hand a value back: this step writes `toPercent`, which turns points into a percentage for any quiz or lab you give it.
Watch two things: how the values in a call land in the function's names, and the difference between a function that **returns** a value and one that only prints it.

Press **Run** and the console shows `Quiz: 18 out of 20`.

```demo name="function-call"
```

Declare the function with two **parameters**, the names inside its parentheses.

```js file="src/main.js" action="append"

function toPercent(points, outOf) {
  return (points * 100) / outOf;
}
```

`points` and `outOf` are like variables that exist only inside this function, and they have no values yet.
`return` ends the function and hands the value after it back to whoever called it.

```predict
After the next edit, what does the console show for the quiz?
- `Quiz percent: 18`
= `Quiz percent: 90`
- `Quiz percent: undefined`
```

```js file="src/main.js" action="append"

const quizPercent = toPercent(quizPoints, quizOutOf);
console.log("Quiz percent:", quizPercent);
console.log("Lab percent:", toPercent(42, 50));
```

Run the code: `Quiz percent: 90` and `Lab percent: 84`.
Follow the first call one piece at a time.
The values in the parentheses of a call are its **arguments**, and they are matched to the parameters by position: the first argument, `18`, becomes `points`, and the second, `20`, becomes `outOf`.
The body runs with those values, computes `1800 / 20`, and `return` sends `90` back.
The whole expression `toPercent(quizPoints, quizOutOf)` is then replaced by `90`, and that is the value `quizPercent` stores.
The second call starts over with fresh values, `42` and `50`, and is used directly inside `console.log` without a variable in between.

Now a function that looks almost the same but prints its answer instead of returning it.

```predict
What does the last line of the console show after the next edit?
- `logPercent returned: 90`
- An error
= `logPercent returned: undefined`
```

```js file="src/main.js" action="append"

function logPercent(points, outOf) {
  console.log((points * 100) / outOf);
}

const logged = logPercent(9, 10);
console.log("logPercent returned:", logged);
```

Run it, and the console shows `90` on a line of its own and then `logPercent returned: undefined`.
`logPercent` printed the number while it ran, but it has no `return`, and a function without `return` hands back `undefined`.
Printing is for you to read; returning is for the rest of the program to use.
`toPercent` is the useful one, because its result can be stored, compared, or passed on, and the console line that prints it is a separate choice.

## Read more

The values a function needs should come in through its parameters, and the value it produces should go out through `return`.
That keeps the function honest about what it depends on, and it means you can call it with any quiz, not just the one in the variables at the top.
In Week 10 a React component works the same way: its props come in through its parameter, and the markup it returns is its return value.

Three mistakes to try on purpose, one at a time, putting each back afterwards.
Swap the arguments to `toPercent(quizOutOf, quizPoints)` and run: `Quiz percent: 111.11111111111111`, because the arguments are matched by position, not by name.
Leave out the second argument, `toPercent(quizPoints)`, and run: `Quiz percent: NaN`, because a parameter with no argument holds `undefined`, and `1800 / undefined` is not a number.
Add `console.log("after return");` on a new line after the `return` inside `toPercent` and run: it never prints, because `return` leaves the function on the spot.

**If it breaks:** If `Quiz percent` is `undefined`, the word `return` is missing inside `toPercent`.
If it is `NaN`, one of the arguments is missing or misspelled, so the parameter is `undefined`.
If the number is wrong, check the order of the arguments: points first, then the total.

**Check:** Run the code.
The console shows `Quiz percent: 90`, `Lab percent: 84`, a bare `90` from `logPercent`, and `logPercent returned: undefined`.
Press **Run checks** to confirm.

```quiz
After `function gap(a, b) { return a - b; }`, what is `gap(2, 10)`?
- `8`
= `-8`
- `NaN`
> Arguments are matched to parameters by position, so `a` is `2` and `b` is `10`.
```

```quiz
What does a function with no `return` hand back to its caller?
- `0`
= `undefined`
- `null`
> Printing inside the function is not returning; without `return`, the call is worth `undefined`.
```

<details>
<summary>src/main.js after this step</summary>

```js
const quizPoints = 18;
const quizOutOf = 20;

console.log("Quiz:", quizPoints, "out of", quizOutOf);

function toPercent(points, outOf) {
  return (points * 100) / outOf;
}

const quizPercent = toPercent(quizPoints, quizOutOf);
console.log("Quiz percent:", quizPercent);
console.log("Lab percent:", toPercent(42, 50));

function logPercent(points, outOf) {
  console.log((points * 100) / outOf);
}

const logged = logPercent(9, 10);
console.log("logPercent returned:", logged);
```

</details>
