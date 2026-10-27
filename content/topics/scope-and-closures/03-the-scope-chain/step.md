---
title: The scope chain
mode: edit
entry: index.html
required: [section-line, seat-line, top-level-room]
---

A function body is a scope too, and functions can sit inside other functions, so scopes nest like boxes inside boxes.
This step builds three levels for a course roster, the file, a function for a section, and a function inside it for a seat, and has the innermost one use a name from each level.
Watch how JavaScript finds a name: it looks in the current box first and then walks outward, one box at a time, until it finds it.

Press **Run** and the console shows `CS300 section 2 meets in Room 201.`
Inside `describeSection`, three names are used: `section` is its parameter, `room` is declared in its body, and `course` is declared in neither place.
JavaScript did not find `course` inside the function, so it looked in the scope around it, the file, and found it there.

Add a function inside `describeSection`, just before its closing brace, and call it there.

Predict before you run: the new function declares only `seat`, so does its line show `Seat 14: CS300, section 2, Room 201.`, or `ReferenceError: section is not defined`?

```js file="src/main.js" action="insert-before" anchor="}"

  function describeSeat(seat) {
    console.log(`Seat ${seat}: ${course}, section ${section}, ${room}.`);
  }

  describeSeat(14);
```

Run it: `Seat 14: CS300, section 2, Room 201.`
Follow each name from the inside out.
`seat` is found at once, in `describeSeat`'s own scope.
`section` and `room` are not there, so the lookup moves one box out, to `describeSection`, and finds both.
`course` is not there either, so it moves out once more, to the file.
This path from the inside out is the **scope chain**, and it runs in one direction only: an inner function can see everything around it, and nothing outside can see in.

Now put a second `room` in the outermost box, at the top of the file, and print it from there at the end.

Predict before you run: there are now two variables named `room`, so does the seat line say `Room 201` or `Main hall`?

```js file="src/main.js" action="insert-after" anchor='const course = "CS300";'
const room = "Main hall";
```

```js file="src/main.js" action="append"
console.log("At the top level, room is", room);
```

Run the code.
The section and seat lines still say `Room 201`, and the last line says `At the top level, room is Main hall`.
The lookup stops at the **first** `room` it meets on the way out, which is the one in `describeSection`, so the one in the file is never reached from inside.
From the file itself, the lookup starts in the outermost box, where the only `room` is `Main hall`; the inner `room` is inside a box it cannot look into.

What decides the chain is where the code is **written**, not where it is called from.
`describeSeat` sees `section` and `room` because its text sits inside `describeSection`, and that would stay true if some other function ended up calling it.
This is why the next step works: a function carries its place in the chain with it.
In React, a click handler written inside a component sees that component's props and variables for the same reason.

Two mistakes to try on purpose, putting each back afterwards.
In `describeSection`, after the call `describeSeat(14);`, add `console.log(seat);` and run: `ReferenceError: seat is not defined`, because `seat` lives in the inner box and the lookup only walks outward.
At the end of the file, add `describeSeat(3);` and run: `ReferenceError: describeSeat is not defined`, because the function itself is a name declared inside `describeSection`.

**If it breaks:** If the console shows `section is not defined`, `describeSeat` was placed after the closing brace of `describeSection`, outside it, so `section` is not on its chain.
If the seat line never prints, the call `describeSeat(14);` is missing or sits outside `describeSection`.
If the section line says `Main hall`, the `const room = "Room 201";` line inside `describeSection` was removed.

**Check:** Run the code.
The console shows `CS300 section 2 meets in Room 201.`, `Seat 14: CS300, section 2, Room 201.`, and `At the top level, room is Main hall`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const course = "CS300";
const room = "Main hall";

function describeSection(section) {
  const room = "Room 201";
  console.log(`${course} section ${section} meets in ${room}.`);

  function describeSeat(seat) {
    console.log(`Seat ${seat}: ${course}, section ${section}, ${room}.`);
  }

  describeSeat(14);
}

describeSection(2);
console.log("At the top level, room is", room);
```

</details>
