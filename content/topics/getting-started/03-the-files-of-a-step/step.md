---
title: The files of a step
mode: edit
entry: src/main.jsx
inspector:
  views: [boundaries, tree]
  watch: [App, TipList]
required: [tips-kept, tip-added]
files:
  src/tips.js: The tips the page lists, as an array of strings; this step's edit adds one.
  src/components/TipList.jsx: Draws any list of tips it is given, one list item for each tip.
---

A step's code is a small project: files in folders, each with one job.
This step reads that project in the tree beside the code, then adds one line to a file inside a folder.
Step through the picture first: it shows the same project in CS300 Practice, in the download, and on your computer after `npm install`.

```demo name="project-tree"
stage: In CS300 Practice
getting-started-3/
  index.html          The page the browser opens; React draws inside its root div
  styles.css          The page's styles, linked from index.html
  src/
    main.jsx          Finds the root div and renders App into it
    App.jsx           The top component; it imports the list and the tips
    tips.js           The tips the page lists; this step's edit adds one
    components/
      TipList.jsx     Draws any list of tips it is given
stage: In the download
+ package.json        The project's name, its scripts, and the packages it needs
+ vite.config.js      Vite's settings, with base "./" so the built site works at any address
+ .gitignore          Tells Git to leave node_modules and dist out of every commit
+ README.md           How to run the project and deploy it to GitHub Pages
+ .github/
+   workflows/
+     deploy.yml      The workflow that publishes the site to GitHub Pages
stage: After npm install
+ node_modules/       Every installed package; never edited, never committed
+ package-lock.json   The exact version npm chose for every package
```

The tree beside the code shows the same files as the first stage: folders first, then files, each level in name order.
The file that is open is selected, and the line under the tree says what it is for.
The editor opened `src/tips.js`, the file this step's edit changes, inside the `src` folder.

```predict
Which of these files is in the project you download but not in the editor?
- `src/App.jsx`
- `styles.css`
= `package.json`
```

The last node of the tree, **On your computer**, is closed at first.
Open it to see the files the download adds, such as `package.json` and `vite.config.js`, and the ones `npm install` and `npm run build` create there.
Select one and the line under the tree says what it is for and that it is not in CS300 Practice.

Now open `src/App.jsx` from the tree: it imports `TipList` from `./components/TipList.jsx` and the tips from `./tips.js`.
Then open `src/tips.js` again and add a fourth tip after the third.

```js file="src/tips.js" action="insert-after" anchor='  "Read the console when the result looks wrong.",'
  "Open a file from the tree beside the code.",
```

Run the code: the list on the page has four tips, and `tips.js` shows a dot in the tree because you edited it.

## Read more

### Moving around the tree from the keyboard

The tree is one stop of the Tab key.
Inside it, the Up and Down arrows move between entries, Right opens a folder or moves into it, Left closes a folder or moves to the folder above, Home and End jump to the first and last entry, and Enter or Space opens the selected file.
Typing a letter moves to the next entry whose name starts with it.

### More room for code

The **Files** button in the editor's header hides the tree and gives the code the whole width; press it again to bring the tree back.
CS300 Practice remembers the choice in this browser for every step.
On a phone the tree is a button above the code that names the open file; press it to open the tree, and choosing a file closes it again.

### The project you download

**Download this workspace** writes exactly the files the tree lists, with your edits, including the files under **On your computer**.
`node_modules`, `package-lock.json`, and `dist` are listed but not in the zip, because `npm install` and `npm run build` create them on your computer.

**If it breaks:** If the list shows only three tips, the new line went into another file or after the last line of `tips.js`; open `src/tips.js` from the tree and compare it with the panel at the end of this step.
If the result says **Did not compile**, check that the new line ends with a comma and sits inside the square brackets.

**Check:** Run the code.
The page lists four tips, the last one "Open a file from the tree beside the code.", and both checks pass.

```quiz
Where is `node_modules` in this step?
- In the editor, inside the `src` folder
- In the zip that Download this workspace writes
= Only on your computer, once `npm install` has run there
> The tree lists it under On your computer, and the download leaves it out: `npm install` creates it from `package.json`.
```

<details>
<summary>src/tips.js after this step</summary>

```js
export const tips = [
  "Read the explanation before you type.",
  "Run after every edit.",
  "Read the console when the result looks wrong.",
  "Open a file from the tree beside the code.",
];
```

</details>
