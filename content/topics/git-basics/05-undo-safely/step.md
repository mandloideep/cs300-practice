---
title: Undo safely
mode: read
---

Every mistake in a repository can be undone, and the right command depends on which of the three places the mistake is in.
This step pairs each place with its undo: `git restore` for the working tree, `git restore --staged` for the staging area, and `git revert` for a commit.
Step through the picture to the end, where Reset puts the file back, and keep in mind which place each undo below changes.

```demo name="three-trees"
{ "file": "src/main.js" }
```

## Four undos

| The mistake | The command | What it changes | What you lose |
| --- | --- | --- | --- |
| An edit you do not want, not staged | `git restore <file>` | The working tree copy goes back to the last commit | The edit, for good |
| A file staged by mistake | `git restore --staged <file>` | The staging area goes back to the last commit | Nothing; the edit stays in the working tree |
| A commit you want to undo | `git revert <hash>` | A new commit that does the opposite of that one | Nothing; both commits stay in the history |
| Everything since a commit | `git reset --hard <hash>` | All three places go back to that commit | Every uncommitted change, and the later commits from the branch |

## Undo an edit

You changed the heading in `index.html` and want the committed version back.
`git status` tells you the command in its own words:

```text
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   index.html
```

`git restore index.html` replaces the file in the folder with its last committed version and prints nothing.
The edit is not saved anywhere, so be sure before you run it; if in doubt, commit first, since a commit can always be undone later.

## Unstage a file

You ran `git add styles.css`, then decided the change belongs in a later commit.
`git restore --staged styles.css` takes it out of the staging area and leaves your edit in the file, so `git status` moves it back under "Changes not staged for commit".
Nothing is lost.

## Undo a commit with revert

The study plan history ends with a commit you regret:

```text
56db43d (HEAD -> main) Add a footer
a112bfd Gray out the finished topics
e12a937 Add the study plan page
```

`git revert --no-edit 56db43d` makes a new commit that removes the footer line again:

```text
[main 7614929] Revert "Add a footer"
 1 file changed, 1 deletion(-)
```

```text
7614929 (HEAD -> main) Revert "Add a footer"
56db43d Add a footer
a112bfd Gray out the finished topics
e12a937 Add the study plan page
```

The mistake is still in the history, and so is its undo, with a message that names it.
That is what makes `revert` safe on a branch other people use: it adds a commit and never rewrites the ones they already have.
Without `--no-edit`, Git opens an editor to let you change the message; save and close it to finish.

## Why reset --hard is the one to be careful with

`git reset --hard a112bfd` moves the branch back to `a112bfd` and makes the staging area and the working tree match it.
The commits after it disappear from the log, and every change you had not committed is overwritten with no copy kept.
It is the right tool for throwing away an experiment on your own computer that nobody else has, and the wrong one for anything you have shared or anything you might want back.
When unsure, use `revert`.

## Read more

### Reverting and deploying

The topic Deploy with GitHub Pages uses this idea for a site that rebuilds on every push: when a commit breaks the site, `git revert` and a push put the previous version back online, with the history saying exactly what happened.

### A commit that is not finished yet

To fix the last commit's message, or add a file you forgot to stage, before anyone else has it, `git commit --amend` replaces the last commit with a corrected one.
It rewrites that commit, so the rule is the same as for `reset`: only for a commit you have not shared.

### Older commands

Tutorials written before 2019 use `git checkout -- <file>` for `git restore <file>` and `git reset HEAD <file>` for `git restore --staged <file>`.
Both still work; `restore` was added because `checkout` did too many different things.

**If it breaks:** `error: pathspec 'index.html' did not match any file(s) known to git` means the file name is wrong or the file was never committed; check the name with `git status`.
If `git revert` stops with a conflict, a later commit changed the same lines; [Resolve a conflict](#/topic/git-collaboration/2) shows how to resolve one, and `git revert --abort` cancels the revert for now.

**Check:** For each of the four mistakes in the table, you can name the command that undoes it and say whether anything is lost.
Then press **Mark this step as read**.

```quiz
You staged `styles.css` by mistake but want to keep the edit. Which command?
- `git restore styles.css`
= `git restore --staged styles.css`
- `git reset --hard`
> `--staged` changes only the staging area, so the edit stays in the file; plain `restore` would discard it.
```

```quiz
A commit you pushed last week broke the page. Which undo is safe for a branch others use?
- `git reset --hard` to the commit before it
= `git revert` on that commit, then push the new commit
- Delete the repository and start again
> `revert` adds a commit and rewrites nothing, so everyone's copy of the history stays valid.
```
