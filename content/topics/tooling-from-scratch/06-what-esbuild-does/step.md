---
title: What esbuild does
mode: edit
entry: index.html
required: [badge-compiled, list-compiled, element-is-an-object]
---

This step prints a component the way the browser receives it, after a transformer has rewritten the JSX you typed.
Transforming is one of the two jobs a tool like esbuild does, and bundling, from two steps ago, is the other.
Watch what each tag you write turns into.

The workspace is a plain page whose script is `src/main.jsx`, a file with one small component, `Badge`, and one line that prints the function as text with `String(Badge)`.
In the lab, as in Vite, a `.jsx` file is transformed before it runs, so what prints is the function after the transform.

Predict before you run: does the console show the function with `<p className="badge">` as you wrote it, the function with a call such as `_jsxDEV('p', ...)` where the tag was, or a red `SyntaxError` because browsers cannot read JSX?
Press **Run**.
The console shows the second: the tag became a call, with the tag name as its first argument and an object of props as its second, `{ className: "badge", children: ["Now studying ", course] }`.
The text and the `{course}` inside the tag became the `children` list, in order.
The extra arguments after the props, `void 0, true, {fileName: ..., lineNumber: 2}`, are there only in development: they tell React which file and line made the element, which is how its warnings, and the lab's inspector, can point you at your own code.

A browser would indeed throw a `SyntaxError` at the first `<`, because JSX is not JavaScript.
The transformer is what makes it JavaScript.

Add a list of courses at the top and a component that renders it.

```jsx file="src/main.jsx" action="insert-before" anchor="function Badge({ course }) {"
const courses = ["CS200", "CS300", "CS315"];

```

```jsx file="src/main.jsx" action="insert-before" anchor="console.log(String(Badge));"
function CourseList() {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course}>{course}</li>
      ))}
    </ul>
  );
}

```

Print it too.

```jsx file="src/main.jsx" action="insert-after" anchor="console.log(String(Badge));"
console.log(String(CourseList));
```

Run it and read the second function.
The `<ul>` became one call, and its child is your own `courses.map(...)`, untouched, whose callback now returns a call for each `li`.
That is why `map` works inside JSX: the braces hold ordinary JavaScript, and the transformer only rewrites the tags around it.
Look for `key`: it is no longer among the props, but passed as its own argument, because React uses it to match list items and never hands it to the component.

The last edit calls `Badge` yourself, the way React will, and prints what comes back.

```jsx file="src/main.jsx" action="append"

const badge = Badge({ course: "CS300" });
console.log("type:", badge.type);
console.log("props:", badge.props);
```

Run it: `type: p` and `props: {"className":"badge","children":["Now studying ","CS300"]}`.
The call made an ordinary object that describes a paragraph; nothing is on the page yet.
React takes objects like this one from every component and decides what to put on the page, which is where [The React mental model](#/topic/react-mental-model) begins.

## esbuild, Oxc, Rolldown, and Sucrase

**esbuild** is a bundler and transformer written in Go and released in 2020, and it was many times faster than the JavaScript tools before it.
It does both jobs from one command, which is a good picture of each:

```bash
npx esbuild src/main.jsx --bundle --minify --outfile=dist/main.js
```

Without `--bundle`, it only transforms: one file in, the same file with JSX rewritten out, as you just saw.
With `--bundle`, it also follows every import, resolves bare names in `node_modules`, and writes one file with everything in it; `--minify` then removes spaces and shortens names.

Vite used esbuild for its transforms and for preparing packages from version 2 to version 7, and many tools still do; the React runtime this lab loads in the result pane is built with esbuild.
Vite 8 does the same two jobs with **Oxc** for the transform and **Rolldown** for the bundle, both written in Rust, and the output is the same shape you see here.
The lab transforms with **Sucrase**, a smaller transformer that is quick enough to run inside your browser on every **Run**; that is the `_jsxDEV` in your console.
A production build uses a lighter call, `jsx("p", { ... })` from `react/jsx-runtime`, with no file names or line numbers, because nobody reads warnings on a live site.

The names will keep changing, as they did between Vite 7 and Vite 8; the two jobs, transform and bundle, will not.

**If it breaks:** If the result says **Did not compile** with `Unexpected token`, a tag is not closed or a brace is missing, often the `)` that closes `map(`; compare with the panel below.
If the console shows `courses is not defined`, the `courses` line is missing or below the components that use it.
If `props` prints with `undefined` in it, the call passed `{ name: "CS300" }` or a plain string instead of `{ course: "CS300" }`.

**Check:** Run the code.
The console shows `Badge` and `CourseList` as transformed functions with calls in place of tags, then `type: p` and the props object.
The three checks pass.

<details>
<summary>src/main.jsx after this step</summary>

```jsx
const courses = ["CS200", "CS300", "CS315"];

function Badge({ course }) {
  return <p className="badge">Now studying {course}</p>;
}

function CourseList() {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course}>{course}</li>
      ))}
    </ul>
  );
}

console.log(String(Badge));
console.log(String(CourseList));

const badge = Badge({ course: "CS300" });
console.log("type:", badge.type);
console.log("props:", badge.props);
```

</details>
