---
title: What each effect depends on
mode: read
---

The second defense question is about async data: when does a request start, what starts it again, and what happens to the old one.
In a React app the answer is almost always in an effect's dependency array, so the skill is to read that array and say which user actions change a value in it.
Step through the picture first: render, commit, the effect, and the cleanup that runs before the effect runs again.

```demo name="effect-timeline"
```

## The one effect in the app

Both pages load their data with `useFetch` in `src/useFetch.js`, the hook from [Route data and custom hooks](#/topic/route-data-and-custom-hooks/1).

```js
export function useFetch(url) {
  const [attempt, setAttempt] = useState(0);
  const [request, setRequest] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setRequest({ status: "loading", data: null, error: null });
    loadJson(url, controller.signal)
      .then((data) => {
        setRequest({ status: "success", data, error: null });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setRequest({ status: "error", data: null, error });
        }
      });
    return () => controller.abort();
  }, [url, attempt]);

  function retry() {
    setAttempt(attempt + 1);
  }

  return { status: request.status, data: request.data, error: request.error, retry };
}
```

The array is `[url, attempt]`, so a new request starts when the address of the data changes or when `retry` adds one to `attempt`, and at no other time.
`RecipePage` passes `recipeUrl(id)`, so its `url` changes exactly when the `id` in the address does.

## Trace it

```predict
On Tomato soup, `/recipes/1`, the user presses **Add ingredients to the list**. How many new requests start?
= None
- One, for `/recipes/1`, because `RecipePage` re-rendered
- Two, one for each page that uses `useFetch`
```

`App`'s state changed, so `App` and `RecipePage` re-render, and `useFetch` is called again with the same `url` string and the same `attempt`.
React compares each dependency with the last render's, finds no change, and skips the effect, so no request starts.
A re-render is not a reason to fetch; a changed dependency is.

```predict
On Tomato soup the user presses **Next recipe**, then presses the browser's **Back** while Pancakes is still loading. What happens to the request for Pancakes?
- It finishes, and Pancakes shows for a moment before Tomato soup
- It finishes, and React ignores it because the page changed
= The cleanup aborts it, and only the new request for `/recipes/1` can set the page's state
```

`url` changed, so React runs the cleanup from the last effect first, which aborts that effect's controller, and then runs the effect again for the new `url`.
Both addresses match the same route, so it is the same `RecipePage` with a new `url`; the aborted request rejects, and the `controller.signal.aborted` check keeps it from setting the error state, so a slow answer for Pancakes can never replace Tomato soup.

```predict
The user types `soup` into the search on the recipes page. How many requests start?
- One per letter typed
- One, after the last letter
= None
```

`RecipesPage` calls `useFetch(recipesUrl())`, whose address never changes; the search only filters the array that already loaded.

## Read more

### Two arrays that would be bugs

| Written as | What a user would see |
| --- | --- |
| `[]` | **Next recipe** changes the address to `/recipes/2`, but the page keeps showing Tomato soup, because the effect ran once and never again |
| No array at all | The effect runs after every render, its `setRequest` causes another render, and the requests never stop; the Network tab fills with them |

Both are on the Capstone brief's list of common mistakes, phrased as fetching on every render and as showing the first record whatever the `:id` says.

### Saying it in the defense

"`RecipePage` loads its recipe with `useFetch`, whose effect depends on the URL, which is built from the `id` in the address; when the id changes, the cleanup aborts the old request and the effect starts the new one."
Then open the Network tab, set it to Slow 4G, press **Next recipe** and then **Back** before the recipe loads, and show the cancelled row.

**Check:** You can say which user actions start a request in this app, why adding to the list does not, and what the cleanup does when the id changes during a request.
Then press **Mark this step as read**.

```quiz
Someone removes `attempt` from the dependency array. What stops working?
- The page no longer loads on the first visit
= **Retry**: `setAttempt` re-renders the page, but the effect does not run again, so no new request starts
- The cleanup, which no longer aborts anything
> A value the effect should react to must be in its array; `attempt` exists only so that a retry changes a dependency.
```
