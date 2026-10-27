---
title: slice versus splice
mode: edit
entry: index.html
required: [slice-copies-a-range, splice-removes-in-place, splice-inserts, to-spliced-copies]
---

`slice` and `splice` differ by one letter and do opposite things to an array.
`slice` copies a range out and leaves the array alone; `splice` cuts items out of the array itself, or pushes new ones in, and hands back what it cut.
This step runs both on the office hours queue and prints the queue after each call, so you can see which one changed it.

Press **Run**.
The console shows `queue: ["Alice","Bob","Charlie","Diana","Eve"]`, five students waiting in order.

Take the first three with `slice`.

```js file="src/main.js" action="append"

const firstThree = queue.slice(0, 3);
console.log("First three:", firstThree);
console.log("Last two:", queue.slice(-2));
console.log("queue after slice:", queue);
```

Run the code.
`slice(0, 3)` copies from index `0` up to, but **not including**, index `3`, so it returns Alice, Bob, and Charlie; the second number is where to stop, not how many to take.
A negative index counts from the end, so `slice(-2)` returns the last two, Diana and Eve.
`queue after slice` still shows all five: `slice` returned new arrays and never touched `queue`.

Now `splice`, which takes a start index and a **count**.
Predict before you run: does `queue after splice:` show `["Alice","Bob","Charlie","Diana","Eve"]`, `["Alice","Diana","Eve"]`, or `["Bob","Charlie"]`?

```js file="src/main.js" action="append"

const helped = queue.splice(1, 2);
console.log("Helped:", helped);
console.log("queue after splice:", queue);
```

Run the code.
`Helped` is `["Bob","Charlie"]` and `queue` is now `["Alice","Diana","Eve"]`.
`splice(1, 2)` went to index `1` and removed two items from `queue` itself, then returned the removed items in a new array.
So the two calls look alike and are opposites: `slice` reads a range and copies it, and `splice` changes the array and tells you what it took.

`splice` can also insert.
Arguments after the count are items to put in at the start index.

```js file="src/main.js" action="append"

queue.splice(1, 0, "Frank");
console.log("Frank joins:", queue);
```

A count of `0` removes nothing, so `"Frank"` goes in at index `1` and everyone after him moves back one: `["Alice","Frank","Diana","Eve"]`.
`splice` is one method that removes, inserts, or replaces, depending on its arguments, and it always changes the array it was called on.

When you need the result of a `splice` without changing the original, `toSpliced` takes the same arguments and returns a new array.

```js file="src/main.js" action="append"

const afterAlice = queue.toSpliced(0, 1);
console.log("Next up:", afterAlice);
console.log("queue unchanged:", queue);
```

`afterAlice` is the queue without its first student, `["Frank","Diana","Eve"]`, and `queue` still starts with Alice.
`toSpliced` is to `splice` what `toSorted` was to `sort` in Step 2.
Older code reaches the same result with `queue.slice(1)`, everything from index `1` on, or with `filter`, as in `queue.filter((name) => name !== "Alice")`, which removes an item by its value wherever it is.

A mistake to try: change `queue.splice(1, 2)` to `queue.splice(1, 3)`, run, and see three students helped and only two left; the second argument of `splice` is a count, while the second argument of `slice` is an end index.
Change it back to `2`.

**If it breaks:** If `First three` has two names or four, check the end index: `slice(0, 3)` stops before index `3`.
If `queue after splice` still has five names, the line calls `slice` instead of `splice`.
If Frank replaces Diana instead of joining, the middle argument is `1` instead of `0`.
If `queue unchanged` is missing Alice, the line calls `splice` instead of `toSpliced`.

**Check:** Run the code.
The console shows the first three and the last two with the queue unchanged, `Helped: ["Bob","Charlie"]` with three students left, `Frank joins: ["Alice","Frank","Diana","Eve"]`, `Next up: ["Frank","Diana","Eve"]`, and the queue still starting with Alice.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const queue = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

console.log("queue:", queue);

const firstThree = queue.slice(0, 3);
console.log("First three:", firstThree);
console.log("Last two:", queue.slice(-2));
console.log("queue after slice:", queue);

const helped = queue.splice(1, 2);
console.log("Helped:", helped);
console.log("queue after splice:", queue);

queue.splice(1, 0, "Frank");
console.log("Frank joins:", queue);

const afterAlice = queue.toSpliced(0, 1);
console.log("Next up:", afterAlice);
console.log("queue unchanged:", queue);
```

</details>
