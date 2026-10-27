---
title: Methods and this
mode: edit
entry: index.html
required: [method-reads-this, this-is-the-object-before-the-dot, wrapper-keeps-the-cart]
---

An object can hold a function too, and a function stored on an object is a **method**.
Inside a method, the word `this` means the object the method was called on, and this step shows that "called on" is decided at the moment of the call, not where the function was written.
Watch what happens when the same method is called on its cart, on another cart, and on nothing at all.

**We used this in:** [JavaScript basics](#/topic/javascript-basics), where `scores.map(double)` handed a function over without calling it; this step does the same with a method and finds out what it loses.

Press **Run**.
The console shows `Items in the cart: 2`.

```demo name="this-binding"
```

Give the cart a method.
The closing bracket of `items` gets a comma, and the method goes after it.

```js file="src/main.js" action="replace" anchor="  ]\n};"
  ],
  describe() {
    return `${this.owner} has ${this.items.length} items in the cart`;
  }
};
```

`describe() { ... }` is the short way to write `describe: function () { ... }`, a key whose value is a function.
Inside it, `this.owner` and `this.items` read properties of whatever object `describe` is called on.

```predict
What does the console show for `cart.describe()`?
- `undefined has undefined items in the cart`
= `Alice has 2 items in the cart`
- `TypeError: Cannot read properties of undefined (reading 'owner')`
```

```js file="src/main.js" action="append"

console.log(cart.describe());
```

Run the code, and the console shows `Alice has 2 items in the cart`.
`cart.describe()` calls the method **on** `cart`, the object before the dot, so inside the call `this` is `cart`.

Now hand the same function to a second cart.

```predict
What does the console show for `bobsCart.describe()`?
- `Alice has 2 items in the cart`
= `Bob has 0 items in the cart`
- `TypeError: describe is not a function`
```

```js file="src/main.js" action="append"

const bobsCart = { owner: "Bob", items: [], describe: cart.describe };
console.log(bobsCart.describe());
```

Run the code.
The console shows `Bob has 0 items in the cart`.
`describe: cart.describe` copied an arrow to the very same function, as Step 1 copied an arrow to an object, but this time the call is `bobsCart.describe()`, so `this` is `bobsCart`.
The function does not remember which object it was written in; `this` comes from the call.

Last, take the method off its object and call it on its own.

```predict
What does the console show for `describeLater()`?
- `Later: Alice has 2 items in the cart`
= `TypeError: Cannot read properties of undefined (reading 'owner')`
- `Later: undefined has 0 items in the cart`
```

```js file="src/main.js" action="append"

const describeLater = cart.describe;
console.log("Later:", describeLater());
```

Run the code.
A red line with an **uncaught** badge says `TypeError: Cannot read properties of undefined (reading 'owner')`.
`describeLater()` has nothing before a dot, so it is called on no object, and in a module `this` is then `undefined`; the first thing the method does is read `this.owner`, and reading a property of `undefined` fails.
This is the situation that bites in real code, because handing a method to someone else to call later, such as `setTimeout(cart.describe, 100)` or a click listener, detaches it in exactly this way.

The fix is to hand over a small function that makes the call the right way.

```js file="src/main.js" action="replace" anchor="const describeLater = cart.describe;"
const describeLater = () => cart.describe();
```

Run the code, and the console shows `Later: Alice has 2 items in the cart`.
`describeLater` is now an arrow function that, whenever it is called, calls `cart.describe()` with `cart` before the dot, so `this` is `cart` every time.
In React you will write the same shape for a click: `onClick={() => cart.describe()}`.

## Read more

Another fix you will see is `cart.describe.bind(cart)`, which makes a copy of the function with `this` fixed to `cart`; the arrow wrapper says the same thing in a way that is easier to read.

Arrow functions themselves have no `this` of their own, which is why you should not write a method as one.
Try it: change `describe() {` to `describe: () => {`, run, and read the same `TypeError` from the very first call, because the arrow's `this` is the module's `this`, which is `undefined`; change it back.

Most of the React code in this course uses plain functions and objects rather than methods, so you will rarely write `this` yourself.
You will read it in older code and in libraries, and the rule is short: look at what is before the dot at the moment of the call.

**If it breaks:** If the console shows `SyntaxError` after the first edit, the comma after `]` is missing, or the method is outside the closing `};` of the cart.
If the first call shows `ReferenceError: owner is not defined`, the method reads `owner` without `this.` in front; a property is reached through its object, never by its bare name.
If `Later:` still shows the red `TypeError`, the line still reads `cart.describe` with no arrow; it needs `() => cart.describe()`, with the parentheses at the end.

**Check:** Run the code.
The console shows `Items in the cart: 2`, `Alice has 2 items in the cart`, `Bob has 0 items in the cart`, and `Later: Alice has 2 items in the cart`, with no red line.
Press **Run checks** to confirm.

```quiz
Inside a method, what is `this`?
- The object the method was written in
= The object before the dot at the moment of the call
- Always the browser window
> `bobsCart.describe()` described Bob with a function written inside Alice's cart, because `this` comes from the call.
```

```quiz
Which value can you hand to `setTimeout` so that `describe` still reads Alice's cart when it runs later?
- `cart.describe`
- `cart.describe()`
= `() => cart.describe()`
> The arrow calls `describe` with `cart` before the dot each time; `cart.describe` loses its object, and `cart.describe()` runs right away.
```

<details>
<summary>src/main.js after this step</summary>

```js
const cart = {
  owner: "Alice",
  items: [
    { title: "Notebook", price: 4.5, quantity: 2 },
    { title: "Pens", price: 3, quantity: 1 }
  ],
  describe() {
    return `${this.owner} has ${this.items.length} items in the cart`;
  }
};

console.log("Items in the cart:", cart.items.length);

console.log(cart.describe());

const bobsCart = { owner: "Bob", items: [], describe: cart.describe };
console.log(bobsCart.describe());

const describeLater = () => cart.describe();
console.log("Later:", describeLater());
```

</details>
