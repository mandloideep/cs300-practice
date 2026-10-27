---
title: Read the file by responsibility, then compare it with React
mode: read
---

There is nothing to type in this step.
Read the finished `app.js` from Step 9 by the job each section does, then set each section beside the React code that does the same job.
In a React project those sections become files that import each other, which is what the explainer below draws.

```demo name="module-graph"
```

Open the finished `app.js` from Step 9 and read it from top to bottom.
Because each step inserted its code in a deliberate place, the file is already organized by the job each section does.

| Section | Responsibility | Talks to |
| --- | --- | --- |
| Elements | Select the permanent parts of the page once | The document |
| Storage | Load and save bookmarks safely | `localStorage` |
| State | Record what the application knows; `setState` redraws | `render` |
| Components | Turn one book or a list into markup | State, for the saved flag |
| Views | Describe a whole screen from the same components | Components |
| Render | Read state and update the page; never request or save | Views and the elements |
| Requests | Fetch, check, and normalize data | The network |
| Actions | Change state around a request | Requests and `setState` |
| Events | Validate input and call actions | `FormData`, `dataset`, actions |
| Navigation | Choose the view from a button | `setState` |

```predict
On one bookmark click, which function writes the new array to `localStorage`?
- `render`, after it draws the shelf
= `saveBookmarks`, called from the click listener
- `setState`, before it calls `render`
```

Trace one bookmark click through the table: the click listener finds the button, builds a new bookmarks array, `saveBookmarks` writes it, `setState` records it, `render` draws the shelf, and the listener restores focus.
Nothing in `render` starts a request or writes to storage, which is why re-rendering is always safe.

## The same page in React

CourseHub is built again with React in Week 10.
Set the pieces side by side.

A component is a function from data to markup in both worlds.
The vanilla version returns a string and has to escape every value; the React version returns JSX, and React escapes for it.

```js
function bookCard(book, saved, number) {
  return `<article class="book-card">
    <h3>${escapeHTML(book.title)}</h3>
    <button type="button" data-action="bookmark" data-id="${escapeHTML(book.id)}"
      aria-pressed="${saved}">${saved ? "Saved - remove" : "Bookmark"}</button>
  </article>`;
}
```

```jsx
function BookCard({ book, saved, onToggle }) {
  return (
    <article className="book-card">
      <h3>{book.title}</h3>
      <button type="button" aria-pressed={saved} onClick={() => onToggle(book.id)}>
        {saved ? "Saved - remove" : "Bookmark"}
      </button>
    </article>
  );
}
```

The parameters became **props**, passed as attributes: `<BookCard book={book} saved={saved} onToggle={toggle} />`.
The `data-id` and the delegated listener are gone, because React lets a component attach its own handler and the handler already knows which book it belongs to.

State is one object with one way to change it in both worlds.
We wrote `setState` ourselves in Step 8, and every call ended in `render()`.
React gives each component `useState`, and calling the setter is what schedules the render.

```js
const state = { status: "initial", books: [], bookmarks: loadBookmarks() };
function setState(changes) {
  Object.assign(state, changes);
  render();
}
setState({ status: "loading" });
```

```jsx
const [status, setStatus] = useState("initial");
const [books, setBooks] = useState([]);
setStatus("loading");
```

`render` disappears as a function you call, because React calls the component again whenever its state changes, and it updates only the parts of the DOM that differ.

Everything else maps the same way.

| Vanilla CourseHub (Week 8) | React (Week 10 onward) | Concept |
| --- | --- | --- |
| `function bookCard(book, saved, number)` returning a string | `function BookCard({ book, saved })` returning JSX | Component |
| `state` object, `setState`, and `render` | `useState` and an automatic re-render | State |
| `bookCard(book, true, 1)` | `<BookCard book={book} saved={true} />` | Props |
| Template literals with `${}` and `escapeHTML` | JSX with `{}` and escaping built in | Templating |
| One click listener on `main` reading `dataset` | `onClick={handler}` on the element itself | Events |
| `browseView` and `bookmarksView` chosen by `state.view` | Components rendered by a `<Route>` | Routing |
| `saveBookmarks` called inside the handler | `useEffect(() => { ... }, [bookmarks])` | Side effects |
| Sections of one file | One `.jsx` file per component | Structure |

React removes the plumbing, not the concepts.
The components, the state, the props, the events, the views, and the sections are exactly what you just built and read, and the names will already be familiar when they come back as files in a Vite project.

## Read more

In [The React mental model](#/topic/react-mental-model) the study tracker was written twice: by hand, with `textContent` and `innerHTML`, and then with React.
CourseHub follows the same two paths, and the second one is Week 10.
Step 3 of that topic showed the partial update with the flash view: React changes only the parts of the DOM that differ.

**If it breaks:** If the mapping table feels abstract, open [The React mental model](#/topic/react-mental-model) Step 3 with **Flash** on and click the button while reading the State row again; the flash is the render that `setState` had to call for us.

**Check:** For each function in the finished `app.js`, say which section it belongs to without reading its body.
Then explain in two sentences why `render` never calls `fetch` or `localStorage.setItem`, and what React does for you that `setState` did by hand.
If your answers name the responsibility table and the automatic re-render, you have the model this topic is about.

```quiz
Which section of the finished `app.js` may call `fetch`?
- Render, because it draws the results
= Requests, which fetch, check, and normalize data
- Components, because each card needs its book
> Only `requestBooks` talks to the network, and only the action `searchBooks` calls it; `render` reads state and updates the page, which is why re-rendering is always safe.
```
