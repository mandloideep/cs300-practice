---
title: Arrow functions
mode: edit
entry: index.html
required: [same-total-three-ways, braces-need-return, map-and-object]
links:
  - kind: reference
    title: "MDN: Arrow function expressions"
    url: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
---

An **arrow function** is a shorter way to write a function expression, and it is the form you will see most in modern JavaScript and in every React file.
This step takes one function from a shopping cart and rewrites it as an arrow, first with braces and then without, so that you can match each part of one form to the other.
Watch what happens to `return` when the braces go.

Press **Run** and the console shows `Function expression: 12`.
`lineTotal` is a function expression, as in Step 3: it multiplies an item's price by its quantity, and the notebook line is `4 * 3`.

```demo name="arrow-equivalence"
```

Rewrite it as an arrow function with braces.

```js file="src/main.js" action="append"

const lineTotalArrow = (item) => {
  return item.price * item.quantity;
};
console.log("Arrow with braces:", lineTotalArrow(cart[0]));
```

Compare it with `lineTotal` part by part.
The keyword `function` is gone.
The parameter list `(item)` stays where it was.
An arrow, `=>`, follows the parameters and points at the body.
The body in braces, with its `return`, is unchanged, and so is the result: `Arrow with braces: 12`.

When the whole body is one `return` of one expression, the arrow can be shorter still.

```js file="src/main.js" action="append"

const lineTotalShort = (item) => item.price * item.quantity;
console.log("Arrow without braces:", lineTotalShort(cart[0]));
```

Without braces, the expression after `=>` **is** the return value, so the word `return` goes too.
This is called a **concise body**, and it is the form that `(score) => score * 2` had in JavaScript basics.
The console shows `Arrow without braces: 12`, the same function written a third way.

The two shapes have one trap between them: braces with no `return`.

```predict
After the next edit, what does the line `Braces without return:` show?
- `12`
= `undefined`
- An error
```

```js file="src/main.js" action="append"

const forgotReturn = (item) => {
  item.price * item.quantity;
};
console.log("Braces without return:", forgotReturn(cart[0]));
```

Run it: `Braces without return: undefined`.
Once there are braces, the body is a list of statements like any function body, and a function body without `return` hands back `undefined`.
The multiplication still happens, and its result is thrown away.
The rule to remember: no braces, the value comes back by itself; braces, you write `return`.

Arrow functions are at their best as callbacks, where the short form reads as one idea.

```js file="src/main.js" action="append"

console.log("Line totals:", cart.map(lineTotalShort));
```

`map` calls `lineTotalShort` once per item and collects what it returns, so the console shows `Line totals: [12,6,24]`.

Last, an arrow that returns an object.

```js file="src/main.js" action="append"

const toSummary = (item) => ({ title: item.title, total: lineTotalShort(item) });
console.log("Summary:", toSummary(cart[2]));
```

The object is wrapped in parentheses, and that is not decoration.
Right after `=>`, a `{` always opens a body in braces, so JavaScript would read the object's braces as a function body; the parentheses tell it that the braces are a value.
The console shows `Summary: {"title":"USB drive","total":24}`.

## Read more

For the code in this course the two forms do the same job; the one difference that will matter is the keyword `this`, which a later topic on objects explains.
Two habits this course follows: keep the parentheses around a single parameter, as in `(item) =>`, even though JavaScript allows `item =>`, and write an empty pair, `() =>`, when there are no parameters, as in the wrapper from Step 5.
Whether a named function is a declaration or an arrow in a `const` is mostly a matter of taste, but a callback is almost always an arrow.
In Week 10, React components are often written as arrows too, `const CartItem = (props) => { ... }`, and the event handlers inside them almost always are.

One mistake to try on purpose.
In `toSummary`, delete the parentheses around the object, so that the line reads `(item) => { title: item.title, total: lineTotalShort(item) }`, and run.
The result pane says **Your code did not compile** and names the line, with `Unexpected token, expected ";"`, and the console stays empty, because a file that does not parse does not run at all.
JavaScript read the braces as a function body and could not make sense of `total:` inside it.
Put the parentheses back.

**If it breaks:** If a line shows `undefined`, that function has braces and no `return`; either add `return` or remove the braces.
If the result pane says the code did not compile, click the line it names and look for a missing `=>`, a missing `)`, or an object after `=>` without its parentheses.
If `Line totals` shows `[NaN,NaN,NaN]`, the function multiplies something other than `item.price` and `item.quantity`; check the spelling of both keys.

**Check:** Run the code.
The console shows `12` three times, once per form, then `Braces without return: undefined`, `Line totals: [12,6,24]`, and the summary of the USB drive.
Press **Run checks** to confirm.

```quiz
What does `const twice = (x) => { x * 2; };` return for `twice(4)`?
- `8`
- An error
= `undefined`
> With braces the body is a list of statements, and without `return` the function hands back `undefined`.
```

```quiz
Why is the object in `(item) => ({ title: item.title })` wrapped in parentheses?
- It is only a style choice
= So that the braces are read as an object, not as a function body
- So that the arrow runs at once
> Right after `=>`, a `{` always opens a body; the parentheses make it a value.
```

<details>
<summary>src/main.js after this step</summary>

```js
const cart = [
  { title: "Notebook", price: 4, quantity: 3 },
  { title: "Graph paper", price: 6, quantity: 1 },
  { title: "USB drive", price: 12, quantity: 2 }
];

const lineTotal = function (item) {
  return item.price * item.quantity;
};

console.log("Function expression:", lineTotal(cart[0]));

const lineTotalArrow = (item) => {
  return item.price * item.quantity;
};
console.log("Arrow with braces:", lineTotalArrow(cart[0]));

const lineTotalShort = (item) => item.price * item.quantity;
console.log("Arrow without braces:", lineTotalShort(cart[0]));

const forgotReturn = (item) => {
  item.price * item.quantity;
};
console.log("Braces without return:", forgotReturn(cart[0]));

console.log("Line totals:", cart.map(lineTotalShort));

const toSummary = (item) => ({ title: item.title, total: lineTotalShort(item) });
console.log("Summary:", toSummary(cart[2]));
```

</details>
