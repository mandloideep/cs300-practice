---
title: Read the history
mode: read
---

A repository is only useful if you can read it back.
This step reads the history of the study plan project you will build on your computer at the end of this topic, with three commands: `git log` lists the commits, `git show` opens one, and `git diff` shows what changed.
In the picture, select a commit to see the snapshot it holds and its diff from the commit before it, its **parent**.

```demo name="commit-graph"
{
  "commits": [
    {
      "hash": "e12a937",
      "message": "Add the study plan page",
      "files": [".gitignore", "README.md", "index.html", "src/main.js", "styles.css"]
    },
    { "hash": "a112bfd", "message": "Gray out the finished topics", "files": ["styles.css"] },
    { "hash": "56db43d", "message": "Add a footer", "files": ["index.html"] }
  ]
}
```

## git log

`git log` lists the commits of the current branch, newest first.

```text
commit 56db43d4820386f764460b9cb4e46e3fdd99bd23 (HEAD -> main)
Author: Your Name <you@example.com>
Date:   Wed Oct 28 14:03:00 2026 -0500

    Add a footer

commit a112bfd350752b57dd7b7c881a8828124a148a5f
Author: Your Name <you@example.com>
Date:   Wed Oct 28 14:02:00 2026 -0500

    Gray out the finished topics
```

The long string after `commit` is the commit's **hash**, forty hexadecimal characters that Git computes from the commit's contents, its message, its author, and its parent.
No two commits share a hash, so the hash is the commit's name.
The first seven characters are almost always enough, and every command that takes a commit accepts them.
A long log opens in a pager: press Space for the next page and `q` to quit.

`git log --oneline` prints one line per commit, which is how you will read a history most of the time:

```text
56db43d (HEAD -> main) Add a footer
a112bfd Gray out the finished topics
e12a937 Add the study plan page
```

`(HEAD -> main)` marks where you are; [A branch is a pointer](#/topic/git-basics/6) says what it means.

## git show

`git show a112bfd` prints that commit's details and its diff from its parent:

```diff
commit a112bfd350752b57dd7b7c881a8828124a148a5f
Author: Your Name <you@example.com>
Date:   Wed Oct 28 14:02:00 2026 -0500

    Gray out the finished topics

diff --git a/styles.css b/styles.css
index dbe3755..9e2b6b7 100644
--- a/styles.css
+++ b/styles.css
@@ -21,4 +21,5 @@ h1 {
 
 .done {
   text-decoration: line-through;
+  color: gray;
 }
```

## How to read a diff

A diff compares two versions of a file, `a/` the older and `b/` the newer.

- A line starting with `+` was added, and one starting with `-` was removed; a changed line appears as one of each.
- Lines starting with a space are unchanged **context**, printed so you can find the place.
- `@@ -21,4 +21,5 @@` says the piece starts at line 21 and was 4 lines long in the old file and 5 in the new one; the text after it, `h1 {`, is a nearby line Git printed to help you find the place.

## git diff

Plain `git diff` shows the changes in the working tree that are **not staged yet**.
`git diff --staged` shows what **is staged**, which is exactly what the next commit will record.
After `git add`, plain `git diff` prints nothing, which surprises everyone once: the change did not vanish, it moved to the staging area, and `git diff --staged` shows it.

## Read more

### Commits form a chain

Every commit except the first names its parent, so the commits form a chain from the newest back to the first.
That is why `git log` can start at the newest commit and walk back: each commit says where to go next.
A merge commit, which [Merge a branch](#/topic/git-basics/7) introduces, has two parents.

### Reading the history of one file

`git log --oneline -- styles.css` lists only the commits that changed `styles.css`, and `git log -p -- styles.css` adds each one's diff.
On a long project this answers the question "when did this line change, and why?" faster than anything else.

### This site's history

The same commands work on this site's repository.
Its first commits, read with `git log --oneline --reverse`, which prints the oldest first, are the four in the first step of this topic.

**Check:** You can find a commit's hash in `git log --oneline`, open it with `git show`, and say which lines its diff added and removed.
Then press **Mark this step as read**.

```quiz
You run `git add styles.css` and then `git diff`. It prints nothing. Why?
- The change was lost when you added it
= Plain `git diff` shows only changes not yet staged; `git diff --staged` shows the staged one
- `git diff` works only after a commit
> The change moved from the working tree to the staging area, and the two diffs look at different places.
```

```quiz
In a diff, what does a line that starts with a space mean?
- It was added
- It was removed
= It did not change and is shown as context
> Context lines help you find where the change is; only the lines starting with `+` or `-` changed.
```
