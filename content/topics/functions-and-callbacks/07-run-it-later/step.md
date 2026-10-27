---
title: Run it later with setTimeout
mode: edit
entry: index.html
required: [break-after-the-file, zero-delay-waits, named-callback-later]
links:
  - kind: reference
    title: "MDN: setTimeout"
    url: https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout
---

Every callback so far ran while the function you handed it to was still running: `countWhere` called its test during its loop and then returned.
This step hands a callback to the browser instead, with `setTimeout`, which runs a function after a delay.
Watch the order of the lines in the console, because a timer's callback runs only after the rest of the file has finished, even when the delay is zero.

Press **Run** and the console shows two lines of a study session: `Study timer set.` and `Reading the chapter.`

```demo name="event-loop"
```

`setTimeout` takes a function and a delay in milliseconds, and asks the browser to call the function once the delay is over.
Set a short break timer right after the first line.

```predict
After the next edit, where does `Break time.` appear in the console?
- Before `Reading the chapter.`
- Nowhere
= After `Reading the chapter.`
```

```js file="src/main.js" action="insert-after" anchor='console.log("Study timer set.");'
setTimeout(() => {
  console.log("Break time.");
}, 200);
```

Run the code, and `Break time.` comes last, a fifth of a second after the other two.
`setTimeout` does not wait.
It hands the arrow function to the browser, starts the clock, and returns at once, so the next line, `Reading the chapter.`, runs immediately.
When the 200 milliseconds are up, the browser calls the function you gave it.

What if the delay is zero?

```predict
After the next edit, where does `Zero delay, still after the file.` appear?
= After `Last line of the file.`
- Before `Last line of the file.`
```

```js file="src/main.js" action="append"

setTimeout(() => {
  console.log("Zero delay, still after the file.");
}, 0);
console.log("Last line of the file.");
```

Run it.
The order is `Study timer set.`, `Reading the chapter.`, `Last line of the file.`, then `Zero delay, still after the file.`, then `Break time.`
A delay of zero does not mean "now"; it means "as soon as the code that is running now has finished".
The browser keeps the timer callbacks that are due in a queue, and it does not look at that queue until the whole file has run to its last line.
Then it calls them in the order their delays run out: zero first, 200 milliseconds next.

The callback does not have to be an arrow written in place; any function works, passed without parentheses.

```js file="src/main.js" action="append"

function endSession() {
  console.log("Session over. Good work.");
}

setTimeout(endSession, 300);
```

Run the code, and `Session over. Good work.` is the sixth and last line, a little after the break.
This is Step 5 again: `setTimeout(endSession, 300)` hands over the function, and the browser calls it when the time comes.

The checks for this step wait until the last timer has fired before they read the console, so give them a moment after **Run**.

## Read more

`setTimeout` is your first callback that runs **later**, after your code has finished, and that idea runs through the rest of the course.
The DOM topic hands a function to the browser with `button.addEventListener("click", handleClick)`, and the browser calls it whenever the user clicks, which may be never or a hundred times.
React does the same with `onClick={handleClick}` on a button: you hand over the function, React calls it on each click.
And the fetch topic waits for a server the same way, with a callback that runs once the answer arrives.
In each case you write the function now, hand it over without parentheses, and something else decides when it runs.
How the browser keeps track of what to run next, the call stack and the queue, is the subject of a later topic on asynchronous code.

One mistake to try on purpose.
Change the last line to `setTimeout(endSession(), 300);` and run.
`Session over. Good work.` now prints right after `Last line of the file.`, before the zero-delay line, because the parentheses called `endSession` at once and handed `setTimeout` its return value, `undefined`, instead of the function.
Nothing runs when the 300 milliseconds are up, because there is no function to run, and the check for the last line fails.
Remove the parentheses again.

**If it breaks:** If `Break time.` prints second, the `console.log` is outside the arrow function, so it ran at once and only an empty function waited.
If a timer line never prints, check that the delay comes after the function, inside the parentheses of `setTimeout`, and is a number of milliseconds such as `200`.
If the session line prints before the zero-delay line, `endSession` has parentheses after it in the `setTimeout` call.

**Check:** Run the code and wait half a second.
The console shows `Study timer set.`, `Reading the chapter.`, `Last line of the file.`, `Zero delay, still after the file.`, `Break time.`, and `Session over. Good work.`, in that order.
Press **Run checks** to confirm.

```quiz
In what order do these lines print: `console.log("A"); setTimeout(() => console.log("B"), 0); console.log("C");`?
- `A`, `B`, `C`
= `A`, `C`, `B`
- `B`, `A`, `C`
> A zero delay still waits until the code that is running now has finished, so `C` prints before the timer callback.
```

```quiz
What does `setTimeout(endSession(), 300)` do?
- Runs `endSession` after 300 milliseconds
- Throws a `TypeError` after 300 milliseconds
= Runs `endSession` at once, and nothing runs after 300 milliseconds
> The parentheses call `endSession` on the spot and hand `setTimeout` its return value, `undefined`, instead of the function.
```

<details>
<summary>src/main.js after this step</summary>

```js
console.log("Study timer set.");
setTimeout(() => {
  console.log("Break time.");
}, 200);
console.log("Reading the chapter.");

setTimeout(() => {
  console.log("Zero delay, still after the file.");
}, 0);
console.log("Last line of the file.");

function endSession() {
  console.log("Session over. Good work.");
}

setTimeout(endSession, 300);
```

</details>
