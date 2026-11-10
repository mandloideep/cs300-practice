---
title: Which route renders what
mode: read
---

The third defense question is about routes: for a given address, which component renders, what it reads from the address, and what a user sees for an address you did not plan for.
Answering it means reading the `Routes` as a table, the way React Router does, and checking the addresses a user can type, not only the ones your links produce.
Step through the picture with this app's routes, matching `/recipes/new`.

```demo name="router-match"
{
  "url": "/recipes/new",
  "routes": [
    { "path": "/", "element": "RecipesPage" },
    { "path": "/recipes/:id", "element": "RecipePage" },
    { "path": "/list", "element": "ShoppingListPage" },
    { "path": "*", "element": "NotFoundPage" }
  ]
}
```

## The route table

| Path | Element | Reads from the address |
| --- | --- | --- |
| `/` | `RecipesPage` | `?q=` with `useSearchParams` |
| `/recipes/:id` | `RecipePage` | `id` with `useParams` |
| `/list` | `ShoppingListPage` | Nothing |
| `*` | `NotFoundPage` | Nothing |

React Router ranks the routes by how specific they are, so the order in the file does not decide the match: a fixed segment such as `list` beats a parameter such as `:id`, and `*` matches only when nothing else does.

## Trace it

```predict
A user types `/recipes/new`. Which component renders?
- `NotFoundPage`, because there is no recipe called new
= `RecipePage`, with `id` equal to `"new"`
- `RecipesPage`, because the address starts with `/recipes`
```

`:id` matches any one segment, and `new` is one segment, so `RecipePage` renders and asks for `recipes/new.json`.
What the user then sees depends on the server: GitHub Pages answers 404, and the page shows **No recipe has the id new**, while the development server answers with `index.html`, which fails to parse and shows the error with **Retry**.
Neither is the not-found page, which is why "invalid route" and "invalid parameter" are separate checks in the Capstone.

```predict
A user types `/recipes`, with no id. Which component renders?
- `RecipesPage`
- `RecipePage`, with an empty `id`
= `NotFoundPage`
```

No route has the path `/recipes`: the list is at `/`, and `/recipes/:id` needs one more segment.
If `/recipes` should show the list, it needs a route of its own, and finding that before a user does is what the walk in [URL state](#/topic/url-state/4) is for.

```predict
A user types `/list/`, with a slash at the end. Which component renders?
= `ShoppingListPage`
- `NotFoundPage`
- `RecipePage`, with `id` equal to `"list"`
```

React Router ignores a trailing slash when it matches, so `/list/` is `/list`.

## Read more

### Every route from a direct address

The table is also a test plan: one direct address per row, plus one bad parameter and one address no row matches.
[Capstone release check](#/topic/capstone-release-check/2) walks that plan on a built site, where a refresh and a typed address reach the host before they reach React.

### Saying it in the defense

"Every address goes to `Routes` in `App`; `/recipes/2` matches `/recipes/:id`, so `RecipePage` renders and reads `2` with `useParams`, and builds the data address from it; an address nothing matches falls to `*` and `NotFoundPage`."
Then type a bad id and an unknown address into the deployed site and show both pages.

**Check:** For any address, you can name the route that matches, the component it renders, and what that component reads from the address, including `/recipes/new` and `/recipes`.
Then press **Mark this step as read**.

```quiz
You add `<Route path="/recipes/new" element={<NewRecipePage />} />` after the `/recipes/:id` route. What does `/recipes/new` render?
- `RecipePage`, because its route comes first in the file
= `NewRecipePage`, because a fixed segment ranks above a parameter
- Both, one after the other
> React Router picks the most specific match whatever the order, so `new` beats `:id`; the order matters only for routes that are equally specific.
```
