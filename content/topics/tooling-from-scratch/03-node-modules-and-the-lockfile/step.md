---
title: node_modules and the lockfile
mode: edit
entry: index.html
required: [counts-packages, range-and-version, optional-packages]
links:
  - kind: reference
    title: "npm Docs: package-lock.json"
    url: https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/
---

This step reads the file npm writes when it installs a project, `package-lock.json`, and counts what is in it.
You asked for two packages in the last step, and npm installs every package those two need, and every package those need, all the way down.
Watch how much bigger the installed list is than the one you wrote.

```demo name="node-modules-tree"
```

The workspace has the `package.json` from the last step and, beside it, a `package-lock.json` that a real `npm install` of that project wrote.
The copy here leaves out two fields that the real file has on every package, the address it was downloaded from and a checksum that proves the download was not changed, so that it fits on the screen; everything else is as npm wrote it.
Press **Run**: the console shows `package.json asks for: ["ms","vite"]`.

Open `package-lock.json` and scroll through it once.
Under `"packages"`, the first key, `""`, is the project itself, and every other key is a folder path such as `node_modules/vite`: one entry per package npm put on disk.

```predict
How many packages does the lockfile record, not counting the project itself?
- `2`
= `41`
- `14`
```

```js file="src/main.js" action="append"

const installed = Object.keys(lock.packages).filter((path) => path !== "");
console.log("The lockfile records", installed.length, "packages");
```

Run it: `The lockfile records 41 packages`.
Two of them are the ones you asked for, and the other thirty-nine came along because something needed them.
They all land in one folder, `node_modules`, next to `package.json`, which is why that folder is large and why nobody reads it by hand.

The lockfile also answers a question the last step left open: which version did npm actually choose?

```js file="src/main.js" action="append"

const vite = lock.packages["node_modules/vite"];
console.log("vite: package.json allows", project.devDependencies.vite, "and npm chose", vite.version);
console.log("vite brings along:", Object.keys(vite.dependencies));
```

The square brackets are needed because the key contains a slash, which a dot cannot follow.
Run it: `package.json allows ^8.2.4 and npm chose 8.3.5`, the newest 8.x release on the day this lockfile was written.
`vite brings along` lists the five packages Vite itself depends on, among them `rolldown`, the bundler you meet in a later step, and `postcss`, which processes CSS; each of those has an entry of its own further down, with its own dependencies.

## Packages for one system only

Many of the entries have `"optional": true` and an `"os"` and `"cpu"` list.

```js file="src/main.js" action="append"

const everywhere = installed.filter((path) => !lock.packages[path].optional);
console.log("Installed on every computer:", everywhere.length);
console.log("Installed only on matching systems:", installed.length - everywhere.length);
```

Run it: 14 and 27.
Rolldown and Lightning CSS are written in Rust and shipped as compiled programs, one per operating system and processor, such as `@rolldown/binding-darwin-arm64` for a recent Mac and `@rolldown/binding-win32-x64-msvc` for most Windows laptops.
The lockfile lists them all, so that it works on every computer, and npm downloads only the one that matches yours.
That is one reason never to copy `node_modules` from one computer to another: the copy from a Mac does not run on Windows.

## Read more

### Why a lockfile

The range in `package.json` says what is allowed, and the lockfile says what was chosen.
When a classmate clones your project and runs `npm install`, npm reads the lockfile and installs exactly the versions in it, so the project runs the same on both computers even after newer versions come out.
`npm ci` goes one step further: it deletes `node_modules` and installs exactly what the lockfile says, failing if the lockfile and `package.json` disagree, which is what automated checks use.
So the rule is simple: commit `package.json` and `package-lock.json`, and never commit `node_modules`, which the `.gitignore` of every Vite project already excludes, because anyone can rebuild it from the two files in a few seconds.

**If it breaks:** If the count is `42`, the filter is missing, so the project's own `""` entry was counted.
If the console shows `Cannot read properties of undefined (reading 'version')`, the key was written with a typo or a dot, as in `lock.packages.node_modules/vite`; it must be the exact string `"node_modules/vite"` in square brackets.
If the last count is `0` and the first `41`, the filter kept the optional packages instead of dropping them; it needs the `!`.

**Check:** Run the code.
The console shows the two packages asked for, `The lockfile records 41 packages`, the range and the version for `vite`, its five dependencies, and the counts 14 and 27.
The three checks pass.

```quiz
Which files of a project do you commit to Git?
- All three: `package.json`, `package-lock.json`, and `node_modules`
= `package.json` and `package-lock.json`, but never `node_modules`
- Only `package.json`, because npm can work out the rest
> The two JSON files say what to install and exactly which versions; `node_modules` is rebuilt from them in seconds and differs from one operating system to another.
```

```quiz
Why does the lockfile list `@rolldown/binding-win32-x64-msvc` on a Mac?
- It is a mistake that npm makes on every Mac
= So that the same lockfile works on every computer; npm downloads only the package that matches yours
- Because Vite needs every platform's copy to build
> Optional platform packages are all recorded, and each install picks the one whose `os` and `cpu` match the computer it runs on.
```

<details>
<summary>src/main.js after this step</summary>

```js
import project from "../package.json";
import lock from "../package-lock.json";

const asked = [...Object.keys(project.dependencies), ...Object.keys(project.devDependencies)];
console.log("package.json asks for:", asked);

const installed = Object.keys(lock.packages).filter((path) => path !== "");
console.log("The lockfile records", installed.length, "packages");

const vite = lock.packages["node_modules/vite"];
console.log("vite: package.json allows", project.devDependencies.vite, "and npm chose", vite.version);
console.log("vite brings along:", Object.keys(vite.dependencies));

const everywhere = installed.filter((path) => !lock.packages[path].optional);
console.log("Installed on every computer:", everywhere.length);
console.log("Installed only on matching systems:", installed.length - everywhere.length);
```

</details>
