---
title: The event loop and batching
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, flash, tree]
  watch: [App]
required: [handler-sees-the-old-count, page-not-yet-updated, timer-sees-the-new-page]
---

**We used this in:** [Async and the event loop](#/topic/async-and-the-event-loop/2), where a timer's callback waited for the code running now to finish, and [State and useState](#/topic/state-usestate/3), where a setter scheduled the next render instead of changing the value.

This step prints what the page shows at three moments of one click: in the handler before the setters take effect, still in the handler after them, and in a timer the handler starts.
The answers show when React actually redraws, and why two setters in one handler cost one render.
Watch the order of the three lines in the console.

```demo name="event-loop"
```

Press **Run**.
The page starts at `Bottles of cooking oil: 0, $0.00`, and the checks press **Add a bottle** once, so it reads `Bottles of cooking oil: 1, $4.99` when you look and the console has `In the handler, count is 0`.
The handler calls two setters, `setCount` and `setTotal`, and then logs `count`, which is still this render's `0`, for the reason the closures step gave.

Now ask the page itself what it shows, inside the handler, right after the setters.

```jsx file="src/App.jsx" action="insert-after" anchor='    console.log("In the handler, count is", count);'
    console.log("In the handler, the page shows", document.querySelector(".count").textContent);
```

Reading the page with `document.querySelector` is not how a React component normally works, and you will not do it in your own components; here it is a measuring tool, the way a `console.log` is.

```predict
What does the new line inside the handler print after one click?
= The old number of bottles
- The new number of bottles
- An empty string, because the page is being redrawn
```

Run it and click **Add a bottle**.
It prints the old number: the setters have been called, and the page has not changed yet.

Then start a timer in the handler and ask the same question when it fires.

```jsx file="src/App.jsx" action="insert-after" anchor='    console.log("In the handler, the page shows", document.querySelector(".count").textContent);'
    setTimeout(() => {
      console.log("After a timer, the page shows", document.querySelector(".count").textContent);
    }, 0);
```

Run it and click.
The handler's two lines show the old number, and the timer's line, a moment later, shows the new one.
In the inspector, the header counts commits: each click adds exactly one, although the handler called two setters.

## Read more

### Why React works this way

A click is an event, and its handler is a callback that runs to the end before anything else on the page happens, the same rule as any other code on the call stack in [Async and the event loop](#/topic/async-and-the-event-loop/1).
A setter does not draw; it records the new value and asks React to render soon.
When the handler returns, React takes every update the handler asked for, `count` and `total` together, renders `App` once with both, and updates the page.
Only then does the event loop get to the timer, which is why its callback sees the new page even with a delay of `0`.

```demo name="setter-batching"
```

Gathering every update from one event into one render is called **batching**.
It means the page never shows a half-finished state, with a new count beside an old total, and it means three setters cost one render instead of three.
It is also the reason the closures step needed the function form of the setter: inside the handler, nothing has been applied yet, so each call has to say how to build on the one before.

**If it breaks:** If the result says `Cannot read properties of null (reading 'textContent')`, the selector does not match: it must be `".count"` with the dot, the class of the `span`.
If the timer's line shows the old number, it is not inside `setTimeout`, or it reads the `count` variable instead of the page.
If no timer line appears, the `setTimeout` call is missing its closing `}, 0);`.

**Check:** Run the code and click **Add a bottle**.
The console shows the old count twice from inside the handler and then the new count from the timer, and the inspector counts one commit for the click.

```quiz
A click handler calls three setters; how many times does React render the component for that click?
- Three times, once per setter
= Once, after the handler returns
- Once per setter, but only the last render is shown
> React batches every update from one event and renders once with all of them, which is why the page never shows a half-updated state.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);

  function handleAdd() {
    setCount(count + 1);
    setTotal(total + 4.99);
    console.log("In the handler, count is", count);
    console.log("In the handler, the page shows", document.querySelector(".count").textContent);
    setTimeout(() => {
      console.log("After a timer, the page shows", document.querySelector(".count").textContent);
    }, 0);
  }

  return (
    <main>
      <h1>Cart</h1>
      <p className="lead">
        <span className="count">Bottles of cooking oil: {count}</span>, ${total.toFixed(2)}
      </p>
      <button type="button" onClick={handleAdd}>Add a bottle</button>
    </main>
  );
}
```

</details>
