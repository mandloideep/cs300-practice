---
title: String methods leave the original alone
mode: edit
entry: src/main.js
required: [methods-return-new-strings, chained-clean-email, search-and-slice]
---

This step cleans up a typed email address with the **string methods** you will reach for every week: functions attached to the value that you call with a dot.
Watch the original after each call: a string method returns a new string and leaves the one it was called on exactly as it was.

```demo name="string-immutability"
```

Press **Run**.
`rawEmail` is an address the way people type it: capital letters and a stray space at each end.
`Length: 25` counts those spaces, because `length` counts every character.

Clean it up.

```predict
After you append these three lines and run, what does the `Still raw:` line print after its label?
= The original address, with its spaces and capital letters
- The trimmed, lowercase address, because the two calls above changed it
- The trimmed address, still with its capital letters
```

```js file="src/main.js" action="append"

console.log("Trimmed:", rawEmail.trim());
console.log("Lowercase:", rawEmail.toLowerCase());
console.log("Still raw:", rawEmail);
```

Run the code.
`trim()` returns the address without the spaces and `toLowerCase()` returns it in small letters, and the third line prints the original with its spaces and capitals intact.

So to keep a result, assign it to a name.

```js file="src/main.js" action="append"

const email = rawEmail.trim().toLowerCase();
console.log("Clean:", email);
console.log("Clean length:", email.length);
```

`rawEmail.trim()` returns a string, and a string has `toLowerCase()`, so the two calls **chain**: the second runs on the result of the first.

Three more methods ask questions about a string or take a piece of it.

```predict
After you append these lines and run, what does `Position of @:` print for `alice.mandel@neiu.edu`?
= `12`
- `13`
- `14`
```

```js file="src/main.js" action="append"

console.log("Is an NEIU address:", email.includes("@neiu.edu"));
console.log("Position of @:", email.indexOf("@"));
console.log("First name:", email.slice(0, email.indexOf(".")));
```

`includes` answers with a boolean, `indexOf` with a position counted from `0`, and `slice(start, end)` with the characters from `start` up to but not including `end`.

## Read more

### Why the original stays the same

Most of the values a page handles are text: what someone typed into a field, what an API sent back, what goes into a heading.
A string method never changes the string it was called on; it returns a **new** string, and the old one is exactly what it was.
Strings are immutable, and so are numbers and booleans; this rule comes back when we reach arrays, which behave differently.

### The clean address

After the chain, `email` holds `alice.mandel@neiu.edu`, 21 characters, which is what a login check should compare against.

### Asking and slicing

`includes` returns a boolean: whether the text appears anywhere in the string.
`indexOf` returns the position where it starts, counting from `0`, or `-1` when it is not there; in the clean address `alice` and its dot fill positions `0` to `5`, `mandel` fills `6` to `11`, and the `@` is at `12`.
`slice(start, end)` returns the characters from `start` up to but not including `end`, so `slice(0, 5)` is the first five characters, and here `end` is the position of the first dot.

### A mistake to make on purpose

Change `email.length` to `email.length()` and run.
The console shows `TypeError: email.length is not a function`.
`length` is a property, a value stored on the string, not a method, so it takes no parentheses; put it back.

**If it breaks:** If `Still raw` prints the trimmed address, a line wrote `rawEmail = rawEmail.trim()`, which is reassignment, not mutation, and it also fails because `rawEmail` is a `const`.
If `Clean` still has capitals, the chain calls `trim()` only; add `.toLowerCase()` after it.
If `First name` prints nothing after its label, the dot is missing from the argument: `indexOf("")` is `0`, and `slice(0, 0)` is an empty string.

**Check:** Run the code.
The console shows the raw address, the trimmed and lowercased versions, the raw one again unchanged, the clean address with its length, `true`, `12`, and `alice`.
Press **Run checks** to confirm.

```quiz
After `const city = "Chicago";` and the line `city.toUpperCase();`, what does `console.log(city)` print?
= `Chicago`
- `CHICAGO`
- `undefined`
> `toUpperCase()` returns a new string, and the line throws it away; to keep it, assign it to a name, as in `const loud = city.toUpperCase();`.
```

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
