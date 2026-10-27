---
title: "Strict Mode, the runaway effect, and when not to use one"
mode: read
---

Three things came up in this topic that deserve a page of their own: the doubled lines in the console, the loop we asked you not to try, and the question of whether a given piece of code should be an effect at all.
The explainer below shows the first of them, Strict Mode rendering a component twice in development, and the other two fold under Read more.

```demo name="strict-mode-double"
```

```predict
Under Strict Mode in development, what happens to an effect when its component first appears?
- It runs once, exactly as in production
- It runs twice, with no cleanup in between
= It runs, its cleanup runs, and it runs again
```

## Why everything runs twice on load

`src/main.jsx` wraps the app in `<StrictMode>`, as every Vite React project does.
In development, Strict Mode does two things on purpose.

1. It calls each component function twice per render and keeps the second result, to catch components that behave differently when called again.
2. When a component first appears, it runs each effect, then its cleanup, then the effect again.

The second one is why the Step 1 log appeared twice on load, and why the Week 10 fetch step showed an aborted request before the real one.
It is a feature: an effect that survives being run, cleaned up, and run again is an effect whose cleanup is complete.
An effect that adds a listener without removing it ends up with two listeners, a timer without a `clearTimeout` fires twice, and a request without an `abort` arrives twice.
Strict Mode makes those mistakes visible on the first load, in development only; the production build calls everything once.

So when you count console lines, count per action, not in total, and when a Strict Mode double run breaks your app, the answer is never to remove Strict Mode but to write the missing cleanup.

## Read more

### The runaway effect

Step 2 asked you not to drop the dependency array from an effect that sets state.
Here is what it looks like, so that you recognize it when it happens to you.

```jsx
useEffect(() => {
  setSavedAt(new Date());
});
```

The effect runs after every render, it sets state, the state change causes a render, the effect runs again, and the loop never ends.
The console repeats this line, and the browser tab gets slower with every second.

```text
Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render.
```

The message names both causes.
The first is the missing array.
The second is subtler: an array whose entry is a new object or a new array on every render, such as `[{ id }]` or `[items.filter(...)]`, because `Object.is` says a new object is never the old one.
Depend on the state value itself, `[items]`, not on something computed from it.

### When not to use an effect

Not everything that happens after a change is an effect.
Ask what the code reaches for.

| The code | Where it goes |
| --- | --- |
| Computes something from state or props, like the visible products or `titleTooShort` | The body of the component, as a plain `const` |
| Responds to the shopper doing something, like a click or a submit | The event handler |
| Reaches outside React, to `localStorage`, a timer, the window, the console, or a server | An effect |

The first row is the one people get wrong most.
Filtering the list in an effect and storing the result in state means two renders and a value that can fall out of step with its source, which `ProductList` has never needed: it filters during render and is always right.
If you can compute it, compute it.

### The three shapes of the second argument, once more

| Second argument | The effect runs | Typical use |
| --- | --- | --- |
| none | After every render | Almost never right |
| `[]` | After the first render only | Focus a field, add a window listener, start a request on load |
| `[value]` | After the first render and after any render where `value` changed | Save `value`, sync it to the page title, refetch for a new id |

### What comes next

Every effect in this topic reached outside through a browser API: the console, `localStorage`, a timer.
The next topic, [Refs and browser APIs](#/topic/refs-and-browser-apis), adds the two that need a handle on something React would otherwise hide: a DOM element to focus, and a value to remember between renders without rendering again.

**If it breaks:** If the doubled lines still bother you, open Step 4, add a product, and count the `Saved at` notices: one, because the cleanup from the first run cleared the timer the double run started.

**Check:** Without looking back, say what React does on the first load of a component with an effect under Strict Mode, and name the two causes in the runaway message.
If your answer has effect, cleanup, effect, and the words missing array and new object every render, you have it.

```quiz
Where does the list of products narrowed to the chosen category belong?
= In the body of the component, computed as a plain `const` during render
- In an effect that filters the list and stores the result in state
- In `localStorage`, so that it is ready on the next render
> The visible products are computed from `items` and `category`, so `ProductList` filters during render and is always right; an effect would cost a second render and could fall out of step with its source.
```
