---
title: map and keys
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [TaskRow]
required: [three-rows, mark-done-marks-one, state-follows-the-task]
---

**We used this in:** [JavaScript basics](#/topic/javascript-basics/5), where `map` built a new array by calling a function once per item, and [Lists and keys](#/topic/lists-and-keys/2), where a key kept a row's input with its product.

This step removes the first task from a list and watches a "done" mark jump to a task nobody marked.
The list is built with `map`, which makes a new array of elements every render, and the bug is about how React matches the new array to the old one.
Watch which row is crossed out after you remove one.

```demo name="reconcile-keys"
```

Press **Run**: three tasks, each a `TaskRow` with its own **Mark done** button and its own `done` state, which you can see in the inspector's tree.
The checks mark the first task done and then press **Remove the first task**, so by the time you look, two tasks are left, and one of them is already crossed out.

Read that result: `Read the props chapter` was the task marked done, and it is gone, yet `Finish the cart lab` shows as done.
Press **Reset to starter**, **Run**, and try it by hand to be sure: mark the first task, remove the first task.

`tasks.slice(1)` is right: it returns a new array without the first task, and the inspector shows `tasks` with two items.
The problem is the key.
After the removal, `map` runs again and makes two elements, with keys `0` and `1`.
React compares them with the last render's elements, which had keys `0`, `1`, and `2`, and the keys say "the rows at 0 and 1 are still here, and row 2 is gone".
So React keeps the first `TaskRow`, with its `done` state of `true`, and gives it the next task's title, and it removes the last one.
State belongs to a component at a position in the tree, and the key is how React decides which position is which.

Key each row by something that belongs to the task instead of to its place.

```predict
With `key={task.id}`, you mark the first task done and remove it; which remaining tasks show as done?
- `Finish the cart lab`
= None of them
- Both of them
```

```jsx file="src/App.jsx" action="replace" anchor="        {tasks.map((task, index) => (\n          <TaskRow key={index} task={task} />"
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
```

Run it, mark the first task, and remove it.
The done task disappears, and the other two are not crossed out.
Now the new keys are `102` and `103`, React sees that `101` is gone, and it removes exactly that `TaskRow`, state and all.

## Read more

### Why React works this way

`map` knows nothing about React; it returns a fresh array of elements every render, just as it returned a fresh array of numbers in [JavaScript basics](#/topic/javascript-basics/5).
From one render to the next, React needs to know which element in the new array is the same thing as which element in the old one, so that it can keep state, focus, and typed text where they belong, and move or remove only what changed.
Position cannot tell it, because removing, sorting, or inserting moves every position after the change.
A key can, as long as it stays with the item: an id from the data, never the index, and never `Math.random()`, which would make every row new on every render.

Using the index as a key is safe only for a list that never changes order and never loses an item in the middle, and it is easier to use the id everywhere than to remember which lists those are.
React warns in the console when a key is missing, but it cannot warn about a key that is present and wrong, which is why this bug is silent.

**If it breaks:** If the wrong task is still crossed out, the key is still `index` or still depends on the position, such as `key={tasks.indexOf(task)}`.
If the console shows a warning about the `key` prop, the `key` attribute went on an element inside `TaskRow` instead of on the `TaskRow` in `map`.
If `index is not defined` appears, the callback lost its `index` parameter but the key still uses it.

**Check:** Run the code.
Marking the first task done marks only that row, and removing it leaves two tasks that are both unmarked.

```quiz
Which key keeps each row's state with its task when the list is sorted or an item is removed?
- `key={index}`
- `key={Math.random()}`
= `key={task.id}`
> An id travels with the item, so React matches each element to the same component after any change; the index stays with the position, and a random key makes every row new on every render.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

const startingTasks = [
  { id: 101, title: "Read the props chapter" },
  { id: 102, title: "Finish the cart lab" },
  { id: 103, title: "Review for the quiz" }
];

function TaskRow({ task }) {
  const [done, setDone] = useState(false);

  return (
    <li className={done ? "task task--done" : "task"}>
      <span>{task.title}</span>
      <button type="button" className="save" aria-pressed={done} onClick={() => setDone(!done)}>
        {done ? "Done" : "Mark done"}
      </button>
    </li>
  );
}

export default function App() {
  const [tasks, setTasks] = useState(startingTasks);

  return (
    <main>
      <h1>This week</h1>
      <p className="lead">{tasks.length} tasks left.</p>
      <button type="button" onClick={() => setTasks(tasks.slice(1))}>Remove the first task</button>
      <ul className="task-list">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </ul>
    </main>
  );
}
```

</details>
