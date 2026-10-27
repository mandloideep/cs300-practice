---
title: Write a first component
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, Greeting]
required: [three-greetings, greeting-components]
---

`App` is the component Vite gave us; this step writes one of our own, `Greeting`, in its own file, and uses it three times from `App`.
Watch the inspector's **Boundaries** view: nothing changes until `App` imports the new file, and then three `Greeting` outlines appear inside `App`.

```predict
After you write the function in `src/Greeting.jsx` and run, what changes on the page?
- One greeting appears under the heading
- The result shows an error, because `Greeting` is not used anywhere
= Nothing yet, because no file imports `Greeting.jsx`
```

## The component file

Open `src/Greeting.jsx`.
We started the file for you with only its last line, `export default Greeting;`, which promises other files a component named `Greeting`.
Write the function above that line.

```jsx file="src/Greeting.jsx" action="replace" anchor="export default Greeting;"
function Greeting() {
  return <h2>Hello, welcome to our site!</h2>;
}

export default Greeting;
```

`Greeting` takes nothing and returns one `<h2>` element, and what it returns is what will appear on the page.

## Use it from App

Open `src/App.jsx` and import the new component under the existing import.

```jsx file="src/App.jsx" action="insert-after" anchor='import { useState } from "react";'
import Greeting from "./Greeting.jsx";
```

`./` means the same folder as `App.jsx`, and the name after `import` is the name we use in JSX.

Now replace the heading with a new heading and three uses of the component.

```jsx file="src/App.jsx" action="replace" anchor="        <h1>Hello from App.jsx</h1>"
        <h1>My first component</h1>
        <Greeting />
        <Greeting />
        <Greeting />
```

`<Greeting />` looks like an HTML tag, but React sees the capital letter and calls our function.
Run the page with **Boundaries** on: three `Greeting` outlines appear inside the `App` outline, and the tree shows `App` with three `Greeting` children.

## Read more

### Three rules for a component

A React component follows three rules from our Week 10 notes:

1. Its name is in PascalCase, such as `Greeting`, because React treats lowercase tags such as `<h2>` as HTML elements and capitalized tags as components.
2. It is a function that returns JSX, and what it returns is what appears on the page.
3. It is exported, so that other files can import it.

### The details of each edit

A return value that fits on one line needs no parentheses; we add `( ... )` around JSX only when it spans several lines, as in `App`.
After the first edit nothing is on the page yet, because no file imports `Greeting.jsx`.

The lab needs the `.jsx` extension in the import path; Vite on your computer accepts `"./Greeting"` too, and our notes use both forms.
Because `Greeting.jsx` uses `export default`, we could choose any name after `import`, but matching the component name keeps the code readable.

Each `<Greeting />` is a separate instance of the component, which is why we can write it once and use it as many times as we like.
The `/` before `>` closes the tag, and JSX requires it for any element that has nothing inside.

**If it breaks:** If the console says `Greeting is not defined`, the function is missing from `src/Greeting.jsx` or its name is spelled differently from the export line.
If the console warns that `The tag <greeting> is unrecognized in this browser`, the tag in `App.jsx` starts with a lowercase letter; write `<Greeting />`.
If the result reports that it cannot find `./Greeting.jsx`, check the file name and the path in the import, including the capital G.
If nothing new appears and there is no error, the `<Greeting />` lines are probably missing from `App.jsx`.

**Check:** The result shows **My first component** and three lines reading **Hello, welcome to our site!**, and the inspector shows three `Greeting` components inside `App`.
The counter still counts, because we changed only the heading.
Press **Run checks** to confirm.

```quiz
What does React do with `<greeting />` written with a lowercase g?
- It calls the `Greeting` function anyway
= It treats it as an unknown HTML element and never calls `Greeting`
- It capitalizes the name and renders the component
> React reads a lowercase tag as an HTML element, so the browser gets an empty `<greeting>` element and the console warns that the tag is unrecognized; only a capitalized tag calls a component.
```

<details>
<summary>src/App.jsx after this step</summary>

```jsx
import { useState } from "react";
import Greeting from "./Greeting.jsx";

function App() {
  const [count, setCount] = useState(0);

  return (
    <section id="center">
      <div>
        <h1>My first component</h1>
        <Greeting />
        <Greeting />
        <Greeting />
        <p>
          Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
        </p>
      </div>
      <button type="button" className="counter" onClick={() => setCount((count) => count + 1)}>
        Count is {count}
      </button>
    </section>
  );
}

export default App;
```

</details>
