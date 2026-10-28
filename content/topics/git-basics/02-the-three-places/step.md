---
title: The three places
mode: read
---

Git keeps every file of a project in three places at once: the **working tree** you edit, the **staging area** that holds the next commit, and the **repository** that holds every commit so far.
A change moves from one to the next only when you say so, with `git add` and then `git commit`.
Press Step to move one edit of `styles.css` across the three, and read the `git status` output under each state.

```demo name="three-trees"
{ "file": "styles.css" }
```

## Three places, three commands

| Place | What it holds | How a change gets there |
| --- | --- | --- |
| Working tree | The files in the folder, as you last saved them | You edit and save in Visual Studio Code |
| Staging area | The files as the next commit will record them | `git add <file>` copies the file as it is now |
| Repository | Every commit so far | `git commit -m "<message>"` records everything staged as one new commit |

The staging area is also called the **index**, a name you will see in some Git messages and in the Git book.

## Ask Git where things stand

`git status` is the command to run whenever you are not sure.
It reads the three places and says what differs between them.
After you edit `styles.css` and save, it says the change is in the working tree only:

```text
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   styles.css

no changes added to commit (use "git add" and/or "git commit -a")
```

After `git add styles.css`, the same file is staged:

```text
On branch main
Changes to be committed:
  (use "git restore --staged <file>..." to unstage)
	modified:   styles.css
```

After `git commit -m "Gray out the finished topics"`, all three places agree again:

```text
[main a112bfd] Gray out the finished topics
 1 file changed, 1 insertion(+)
```

```text
On branch main
nothing to commit, working tree clean
```

Each status message also prints the command that would move the file back, in the lines in parentheses, so `git status` doubles as a reminder of what to type next.

## Why a staging step

Committing could have been one command that records every change in the folder.
The staging area exists so that **you choose what goes into each commit**.
Say you fixed a typo in `index.html` and, in the same sitting, started a new color in `styles.css` that is not finished.
`git add index.html` and a commit record the fix alone, and the unfinished color stays in the working tree for later.

`git add .` stages every changed file in the folder at once, which is what you want when the whole change is one idea.
Run `git status` before `git commit` either way, so that you know what the commit will hold.

## A commit message

A commit message is written for the person who reads the history later, often you.
Write it as a short command that says what the commit does, such as "Gray out the finished topics" or "Fix the typo in the heading", in under about sixty characters.
"Update", "changes", and "stuff" say nothing a reader can use.

## Read more

### The commits of this site

This site's commits follow the same rule.
`git log --oneline` in its repository prints lines such as these, newest first:

```text
2b843e7 Retrofit lists-and-keys into the interactive-first layout
3656698 Retrofit components-and-props into the interactive-first layout
fd96e4f Retrofit react-mental-model into the interactive-first layout
ff3a74e Keep the explanation tests independent of each step's real text
```

Each says what changed in a few words, and the commit holds the files that make the change.

### Tracked and untracked

A file Git has never committed is **untracked**: `git status` lists it under "Untracked files" and `git commit` ignores it until you `git add` it once.
After its first commit, the file is **tracked**, and Git reports every later change to it.
`git commit -am "<message>"` stages every change to tracked files and commits in one command; it never adds an untracked file, which is why a new file still needs `git add`.

**If it breaks:** `fatal: not a git repository` means the terminal is not inside a repository; move into the project folder with `cd`, or run `git init` there first.
`nothing added to commit` after `git commit` means nothing was staged; run `git add` first, and `git status` to see what changed.
If a commit opens an editor full of lines starting with `#`, you left out `-m`; type a message on the first line, save, and close the editor, or close it without saving to cancel the commit.

**Check:** You can say which of the three places each of `git add` and `git commit` moves a change into, and what `git status` prints when the working tree, the staging area, and the last commit agree.
Then press **Mark this step as read**.

```quiz
You edit `styles.css`, run `git add styles.css`, edit `styles.css` again, and run `git commit -m "Gray out the finished topics"`. What does the commit hold?
- Both edits, because the file was saved before the commit
= The first edit only; the second is still in the working tree
- Nothing, because the file changed after it was added
> `git add` copies the file as it is at that moment; a later edit stays in the working tree until you add it again.
```

```quiz
Why does Git have a staging area?
- To keep a backup in case the commit fails
- To upload files to GitHub before they are committed
= So that you choose which changes go into the next commit
> Staging lets one sitting's work become several focused commits, each holding one idea.
```
