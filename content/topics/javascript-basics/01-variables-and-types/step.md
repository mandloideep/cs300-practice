---
title: Variables and types in the console
mode: edit
entry: src/main.js
required: [typeof-printed, score-reassigned, empty-values, template-literal]
---

**We used this in:** [HTML structure](#/topic/html-structure) built pages that do nothing after they load; this topic writes the language that makes a page do something, starting with values and the console that shows them.

This step declares a few variables, asks each one for its type, and prints the results in the **console pane** under the result, the only output in this topic.
Press **Run** and read the console: `Student: Alice` and `Score: 85`.

```predict
After you append the two `typeof` lines and run, what do they print?
= `studentName is a string` and `score is a number`
- `studentName is a Alice` and `score is a 85`
- `studentName is a text` and `score is a integer`
```

Open `src/main.js`.
Two **variables** hold the two values: `const` declares a name whose value will not be reassigned, and `let` declares one that will.
Every value has a **type**, and `typeof` tells you which.

```js file="src/main.js" action="append"

console.log("studentName is a", typeof studentName);
console.log("score is a", typeof score);
```

Run the code.
`studentName is a string`, because its value sits in quotes, and `score is a number`, because it does not.

`score` was declared with `let`, so it can take a new value.

```js file="src/main.js" action="append"

score = 90;
console.log("Score after the retake:", score);
```

Assignment is `=` with no keyword: the variable already exists, and this line changes what it holds.

Three more types.

```predict
After you append these lines and run, what does the `lastResult:` line print?
- `lastResult: null`
= `lastResult: undefined`
- `ReferenceError: lastResult is not defined`
```

```js file="src/main.js" action="append"

const isPassing = score >= 60;
let selectedTopic = null;
let lastResult;
console.log("isPassing:", isPassing, typeof isPassing);
console.log("selectedTopic:", selectedTopic);
console.log("lastResult:", lastResult);
```

`isPassing` is a **boolean**, `selectedTopic` is `null` because we set it to nothing on purpose, and `lastResult` is `undefined` because nothing was ever assigned to it.

The last line builds a sentence from values.

```js file="src/main.js" action="append"

console.log(`${studentName} scored ${score}.`);
```

A **template literal** is a string in backticks, and each `${...}` inside it is replaced by the value of the expression.
The backtick key sits under Escape on most keyboards, beside the number 1.

## Read more

### The console and the two keywords

The workspace has an `index.html` whose only job is to load `src/main.js`, so the result pane shows one sentence and nothing else happens there.
Everything in this topic happens in the console pane: `console.log` prints a value there, and it is how we look at what the code is doing.
`console.log` takes any number of values separated by commas and prints them with a space between, which is why the type lands after the label.
`const` is the default, and `let` is for the few values that genuinely change.

Try the reassignment with the name: add `studentName = "Bob";` on a line of its own, run, and the console shows `TypeError: Assignment to constant variable.` in red.
That is `const` doing its job; remove the line before going on.

### Booleans, null, and undefined

`score >= 60` is a comparison, and its value is a **boolean**: `true` or `false`, the type every decision in a program rests on.
`null` is a value you set on purpose to say "nothing here yet": the box is empty, and you emptied it.
`undefined` is what a variable holds before anything is assigned to it: the box was never filled.
Both print as plain words, and telling them apart matters when you read an error such as `Cannot read properties of undefined`.

### Before template literals

Before template literals this was `studentName + " scored " + score + "."`, which works and is harder to read.

**If it breaks:** A red line that says `is not defined` means a name is misspelled; JavaScript is case-sensitive, so `studentname` is not `studentName`.
`Assignment to constant variable` means a `const` was reassigned; only `score` changes in this step.
If the sentence prints `${studentName}` literally, the string is in ordinary quotes instead of backticks.

**Check:** Run the code and read the console from top to bottom.
It prints the two values, their types, the new score, the three empty-ish values, and the sentence `Alice scored 90.`
Press **Run checks** to confirm.

```quiz
`studentName` is declared with `const`; what happens when a later line runs `studentName = "Bob";`?
- The name changes to `Bob`, and the console shows it on the next log
- Nothing, because JavaScript ignores the line
= The console shows `TypeError: Assignment to constant variable.` in red
> `const` stops a name from being pointed at a new value; a value that has to change, like `score`, is declared with `let`.
```

<details>
<summary>src/main.js after this step</summary>

```js
const studentName = "Alice";
let score = 85;

console.log("Student:", studentName);
console.log("Score:", score);

console.log("studentName is a", typeof studentName);
console.log("score is a", typeof score);

score = 90;
console.log("Score after the retake:", score);

const isPassing = score >= 60;
let selectedTopic = null;
let lastResult;
console.log("isPassing:", isPassing, typeof isPassing);
console.log("selectedTopic:", selectedTopic);
console.log("lastResult:", lastResult);

console.log(`${studentName} scored ${score}.`);
```

</details>
