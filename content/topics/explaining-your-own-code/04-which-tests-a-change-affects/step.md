---
title: Which tests a small change affects
mode: read
---

The last part of the defense is a small change your instructor selects: you explain how you would make it, or make it, and say which checks it affects.
The first half is knowing where the behavior lives, which the last three steps practiced; the second half is knowing which tests look at it, before you run them.
This step reads the recipe app's tests as a map, predicts the effect of four changes, and ends with a short script for rehearsing on your own app.

## The tests

| File | Test | What it queries |
| --- | --- | --- |
| `src/RecipesPage.test.jsx` | lists every recipe | Three `listitem`s after a mocked `fetch` |
| `src/RecipesPage.test.jsx` | filters by name as the user types | The `searchbox` named Search, then two `listitem`s for `soup` |
| `src/RecipesPage.test.jsx` | shows Retry when the request fails | The `alert`, and the `button` named Retry |
| `src/RecipePage.test.jsx` | shows the recipe at its address | The `heading` Pancakes at `/recipes/2` |
| `src/RecipePage.test.jsx` | adds the ingredients when the button is pressed | The `button` named Add ingredients to the list, and that `onAdd` was called with the three ingredients |
| `src/App.test.jsx` | counts the items on the shopping list in the navigation | The same `button`, then the `link` named Shopping list (3) |
| `src/App.test.jsx` | shows Page not found for an unknown address | The `heading` Page not found at `/desserts` |

A test is affected by a change when the change alters something the test queries or something that produces it.

## Predict the effect of each change

```predict
The change: the button should say **Add to shopping list**. Which tests fail until they are updated?
- Only the `RecipePage` test that presses the button
= Two: the `RecipePage` test that presses it and the `App` test that counts the items
- None, because the button still calls `onAdd`
```

Both tests find the button by its name, so both fail with `Unable to find an accessible element with the role "button" and name "Add ingredients to the list"`, and both get the new name.
A change to a name a user sees reaches every test that uses that name, which is a reason to query by role and name: the tests fail exactly where a user would notice.

```predict
The change: the search should also match ingredients, so `onion` finds both soups. Which tests fail?
- The filter test, because the filter changed
= None; the existing filter test types `soup`, which still finds the same two recipes, so the new behavior needs a test of its own
- Every `RecipesPage` test
```

The filter test still passes, because names still match; nothing yet checks the new behavior.
Say so in the defense, and name the test you would add: type `onion`, expect the two soups.

```predict
The change: move `shoppingList` and its `useState` into `ShoppingListPage`. Which test fails first?
= The `App` test that counts the items, because the navigation no longer has the list to count
- The `RecipePage` test that presses the button
- None; the list page still shows the list
```

The `RecipePage` test still passes, because it gives the page its own `onAdd` and checks only that it was called.
The `App` test fails, and so would the app: the navigation cannot read state that lives in a page, and the list would be lost each time the user left the page, which is the quiz at the end of [Where each piece of state lives](#/topic/explaining-your-own-code/1).

```predict
The change: rename `handleAdd` to `addIngredients` in `App`. Which tests fail?
- The `App` test, because it adds ingredients
- Both tests that press the button
= None, because no test reads a function's name
```

## Read more

### A rehearsal script

Rehearse with your own Capstone open: the deployed site, the repository in Visual Studio Code with `npm run dev` running, a terminal for `npm test`, and your PDF.
Time yourself, and say each part out loud.

1. **The flow, on the deployed site:** who the user is, and the primary flow from the first page to the result, in under two minutes.
2. **One piece of state:** pick the most important value and give its row of your state map: where it lives, what changes it, and who reads it, with the file open at the line.
3. **One request:** the effect and its dependencies, then a failure on purpose: Offline in the Network tab, the error, and the recovery.
4. **One route:** a direct address with a parameter, a refresh, a bad id, and an address that matches nothing.
5. **One change:** pick a label, a message, or a validation rule; say which file and line change and which tests will fail; make the change, run `npm test`, and show that only those tests failed before you update them.

Do it twice: once on your own, and once with someone who picks the value, the route, and the change for you, because in the defense you will not pick them.

### When you do not know

"I am not sure; I would check by opening this file and looking for the state that this component reads" is an answer that shows you know how your app is put together.
Guessing confidently and being wrong shows the opposite.

**Check:** For each of the four changes, you can say which tests fail and why, and you have run the rehearsal script once on your own Capstone, timed.
Then press **Mark this step as read**.

```quiz
You are asked to change the not-found message from `Page not found` to `We could not find that page`. What do you say about the tests?
- Every test fails, because every page can show the not-found page
= One fails: the `App` test that looks for the heading Page not found; I update it after the change
- None fail, because the message is not part of any route
> Only one test queries that heading, so the change affects one test, and predicting it before running `npm test` is the evidence of knowing where the behavior lives.
```
