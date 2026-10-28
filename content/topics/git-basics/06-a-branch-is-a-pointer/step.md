---
title: A branch is a pointer
mode: read
---

A **branch** is a name that points at one commit, and committing on a branch moves the name forward to the new commit.
That is all a branch is, which is why making one is instant and why Git users make one for every piece of work.
Press Step and watch the `add-react` name move with each commit while `main` stays put, then `main` move on its own, until the two have **diverged**.

```demo name="branch-and-merge"
{
  "main": ["Add the study plan page"],
  "branch": { "name": "add-react", "commits": ["Add a React project to the plan"] },
  "mainMovesAfterBranch": true
}
```

## main and HEAD

A new repository has one branch, `main`, and every commit you made so far moved `main` forward.
**HEAD** is Git's name for "where you are now": it points at the branch you are on, and the branch points at a commit.
That is what `(HEAD -> main)` in `git log --oneline` means:

```text
e12a937 (HEAD -> main) Add the study plan page
```

## Make a branch and switch to it

`git switch -c add-react` creates a branch named `add-react` at the current commit and moves HEAD onto it:

```text
Switched to a new branch 'add-react'
```

`git branch` lists the branches and marks the one you are on with `*`:

```text
* add-react
  main
```

Both names point at `e12a937` for now; nothing was copied, and the folder did not change.

## Commit on the branch

A commit made now goes onto `add-react`, and only `add-react` moves:

```text
[add-react 756f18c] Add a React project to the plan
 1 file changed, 1 insertion(+)
```

```text
756f18c (HEAD -> add-react) Add a React project to the plan
e12a937 (main) Add the study plan page
```

`main` still points at `e12a937`, so the work on `add-react` cannot disturb anything on `main` until you decide to merge it.

## Switch back

`git switch main` moves HEAD back to `main`, and Git rewrites the files in the folder to match `main`'s commit:

```text
Switched to branch 'main'
```

Open `src/main.js` now and the React line is gone; switch to `add-react` and it is back.
The work is not lost, it is in the commit `add-react` points at.

## Two branches that diverge

Commit on `main` now, and `main` moves to a new commit whose parent is `e12a937` as well:

```text
[main 483328b] Gray out the finished topics
 1 file changed, 1 insertion(+)
```

The two branches have **diverged**: each has a commit the other does not.
The next step brings them back together.

## Read more

### A branch for every piece of work

Because a branch costs nothing, a team keeps `main` working at all times and does every change, however small, on a branch of its own, named for what it does: `add-react`, `fix-footer-color`, `git-basics-topic`.
This site is built that way: each topic and each set of explainers was written on its own branch while others were written on theirs, and merged into `main` when it was ready and its checks passed.

### Switching with uncommitted changes

`git switch` refuses to switch when an uncommitted change would be overwritten, and says so:

```text
error: Your local changes to the following files would be overwritten by checkout:
	src/main.js
Please commit your changes or stash them before you switch branches.
Aborting
```

Commit the change on the branch it belongs to, or undo it, then switch.

### Older commands

`git checkout -b add-react` is the older way to write `git switch -c add-react`, and `git checkout main` the older way to write `git switch main`; tutorials use both.

**If it breaks:** `fatal: a branch named 'add-react' already exists` means the branch was made earlier; switch to it with `git switch add-react` instead.
`fatal: invalid reference: add-react` means there is no such branch; check the name with `git branch`.

**Check:** You can say what a branch is, what HEAD points at, and what happens to `main` when you commit on another branch.
Then press **Mark this step as read**.

```quiz
You are on `add-react` and make a commit. Which names move?
- `main` and `add-react`, because they share a history
= Only `add-react`, and HEAD with it
- None until you merge
> A commit moves only the branch HEAD points at; every other branch keeps pointing where it was.
```

```quiz
What does `git switch -c add-react` copy?
- Every file of the project into a new folder
- The last commit, under a new hash
= Nothing; it creates a new name pointing at the current commit
> A branch is a pointer, so creating one writes a name and nothing else.
```
