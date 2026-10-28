---
title: What to commit
mode: read
---

Not every file in a project folder belongs in its history.
A repository holds what a person wrote and what is needed to rebuild everything else, and nothing that a command recreates or that must stay secret.
Step through the Vite project in the picture as it grows, and decide for each file whether you would commit it before reading the rule below.

```demo name="project-tree"
```

## The rule

Commit a file when someone who clones the repository needs it and cannot recreate it with a command.

| File or folder | Commit it? | Why |
| --- | --- | --- |
| `index.html`, `src/`, `public/` | Yes | The code you wrote |
| `package.json` | Yes | The packages the project needs and its scripts |
| `package-lock.json` | Yes | The exact version of every package, so everyone installs the same thing |
| `vite.config.js` | Yes | How Vite builds this project |
| `.gitignore`, `README.md` | Yes | The rules for Git and the instructions for people |
| `node_modules/` | No | `npm install` recreates it from `package-lock.json`, and it holds thousands of files |
| `dist/` | No | `npm run build` recreates it from `src/` |
| `.env` with a password or a private key | Never | Anyone who can read the repository could use it |
| `.DS_Store`, `Thumbs.db`, `*.log` | No | Files your operating system or a tool wrote, not part of the project |

The lockfile row is the rule from [Tooling from scratch](#/topic/tooling-from-scratch/3): `package.json` says which packages the project accepts, and `package-lock.json` says which exact versions it got, so committing both is what makes `npm install` give a classmate the same `node_modules` you have.

## .gitignore

A file named `.gitignore` at the top of the project lists what Git should not offer to commit, one pattern per line.
The Vite projects you download from this site carry one:

```text
node_modules
dist
```

A name matches a file or a folder of that name anywhere in the project, `*.log` matches every file ending in `.log`, and a line starting with `#` is a comment.
An ignored file never shows up under "Untracked files" in `git status`, so `git add .` cannot add it by accident.

## Secrets never go in

A password, an API key with a secret part, or a private key must never be committed, not even for a minute.
Deleting the file in the next commit does not help: the commit that added it is still in the history, and anyone with a copy of the repository can read it.
If a secret was committed, treat it as public: replace it with a new one at the service that issued it, then remove it from the project.
The `.env` file a fetching step of this site writes holds only a public API address, which is why it is safe to keep.

## Read more

### This site's .gitignore

This site's own `.gitignore` begins like this:

```text
node_modules/
dist/
dist-d2l/
public/content/

# Playwright
test-results/
playwright-report/
```

`public/content/` is there because the content build writes it from the files under `content/` on every run, so committing it would only record the same change twice.
The trailing `/` makes a pattern match folders only.

### A file that was committed before it was ignored

`.gitignore` only affects files Git is not already tracking.
If `node_modules` was committed once, adding it to `.gitignore` does not remove it; `git rm -r --cached node_modules` removes it from the repository while leaving it on your disk, and the next commit records that.

### Checking before you commit

`git status` before every commit is the habit that catches mistakes.
A list of hundreds of new files usually means `node_modules` or `dist` is not ignored yet.

**Check:** For a Vite project, you can name the files you commit and the two folders you never commit, and say what `.gitignore` does.
Then press **Mark this step as read**.

```quiz
Which of these files of a Vite project do you commit?
- `node_modules/`, so that classmates skip `npm install`
= `package-lock.json`, so that everyone installs the same versions
- `dist/`, so that the built site is saved
> `npm install` rebuilds `node_modules` from the lockfile and `npm run build` rebuilds `dist`, so only the lockfile belongs in the history.
```

```quiz
You committed a file holding a password, then deleted it in the next commit. Is the password safe?
- Yes, it is gone from the project
- Yes, as long as nobody runs `git log`
= No, the earlier commit still holds it, so it must be replaced
> Every commit keeps its snapshot, so anything committed once can be read from the history; the only fix is a new password.
```

```quiz
`git status` lists 3,000 untracked files after `npm install`. What is missing?
= A `.gitignore` line for `node_modules`
- A commit of `package.json`
- A run of `npm run build`
> Without the ignore rule, Git offers every installed package as a new file.
```
