---
title: The console as a tool
mode: read
---

Every step in this topic read its result in the console, and so will most of the debugging you do from here on.
This page collects what the console can tell you and how to ask: how values print, what the levels mean, and how to read an error.

```predict
What does `console.log("names:", ["Ada", "Lin"])` show in this site's console pane?
- `names: Ada,Lin`
- `names: [Ada, Lin]`
= `names: ["Ada","Lin"]`
```

## Printing values

`console.log` takes any number of values and prints them separated by spaces.
Label everything: `console.log("score:", score)` tells you which value you are looking at when there are six lines of output, and `console.log(score)` does not.

A string prints as its text, a number as digits, `true`, `false`, `null`, and `undefined` as those words.
An array prints in brackets and an object with its keys, so `console.log("student:", student)` shows the whole object at once, which is faster than logging each property.
In this site's pane a string inside an array or an object keeps its quotes, which is how you tell `["5"]` from `[5]`.

`console.table(roster)` prints an array of objects as a table with one row per object and one column per key; in the browser's own console it is the quickest way to read a list.

## The levels

`console.warn` prints in yellow and `console.error` in red, and this site's console pane shows the level beside each line.
The browser itself uses the error level for the problems it finds in your code, which is why an error stands out from your own `log` lines.
When a step tells you to read the error, it is the red line.

## Reading an error

An error has three parts: a type, a message, and the place it happened.

```text
TypeError: email.length is not a function
    at src/main.js:12
```

The type narrows the cause.

| Type | Usually means |
| --- | --- |
| `ReferenceError: x is not defined` | A name is misspelled, or used before its `const` or `let` line, or declared inside a function and used outside it |
| `TypeError: x is not a function` | Something that is not a function was called, like `length()`, or a variable that holds a string was called like a function |
| `TypeError: Cannot read properties of undefined` | A dot was used on a value that is `undefined`: an index past the end of an array, a missing property, a function that returned nothing |
| `TypeError: Assignment to constant variable` | A `const` was reassigned; use `let` only if the value really must change |
| `SyntaxError` | The file does not parse: a missing bracket, quote, or parenthesis, or `=` where `===` belongs |

The message names the value or the operation.
The location is the file and line, and this site's console links it to the editor; fix the first error in the list, because one broken line often causes the ones below it.

## Read more

### Looking without an error

When the output is wrong but nothing is red, the bug is in a value, and the console is how you look at values.
Put a `console.log` with a label before the line you suspect, run, and compare what printed with what you expected.
Move it one line at a time until the value stops being what you expect; the bug is between the last good log and the first bad one.
This is the trace from Step 4, done with the console instead of a table.

`typeof` belongs in these logs: `console.log("score:", score, typeof score)` catches the string that should have been a number, which is the most common cause of a wrong result that raised no error.

### The browser's console and this site's

The CS300 Practice console pane shows everything your code logs while it runs in the result pane, with errors mapped to lines in the editor.
Your browser has the same console for every page: press F12 and open the **Console** tab.
There you can also type a line and press Enter to run it against the page, which is a fast way to test an expression such as `"5" + 3` or `names.slice(1)` before putting it in a file.

Three habits carry over.
Clear the console before a run so that old lines do not mix with new ones; this site does that for you on every **Run**.
Read errors from the top.
And delete the logs you added once the bug is gone, or your console fills with noise that hides the next one.

### What comes next

Everything so far printed to the console because the page had nothing to show.
The DOM topic connects this JavaScript to the page from the HTML topic: finding elements, changing their text, and responding to clicks, with the same console beside you.

**If it breaks:** If the browser console shows errors you did not cause, they belong to the page, not to you; filter the console to your own messages or clear it and run your line again.

**Check:** Open the browser's own console on this page with F12 and type `[1, 2, 3].map((n) => n * 10)`.
It prints `[10, 20, 30]`, and you have run JavaScript on a page that was not yours.

```quiz
The console shows `TypeError: Cannot read properties of undefined`; what usually caused it?
- A name is misspelled
= A dot was used on a value that is `undefined`, such as an index past the end of an array
- A `const` was reassigned
> A misspelled name is a `ReferenceError` and a reassigned `const` is `Assignment to constant variable`; reading a property of `undefined` is the error the index past the end causes a few lines later.
```
