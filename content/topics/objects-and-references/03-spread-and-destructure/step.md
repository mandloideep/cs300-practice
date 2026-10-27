---
title: Spread and destructure
mode: edit
entry: index.html
required: [spread-makes-a-new-object, array-spread-adds, destructure-pulls-names, spread-is-one-level]
---

Step 1 ended with a question: how do you get a second, independent object instead of a second arrow to the first one?
This step answers it with **spread**, the three dots that copy an object's properties into a new object, and then does the opposite with **destructuring**, which pulls properties out into variables.
Watch the last edit closely, because spread copies only one level, and the level below is still shared.

Press **Run**.
The console shows Alice's object with three keys and the array `[85,92,73]`.

Predict before you run: after the first edit, does the console show `student after spread:` with a score of `85` or a score of `90`?

```js file="src/main.js" action="append"

const curved = { ...student, score: student.score + 5 };
console.log("curved:", curved);
console.log("student after spread:", student);
console.log("Same object?", curved === student);
```

Run the code.
`curved` has a score of `90`, `student` still has `85`, and `Same object?` is `false`.
The braces make a brand-new object, `...student` copies each of Alice's properties into it, and `score: ...` after the spread replaces the copied score, because when a key appears twice the later one wins.
This is the line you will write in React whenever one field of an object in state changes.

Spread works on arrays too.

```js file="src/main.js" action="append"

const moreScores = [...scores, 96];
console.log("moreScores:", moreScores);
console.log("scores after spread:", scores);
```

`[...scores, 96]` is a new array with the three old scores followed by `96`, and `scores` keeps its three.
`scores.push(96)` would have reached the same four numbers by changing `scores` itself, which is exactly what React state must never do.

**Destructuring** goes the other way: it names the pieces of an object or an array you already have.

```js file="src/main.js" action="append"

const { name, major } = student;
console.log(`${name} studies ${major}`);
const [firstScore, secondScore] = scores;
console.log("first two scores:", firstScore, secondScore);
```

`const { name, major } = student` makes two variables and fills each from the property with the same name, so it is a shorter way to write `const name = student.name;` and `const major = student.major;`.
With square brackets it reads by position instead: `firstScore` is element `0` and `secondScore` is element `1`.
You will meet both on nearly every page of React: `const [count, setCount] = useState(0)` destructures an array, and a component written as `function Card({ title })` destructures an object.

Now the limit.
Predict before you run: after the copy is changed, does `advisee` show `{"name":"Bob","advisor":{"name":"Lee","office":"Room 204"}}`, `{"name":"Robert","advisor":{"name":"Lee","office":"Room 310"}}`, or `{"name":"Bob","advisor":{"name":"Lee","office":"Room 310"}}`?

```js file="src/main.js" action="append"

const advisee = { name: "Bob", advisor: { name: "Lee", office: "Room 204" } };
const copy = { ...advisee };
copy.name = "Robert";
copy.advisor.office = "Room 310";
console.log("advisee:", advisee);
console.log("Same advisor?", copy.advisor === advisee.advisor);
```

Run the code.
Bob keeps his name, but his advisor's office is now `Room 310`, and `Same advisor?` is `true`.
**Spread copies one level only.**
It made a new outer object and copied each property into it, and the value of `advisor` is a reference, so what got copied is the arrow; both outer objects point to one advisor object, and changing it through `copy` changes it for `advisee`.

To change something one level down without touching the original, spread that level too.

```js file="src/main.js" action="append"

const moved = { ...advisee, advisor: { ...advisee.advisor, office: "Room 118" } };
console.log("moved:", moved.advisor.office, "advisee:", advisee.advisor.office);
```

The outer spread copies Bob, and the inner braces make a new advisor object with Lee's properties and a new office, so `moved` shows `Room 118` and `advisee` keeps `Room 310`.
Each level you want to change needs its own spread; levels you leave alone can stay shared, and that is fine as long as nobody changes them in place.

Two things to try.
Move the spread to the end, `{ score: student.score + 5, ...student }`, run, and see `curved` with `85`: the copied score came later, so it won; put the spread first again.
Then rename while destructuring with `const { name: studentName } = student;`, which makes a variable `studentName` from the property `name`, handy when a `name` already exists.

When you really need a full copy of nested data, `structuredClone(advisee)` copies every level, and Step 5 shows an older way with JSON; in React code you will mostly spread the one path you change.

**If it breaks:** If `student after spread` shows `90`, the line changed `student.score` instead of building `curved` with braces and `...student`.
If `curved` is missing `name` and `major`, the three dots are missing and the line made an object with only a score.
If the console shows `SyntaxError: Identifier 'name' has already been declared`, another line already declares `name`; rename the destructured one as described above.
If `moved` and `advisee` show the same office, the inner object is missing its own `...advisee.advisor` spread, or the line changes `advisee.advisor.office` directly.

**Check:** Run the code.
The console shows `curved` with `90` beside `student after spread` with `85` and `Same object? false`, the four and the three scores, `Alice studies Computer Science`, `first two scores: 85 92`, Bob with `Room 310` and `Same advisor? true`, and `moved: Room 118 advisee: Room 310`.
Press **Run checks** to confirm.

<details>
<summary>src/main.js after this step</summary>

```js
const student = { name: "Alice", score: 85, major: "Computer Science" };
const scores = [85, 92, 73];

console.log("student:", student);
console.log("scores:", scores);

const curved = { ...student, score: student.score + 5 };
console.log("curved:", curved);
console.log("student after spread:", student);
console.log("Same object?", curved === student);

const moreScores = [...scores, 96];
console.log("moreScores:", moreScores);
console.log("scores after spread:", scores);

const { name, major } = student;
console.log(`${name} studies ${major}`);
const [firstScore, secondScore] = scores;
console.log("first two scores:", firstScore, secondScore);

const advisee = { name: "Bob", advisor: { name: "Lee", office: "Room 204" } };
const copy = { ...advisee };
copy.name = "Robert";
copy.advisor.office = "Room 310";
console.log("advisee:", advisee);
console.log("Same advisor?", copy.advisor === advisee.advisor);

const moved = { ...advisee, advisor: { ...advisee.advisor, office: "Room 118" } };
console.log("moved:", moved.advisor.office, "advisee:", advisee.advisor.office);
```

</details>
