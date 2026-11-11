---
title: Where each piece of state lives
mode: read
---

In the Capstone defense you will be asked to trace your own app: where a value lives, who can change it, and what re-renders when it changes.
The way to answer quickly is to have asked yourself first, and the way to practice is on code you did not write, where you cannot answer from memory.
This topic uses a small recipe app: a list of recipes with a search, a page for each recipe, and a shopping list that collects ingredients.
Step through the picture first: data goes down as props, and events come up as calls to functions a parent passed down.

```demo name="props-flow"
```

## The app

`src/App.jsx` holds the routes and one piece of state.

```jsx
export default function App() {
  const [shoppingList, setShoppingList] = useState([]);

  function handleAdd(ingredients) {
    const added = ingredients.filter((item) => !shoppingList.includes(item));
    setShoppingList([...shoppingList, ...added]);
  }

  function handleClear() {
    setShoppingList([]);
  }

  return (
    <>
      <nav className="site-nav" aria-label="Site">
        <NavLink to="/" end>Recipes</NavLink>
        <NavLink to="/list">Shopping list ({shoppingList.length})</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/recipes/:id" element={<RecipePage onAdd={handleAdd} />} />
        <Route path="/list" element={<ShoppingListPage items={shoppingList} onClear={handleClear} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}
```

`src/RecipePage.jsx` loads one recipe and keeps a number of servings.

```jsx
export default function RecipePage({ onAdd }) {
  const { id } = useParams();
  const { status, data, error, retry } = useFetch(recipeUrl(id));
  const [servings, setServings] = useState(2);

  return (
    <main>
      {status === "loading" && <p role="status">Loading recipe {id}...</p>}
      {status === "error" && error.status === 404 && <h1>No recipe has the id {id}</h1>}
      {status === "error" && error.status !== 404 && (
        <p role="alert">
          Could not load recipe {id}. {error.message}
          <button type="button" onClick={retry}>Retry</button>
        </p>
      )}
      {status === "success" && (
        <>
          <h1>{data.name}</h1>
          <label>
            Servings
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(event) => setServings(Number(event.target.value))}
            />
          </label>
          <ul>
            {data.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <button type="button" onClick={() => onAdd(data.ingredients)}>
            Add ingredients to the list
          </button>
          <p><Link to={`/recipes/${Number(id) + 1}`}>Next recipe</Link></p>
        </>
      )}
    </main>
  );
}
```

`src/RecipesPage.jsx` reads its search from the address, as [URL state](#/topic/url-state/1) did.

```jsx
const [searchParams, setSearchParams] = useSearchParams();
const query = searchParams.get("q") ?? "";
```

## Trace it

```predict
A user presses **Add ingredients to the list** on the Pancakes page. Which component's state changes?
- `RecipePage`'s, because the button is in `RecipePage`
= `App`'s, through the `onAdd` prop that `RecipePage` calls
- `ShoppingListPage`'s, because it shows the list
```

The button is in `RecipePage`, but the list is not: `RecipePage` only calls `onAdd`, which is `handleAdd` in `App`, and `handleAdd` calls `setShoppingList`.
`App` re-renders, so the navigation's count changes at once, and `RecipePage` re-renders with it, because it is a child of `App`.

```predict
A user sets **Servings** to 4 on Tomato soup, then presses **Next recipe**. What does the Servings box show on Pancakes?
- 2, because a new recipe starts with the default
= 4, because React keeps the same `RecipePage` and its state when only the id changes
- Nothing, because the box is empty while Pancakes loads
```

Both addresses match the same route, so React renders the same component at the same place in the tree and keeps its state; only `id` changed.
That is a fair defense question, and "I did not know" is a worse answer than "React keeps it, and here is how I would reset it": a small route component that reads `id` with `useParams` and renders `<RecipePage key={id} ... />` makes each recipe a new component, or the servings could move into the address.

## A state map

Write a map like this one for your own Capstone before the defense; it is the answer to "where does this live?" for every value.

| Value | Lives in | Changed by | Read by |
| --- | --- | --- | --- |
| The shopping list | `App`, `useState` | `handleAdd` and `handleClear`, passed down as `onAdd` and `onClear` | The navigation's count, `ShoppingListPage` |
| The search text | `?q=` in the address | `setSearchParams` in `RecipesPage` | `RecipesPage` only |
| The recipe being shown | `/recipes/:id` in the address | Any link to a recipe | `RecipePage`, through `useParams` |
| The recipe's data | `useFetch` inside `RecipePage` | The request, again when `id` changes or on Retry | `RecipePage` only |
| Servings | `RecipePage`, `useState` | The number box | `RecipePage` only |

## Read more

### Why the list lives in App

Two components that are not parent and child need the list: the navigation, which `App` renders, and `ShoppingListPage`.
State lives in the closest component above everything that reads it, which here is `App`, as [Events and lifting state](#/topic/events-and-lifting-state/2) showed.
The search is different: only one page reads it, and it belongs in the address so that a link can carry it.

### Saying it in the defense

A good answer names the component, the hook, and the path of a change: "The shopping list is `useState` in `App`, because the navigation and the list page both read it; the recipe page changes it by calling `onAdd`, which is `handleAdd`."
Then open the file and point at the line.

**Check:** For each row of the state map, you can say where the value lives and why, and you can explain why Servings keeps its value on the next recipe.
Then press **Mark this step as read**.

```quiz
The shopping list is lost whenever the user leaves the list page. Where was it most likely moved?
- Into the address, as `?items=`
= Into `ShoppingListPage`'s own `useState`, which is thrown away when its route stops rendering
- Into `App`, which renders on every page
> A component's state lasts as long as the component is rendered; a route that stops matching unmounts its page and its state with it.
```

```quiz
Which value could a user share in a link?
- The shopping list
- Servings
= The search text
> Only values in the address travel with a link; the search is `?q=`, and the other two live in component state.
```
