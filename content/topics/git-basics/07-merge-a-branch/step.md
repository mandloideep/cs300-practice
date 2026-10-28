---
title: Merge a branch
mode: read
---

Merging brings the commits of one branch into the branch you are on, and Git does it in one of two ways depending on whether your branch moved since the other one started.
If it did not, Git just moves the name forward, a **fast-forward**; if it did, Git makes a **merge commit** with two parents.
Press Step to the end of the picture, where `main` has not moved, and watch which kind of merge it draws.

```demo name="branch-and-merge"
{
  "main": ["Add the study plan page"],
  "branch": { "name": "add-react", "commits": ["Add a React project to the plan"] },
  "mainMovesAfterBranch": false
}
```

## Merge into the branch you are on

`git merge <branch>` brings `<branch>` into the branch HEAD is on.
So you first switch to the branch that receives the work, usually `main`, and then name the one that brings it:

```bash
git switch main
git merge add-react
```

## A fast-forward

When `main` has no commit of its own since `add-react` started, `add-react` is simply ahead of it, and Git moves `main` forward to the same commit:

```text
Updating e12a937..756f18c
Fast-forward
 src/main.js | 1 +
 1 file changed, 1 insertion(+)
```

No new commit is made, and the history stays one straight line:

```text
* 756f18c (HEAD -> main, add-react) Add a React project to the plan
* e12a937 Add the study plan page
```

## A merge commit

When `main` moved too, as at the end of the last step, neither branch contains the other, and Git makes a new commit that joins them.
It combines the two sets of changes, and because they touched different files, `src/main.js` on one side and `styles.css` on the other, it can do that on its own:

```text
Merge made by the 'ort' strategy.
 src/main.js | 1 +
 1 file changed, 1 insertion(+)
```

`git log --oneline --graph` draws the shape of the history in the left margin:

```text
*   513db4a (HEAD -> main) Merge branch 'add-react'
|\  
| * 756f18c (add-react) Add a React project to the plan
* | 483328b Gray out the finished topics
|/  
* e12a937 Add the study plan page
```

Each `*` is a commit, read from the bottom up.
The `|/` is where `add-react` started from `e12a937`, the two columns are the two branches side by side, and the `|\` above them is the merge commit `513db4a`, whose **two parents** are `483328b` and `756f18c`.

Git opens an editor for the merge commit's message, which starts as "Merge branch 'add-react'"; save and close it to finish, or write `git merge --no-edit add-react` to keep that message without the editor.

## Delete the merged branch

Once its commits are in `main`, the branch name has done its job:

```text
Deleted branch add-react (was 756f18c).
```

`git branch -d add-react` removes only the name; the commits stay in the history, reachable from `main` through the merge.
Git refuses `-d` for a branch whose commits are not merged yet, which protects work you have not brought in.

## Read more

### What Git combines

A merge compares three snapshots: the commit where the branches split, called the **merge base**, here `e12a937`, and the newest commit on each side.
A change made on only one side since the base is taken as it is.
When both sides changed the same lines differently, Git cannot choose, stops, and asks you; that is a **merge conflict**, and the next topic, Git collaboration, starts there.

### This site's merges

This site's `main` holds merges of both kinds.
When a branch was merged while `main` had not moved, `main` simply moved forward; when other branches had been merged first, the result is a merge commit whose message names the branch, as in `git log --oneline --graph` of the site's repository.

### Other ways to merge

`git merge --no-ff add-react` makes a merge commit even when a fast-forward was possible, which some teams prefer so that every branch shows as a loop in the graph.
GitHub offers three ways to merge a pull request, including two that never make a merge commit; Git collaboration compares them.

**If it breaks:** `merge: add-react - not something we can merge` means there is no branch by that name; check it with `git branch`.
`Already up to date.` means the other branch has nothing `main` does not have; check that you committed on it.
If the merge stops with `CONFLICT`, `git merge --abort` puts everything back as it was before the merge.

**Check:** You can say when a merge is a fast-forward and when it makes a merge commit, and read the branches and the merge in a `git log --oneline --graph` picture.
Then press **Mark this step as read**.

```quiz
You are on `main`, which has no new commits since `add-react` started. What does `git merge add-react` do?
= It moves `main` forward to `add-react`'s commit, a fast-forward
- It makes a merge commit with two parents
- It refuses, because the branches have diverged
> `add-react` is simply ahead of `main`, so there is nothing to join and no new commit is needed.
```

```quiz
How many parents does a merge commit have?
- One, the commit before it on `main`
= Two, the newest commit of each branch it joined
- None, it starts a new history
> The two parents are how `git log --graph` knows to draw the two lines joining.
```
