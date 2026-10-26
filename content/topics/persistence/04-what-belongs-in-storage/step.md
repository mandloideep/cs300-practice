---
title: What belongs in storage
mode: read
---

Three lines made the saved list survive a reload: a lazy initial state that reads, an effect that writes, and a version number on the shape.
Before you use the pattern in Assignment 4, here is where it fits and where it does not.

## The pattern in one place

```jsx
function readSavedIds() {
  const stored = localStorage.getItem("saved-for-later");
  if (!stored) return [];
  const data = JSON.parse(stored);
  return data.version === 1 ? data.ids : [];
}

const [savedIds, setSavedIds] = useState(readSavedIds);

useEffect(() => {
  localStorage.setItem("saved-for-later", JSON.stringify({ version: 1, ids: savedIds }));
}, [savedIds]);
```

| Line | Runs | Why that moment |
| --- | --- | --- |
| `useState(readSavedIds)` | Once, before the first render | The component needs its starting value before it can describe the page |
| The effect | After the first render and after every change to `savedIds` | Writing is a side effect, and the value is final only after the render |
| `data.version === 1` | On every read | Stored data outlives code, so the reader checks before it trusts |

## What localStorage is

- It stores strings only, under keys, for one site, in one browser, on one device.
- It holds about five megabytes per site, which is far more than a list of ids and far less than a photo library.
- It is synchronous: `getItem` and `setItem` return at once, which is why a lazy initializer can use them.
- It stays until the code removes the key, the shopper clears site data, or the browser decides it needs the space.
- Anyone with access to the browser can read it in the developer tools, so it is no place for a password or a token that should stay secret.

## What to keep there

Keep what the shopper would be annoyed to lose and that only concerns this browser: a draft they were typing, a filter they chose, the ids of things they marked, the theme they picked.
The lab keeps your progress the same way, as JSON under one key, with a version number, and offers an export because one browser is all it can see.

Do not keep what belongs to an account, what several devices must agree on, or what another person needs to see; that is a server's job, and Week 13 is about talking to one.
Do not keep what can be computed from something you already store, which is the same rule as for state: the ids are stored, the count is computed.

## Three mistakes to look for first

1. `useState(JSON.parse(localStorage.getItem(key)))` without the arrow function reads storage on every render and crashes when the key is missing.
2. Writing in the event handler instead of the effect works until a second place changes the state and forgets to write.
3. Reading a shape without a version check works until the shape changes, which it will.

## What comes next

Everything in this unit so far stayed inside the browser.
The next topic, Fetching and request states, sends the request to a server from an effect, and the same questions return in a new form: when does it run, what if the component is gone before the answer arrives, and what state does the page show in the meantime.

**Check:** Open the lab's own progress export, or any app you use that remembers you without an account, and say which of its data fits the table above and which should live on a server instead.
If you can name a version number in the stored shape, or say why one is missing, you have the idea.

**If it breaks:** If a stored value ever crashes a page you built, the fix is the one from Step 3: decide what the reader does with a shape it does not recognize, and make that decision before the first user has data to lose.
