---
title: String methods leave the original alone
mode: edit
entry: src/main.js
required: [methods-return-new-strings, chained-clean-email, search-and-slice]
---

Most of the values a page handles are text: what someone typed into a field, what an API sent back, what goes into a heading.
A **string** comes with methods, functions attached to the value that you call with a dot, and this step uses the ones you will reach for every week.

Press **Run**.
`rawEmail` is an address the way people type it: capital letters and a stray space at each end.
`Length: 25` counts those spaces, because `length` counts every character.

Clean it up.

```js file="src/main.js" action="append"

console.log("Trimmed:", rawEmail.trim());
console.log("Lowercase:", rawEmail.toLowerCase());
console.log("Still raw:", rawEmail);
```

Run the code.
`trim()` returns the address without the spaces and `toLowerCase()` returns it in small letters, and the third line prints the original with its spaces and capitals intact.
A string method never changes the string it was called on; it returns a **new** string, and the old one is exactly what it was.
Strings are immutable, and so are numbers and booleans; this rule comes back when we reach arrays, which behave differently.

So to keep a result, assign it to a name.

```js file="src/main.js" action="append"

const email = rawEmail.trim().toLowerCase();
console.log("Clean:", email);
console.log("Clean length:", email.length);
```

`rawEmail.trim()` returns a string, and a string has `toLowerCase()`, so the two calls **chain**: the second runs on the result of the first.
`email` now holds `alice.mandel@neiu.edu`, 21 characters, which is what a login check should compare against.

Three more methods ask questions about a string or take a piece of it.

```js file="src/main.js" action="append"

console.log("Is an NEIU address:", email.includes("@neiu.edu"));
console.log("Position of @:", email.indexOf("@"));
console.log("First name:", email.slice(0, email.indexOf(".")));
```

`includes` returns a boolean: whether the text appears anywhere in the string.
`indexOf` returns the position where it starts, counting from `0`, or `-1` when it is not there.
`slice(start, end)` returns the characters from `start` up to but not including `end`, so `slice(0, 5)` is the first five characters, and here `end` is the position of the first dot.

One mistake to make on purpose: change `email.length` to `email.length()` and run.
The console shows `TypeError: email.length is not a function`.
`length` is a property, a value stored on the string, not a method, so it takes no parentheses; put it back.

**Check:** Run the code.
The console shows the raw address, the trimmed and lowercased versions, the raw one again unchanged, the clean address with its length, `true`, `12`, and `alice`.
Press **Run checks** to confirm.

**If it breaks:** If `Still raw` prints the trimmed address, a line wrote `rawEmail = rawEmail.trim()`, which is reassignment, not mutation, and it also fails because `rawEmail` is a `const`.
If `Clean` still has capitals, the chain calls `trim()` only; add `.toLowerCase()` after it.
If `First name` prints the whole address, `indexOf(".")` returned `-1` because the dot is missing from the argument.

<details>
<summary>src/main.js after this step</summary>

```js
const rawEmail = "  Alice.Mandel@NEIU.edu  ";

console.log("Raw:", rawEmail);
console.log("Length:", rawEmail.length);

console.log("Trimmed:", rawEmail.trim());
console.log("Lowercase:", rawEmail.toLowerCase());
console.log("Still raw:", rawEmail);

const email = rawEmail.trim().toLowerCase();
console.log("Clean:", email);
console.log("Clean length:", email.length);

console.log("Is an NEIU address:", email.includes("@neiu.edu"));
console.log("Position of @:", email.indexOf("@"));
console.log("First name:", email.slice(0, email.indexOf(".")));
```

</details>
