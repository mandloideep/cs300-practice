---
title: JSON in and out
mode: edit
entry: index.html
required: [stringify-makes-a-string, parse-makes-new-objects, json-drops-what-it-cannot-carry]
---

An object lives only while the page runs.
To save it in the browser or send it to a server, you turn it into text with `JSON.stringify`, and to use text that came back, you turn it into objects again with `JSON.parse`.
This step makes that round trip with a cart, then with an order that holds things JSON cannot carry, and watches what is missing on the way back.

Press **Run**.
The console shows the cart, `{"owner":"Alice","items":[{"title":"Notebook","price":4.5,"quantity":2},{"title":"Pens","price":3,"quantity":1}]}`.
This site's console prints every object in this compact form, which is JSON, so keep an eye on the types and not only on the text.

```demo name="json-roundtrip"
```

Turn the cart into text.

```predict
What does the console show for the type of `JSON.stringify(cart)`?
- `Type of text: object`
- `Type of text: json`
= `Type of text: string`
```

```js file="src/main.js" action="append"

const text = JSON.stringify(cart);
console.log("As text:", text);
console.log("Type of text:", typeof text);
console.log("text.owner:", text.owner);
```

Run the code.
`As text` looks exactly like the cart, but `typeof` says `string`, and `text.owner` is `undefined`, because a string has no `owner` key; it is one long line of characters that happens to spell an object.
**JSON** is that spelling: keys and strings in double quotes, numbers, `true`, `false`, `null`, arrays in brackets, and objects in braces, which is why every language can read it.

Now go back the other way.

```predict
After the restored copy's quantity is set to `5`, what does the console show for the original cart?
= `cart quantity: 2`
- `cart quantity: 5`
```

```js file="src/main.js" action="append"

const restored = JSON.parse(text);
console.log("Restored owner:", restored.owner);
console.log("Same object?", restored === cart);
restored.items[0].quantity = 5;
console.log("cart quantity:", cart.items[0].quantity);
```

Run the code.
`JSON.parse` read the text and built objects from it, so `restored.owner` is `Alice` again, `Same object?` is `false`, and the cart still has `2` notebooks.
Unlike the spread in Step 3, parsing builds new objects at **every** level, including the item inside the array, so nothing is shared with the original.

JSON has no spelling for some values.

```predict
Which keys does the order still have after the round trip through JSON?
- `Keys after: ["id","placed","coupon","formatTotal"]`
= `Keys after: ["id","placed"]`
- `Keys after: ["id"]`
```

```js file="src/main.js" action="append"

const order = {
  id: 17,
  placed: new Date("2026-10-27T15:00:00Z"),
  coupon: undefined,
  formatTotal: () => "$12.00"
};
const roundTrip = JSON.parse(JSON.stringify(order));
console.log("Keys before:", Object.keys(order));
console.log("Keys after:", Object.keys(roundTrip));
console.log("placed before:", typeof order.placed, "after:", typeof roundTrip.placed);
console.log("placed after:", roundTrip.placed);
```

Run the code.
`Object.keys` lists an object's key names in an array: four before the trip and two after it.
`formatTotal` is a function and `coupon` is `undefined`, and JSON has no way to write either, so `JSON.stringify` leaves those keys out without a word.
`placed` survives, but as a different type: a `Date` is an object before the trip and a `string` after it, the text `2026-10-27T15:00:00.000Z`.
Calling `roundTrip.placed.getFullYear()` would fail, because a string has no such method; when you load a date from JSON, you make a `Date` from the string again with `new Date(roundTrip.placed)`.

## Read more

You will meet JSON at both ends of every app you build this semester.
`localStorage` stores only strings, so next week you will save state with `JSON.stringify` and load it with `JSON.parse`.
`fetch` gets JSON text from a server, and its `response.json()` is a `JSON.parse` for you.

Two things to try.
Change the stringify line to `JSON.stringify(cart, null, 2)` and run: the text spreads over several lines with two spaces of indent, which is easier for a person to read and identical to the program; change it back.
Then add `JSON.parse("{owner: 'Alice'}");` at the end and run: a red `SyntaxError` appears, because JSON requires double quotes around every key and every string, and a parse of text that is not JSON throws; delete the line again.

**If it breaks:** If `Type of text` shows `object`, the line logs `typeof cart` or the stringify line is missing.
If `cart quantity` shows `5`, `restored` was made with `const restored = cart` instead of `JSON.parse(text)`, so it is a second arrow to the same cart.
If the console shows a red `SyntaxError` that mentions JSON, `JSON.parse` received something that is not JSON text, such as the cart object itself; pass it `text`.

**Check:** Run the code.
The console shows the cart as text, `Type of text: string`, `text.owner: undefined`, `Restored owner: Alice`, `Same object? false`, `cart quantity: 2`, four keys before and two after, `placed before: object after: string`, and the date as a string.
Press **Run checks** to confirm.

```quiz
What is `JSON.stringify({ coupon: undefined, total: 12 })`?
- `{"coupon":undefined,"total":12}`
= `{"total":12}`
- `{"coupon":null,"total":12}`
> JSON has no way to write `undefined`, so `JSON.stringify` leaves that key out without a word.
```

```quiz
After `JSON.parse(JSON.stringify(order))`, what type is the date that was in `order.placed`?
- `object`, still a `Date`
= `string`
- `number`
> A `Date` is written as text such as `2026-10-27T15:00:00.000Z`, and parsing gives that text back, not a `Date`.
```

<details>
<summary>src/main.js after this step</summary>

```js
const cart = {
  owner: "Alice",
  items: [
    { title: "Notebook", price: 4.5, quantity: 2 },
    { title: "Pens", price: 3, quantity: 1 }
  ]
};

console.log("cart:", cart);

const text = JSON.stringify(cart);
console.log("As text:", text);
console.log("Type of text:", typeof text);
console.log("text.owner:", text.owner);

const restored = JSON.parse(text);
console.log("Restored owner:", restored.owner);
console.log("Same object?", restored === cart);
restored.items[0].quantity = 5;
console.log("cart quantity:", cart.items[0].quantity);

const order = {
  id: 17,
  placed: new Date("2026-10-27T15:00:00Z"),
  coupon: undefined,
  formatTotal: () => "$12.00"
};
const roundTrip = JSON.parse(JSON.stringify(order));
console.log("Keys before:", Object.keys(order));
console.log("Keys after:", Object.keys(roundTrip));
console.log("placed before:", typeof order.placed, "after:", typeof roundTrip.placed);
console.log("placed after:", roundTrip.placed);
```

</details>
