---
title: Operators, coercion, and baNaNa
mode: edit
entry: src/main.js
required: [strict-equality, plus-concatenates, explicit-conversion]
---

Arithmetic in JavaScript works the way you expect until a string gets involved, and then it works the way JavaScript expects.
This step walks through the operators and lands on the one famous surprise, so that you recognize it when it bites.

Press **Run**.
`*` multiplies, `%` gives the remainder of a division, and `**` raises to a power; `+`, `-`, and `/` are what they look like.
Parentheses override the usual order, so `(2 + 3) * 4` is `20` and `2 + 3 * 4` is `14`; when in doubt, add them.

Comparisons produce booleans.

```js file="src/main.js" action="append"

console.log("quantity > 2:", quantity > 2);
console.log("5 === 5:", 5 === 5);
console.log('5 === "5":', 5 === "5");
console.log('5 == "5":', 5 == "5");
```

Run the code.
`>` compares, and `===` asks whether two values are the same value **and** the same type, so `5 === "5"` is `false`: a number is not a string.
`==` with two signs converts the types first and then compares, so `5 == "5"` is `true`, and `0 == false` is `true` too.
We never write `==` in this course; `===` and `!==` say what we mean, and the surprises of `==` are the cause of bugs that take an afternoon to find.
The label strings on those lines sit in single quotes because they contain double quotes; either kind of quote makes a string.

Now the surprise.

```js file="src/main.js" action="append"

console.log('"5" + 3:', "5" + 3);
console.log('"5" - 3:', "5" - 3);
console.log('"b" + "a" + +"a" + "a":', "b" + "a" + +"a" + "a");
```

`"5" + 3` is `53`, a string, because `+` joins strings and, when one side is a string, it turns the other side into one too.
`"5" - 3` is `2`, a number, because `-` only does arithmetic, so it turns the string into a number instead.
This is **coercion**: the operator decides the type.
The third line is the one to remember.
`+"a"` with nothing on its left is a different operator, unary plus, which tries to turn `"a"` into a number and gets `NaN`, "not a number"; the `+` on each side of it then joins the pieces, and `"b" + "a" + NaN + "a"` is the string `baNaNa`.

Coercion is fine when you ask for it.

```js file="src/main.js" action="append"

const typed = "42";
console.log("typed + 1:", typed + 1);
console.log("Number(typed) + 1:", Number(typed) + 1);
console.log('Number(""):', Number(""));
console.log(`Number("abc"): ${Number("abc")}`);
console.log("0.1 + 0.2:", 0.1 + 0.2);
console.log("Rounded for display:", (0.1 + 0.2).toFixed(2));
```

Everything that arrives from a form field is a string, so `typed + 1` is `421`.
`Number(typed)` converts on purpose, and then `+ 1` adds.
Two edges to know: `Number("")` is `0`, not an error, so check for an empty field before converting it, and `Number("abc")` is `NaN`, the value you get from any arithmetic that made no sense.
The last pair is not a JavaScript bug but a fact about binary: `0.1 + 0.2` is `0.30000000000000004` in every language, so money is counted in cents and shown with `toFixed(2)`, which returns a string.

**Check:** Run the code.
The console shows `false` for `5 === "5"` and `true` for `5 == "5"`, `53` and `2`, `baNaNa`, `421` and `43`, `0`, `NaN`, the long decimal, and `0.30`.
Press **Run checks** to confirm.

**If it breaks:** If a line shows `SyntaxError`, a label string that contains double quotes is wrapped in double quotes; use single quotes around it.
If `baNaNa` comes out as `baaa`, the lonely `+` before the second `"a"` was dropped; it must read `+ +"a"`.
If `Number(typed) + 1` prints `421`, the conversion wraps the whole sum instead of `typed` alone.

<details>
<summary>src/main.js after this step</summary>

```js
const price = 10;
const quantity = 3;

console.log("Total:", price * quantity);
console.log("Remainder of 10 / 3:", 10 % 3);
console.log("2 to the 10th:", 2 ** 10);

console.log("quantity > 2:", quantity > 2);
console.log("5 === 5:", 5 === 5);
console.log('5 === "5":', 5 === "5");
console.log('5 == "5":', 5 == "5");

console.log('"5" + 3:', "5" + 3);
console.log('"5" - 3:', "5" - 3);
console.log('"b" + "a" + +"a" + "a":', "b" + "a" + +"a" + "a");

const typed = "42";
console.log("typed + 1:", typed + 1);
console.log("Number(typed) + 1:", Number(typed) + 1);
console.log('Number(""):', Number(""));
console.log(`Number("abc"): ${Number("abc")}`);
console.log("0.1 + 0.2:", 0.1 + 0.2);
console.log("Rounded for display:", (0.1 + 0.2).toFixed(2));
```

</details>
