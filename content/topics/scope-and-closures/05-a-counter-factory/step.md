---
title: A counter factory
mode: edit
entry: index.html
required: [shared-count-is-shared, alice-counts-up, bob-starts-at-one]
---

A closure can keep a variable that changes, not just one that holds a fixed line like `80`.
This step builds a **factory**, a function that makes counters, and uses it to give each shopper a cart count of their own.
Watch whether adding to one counter changes another's count.

Press **Run** and the console shows `Alice's cart: 1` and `Bob's cart: 2`.
That is the bug this step fixes: Bob added one item, and his cart says two.
`addToCart` keeps its count in `sharedCount`, a variable in the file's scope, so there is only one count, and every shopper adds to it.

Write a function that creates a fresh count each time it is called, and returns a function that adds to that count.

```js file="src/main.js" action="append"

function makeCartCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}
```

`count` is declared inside `makeCartCounter`, so every call of `makeCartCounter` creates a new `count` that starts at `0`.
The arrow function it returns adds one to that `count` and returns it, and, as in Step 4, it keeps `count` alive after `makeCartCounter` has returned.

Make one counter per shopper and call them in a mixed order.

Predict before you run: Alice adds twice and then Bob adds once, so does `Bob adds:` show `1`, `3`, or `0`?

```js file="src/main.js" action="append"

const aliceAdds = makeCartCounter();
const bobAdds = makeCartCounter();
console.log("Alice adds:", aliceAdds());
console.log("Alice adds:", aliceAdds());
console.log("Bob adds:", bobAdds());
console.log("Alice adds:", aliceAdds());
```

Run it: `Alice adds: 1`, `Alice adds: 2`, `Bob adds: 1`, `Alice adds: 3`.
The two calls of `makeCartCounter` made two separate scopes, each with its own `count`, and each returned function closes over its own.
Bob's call changed only Bob's `count`, and Alice's next call carried on from her own `2`.

Can other code reach a counter's `count` and change it?

```js file="src/main.js" action="append"

console.log("aliceAdds.count is", aliceAdds.count);
```

Run the code: `aliceAdds.count is undefined`.
`count` is not a property of the function; it is a variable in a scope that only the returned arrow function can see.
Nothing else in the file can read it or set it, so the only way to change Alice's count is to call `aliceAdds()`.
The shared version at the top has no such protection: any line in the file could write `sharedCount = 100`.

This is a common use of closures: data that belongs to one thing, kept private, and changed only through the function that owns it.
You will meet the same shape in Week 10, when React's `useState` gives each component a value it remembers and a function that changes it, and two copies of the same component on a page each keep a value of their own, the way `aliceAdds` and `bobAdds` do.
React stores that value for you rather than in a closure you write, but the idea of "one maker, many independent counters" is the one you just built.

Try the bug on purpose to see that the factory is what fixed it.
Move the line `let count = 0;` out of `makeCartCounter` to the line above `function makeCartCounter() {`, and run.
Now `Bob adds:` shows `3` and Alice's last line shows `4`, because there is only one `count` again, in the file's scope, and both functions close over the same variable.
Move the line back inside the function.

**If it breaks:** If every line shows `1`, the counter is made again before each call, as in `makeCartCounter()()`; make `aliceAdds` and `bobAdds` once and call them.
If `Bob adds:` shows `3`, the `let count = 0;` line is outside `makeCartCounter`.
If the console shows `TypeError: aliceAdds is not a function`, `makeCartCounter` returns the count instead of the arrow function; its `return` should be followed by `() => {`.

**Check:** Run the code.
The console shows the shared bug, `Alice's cart: 1` and `Bob's cart: 2`, then `Alice adds: 1`, `Alice adds: 2`, `Bob adds: 1`, `Alice adds: 3`, and `aliceAdds.count is undefined`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
let sharedCount = 0;

function addToCart() {
  sharedCount = sharedCount + 1;
  return sharedCount;
}

console.log("Alice's cart:", addToCart());
console.log("Bob's cart:", addToCart());

function makeCartCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}

const aliceAdds = makeCartCounter();
const bobAdds = makeCartCounter();
console.log("Alice adds:", aliceAdds());
console.log("Alice adds:", aliceAdds());
console.log("Bob adds:", bobAdds());
console.log("Alice adds:", aliceAdds());

console.log("aliceAdds.count is", aliceAdds.count);
```

</details>
