---
title: A remote on GitHub
mode: read
---

A **remote** is another copy of the same repository, usually on GitHub, that everyone on a team pushes to and pulls from.
Your computer and GitHub each keep a full history, and nothing moves between them until you run `git push`, `git fetch`, or `git pull`.
Press Step to watch a local history and its remote side by side as commits travel between them, and read the ahead and behind counts above each.

```demo name="remote-sync"
{ "scenario": "push" }
```

## Clone: a copy with a remote

`git clone` copies a repository from GitHub to your computer, with its whole history, and remembers where it came from under the name **origin**.
This site's own repository is public, so you can clone it:

```bash
git clone https://github.com/mandloideep/cs300-practice.git
```

```text
Cloning into 'cs300-practice'...
```

A few progress lines follow, and then `cs300-practice/` is a repository on your computer.
`git remote -v` inside it shows the remote and its address:

```text
origin	https://github.com/mandloideep/cs300-practice.git (fetch)
origin	https://github.com/mandloideep/cs300-practice.git (push)
```

A repository you made with `git init`, like the study plan, has no remote until you add one with `git remote add origin <address>`, which the last step of this topic does.

## Push, fetch, and pull

| Command | What moves | What changes on your computer |
| --- | --- | --- |
| `git push` | Your new commits, up to the remote | Nothing but the record of where the remote is |
| `git fetch` | The remote's new commits, down to your computer | `origin/main` moves; your `main` and your files do not |
| `git pull` | The same as `fetch`, then a merge of `origin/main` into your branch | Your branch and your files |

`origin/main` is your computer's record of where `main` was on the remote the last time you talked to it.
It is a **remote-tracking branch**: you never commit on it, and only `fetch`, `pull`, and `push` move it.

The first push of a branch adds `-u`, which links your branch to the remote one so that plain `git push` and `git pull` know where to go afterward:

```text
To https://github.com/you/study-plan.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

## Ahead and behind

`git status` compares your branch with its remote-tracking branch and says how they differ.

```text
Your branch is up to date with 'origin/main'.
```

```text
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)
```

```text
Your branch is behind 'origin/main' by 1 commit, and can be fast-forwarded.
  (use "git pull" to update your local branch)
```

```text
Your branch and 'origin/main' have diverged,
and have 1 and 1 different commits each, respectively.
  (use "git pull" if you want to integrate the remote branch with yours)
```

Ahead means you have commits the remote does not, so push; behind means the remote has commits you do not, so pull; diverged means both, so pull first and then push.
`git status` knows only what the last `fetch` told it, so "up to date" can be out of date; `git fetch` first when it matters.

## Read more

### Signing in to GitHub from the terminal

A push to GitHub needs you to be signed in.
On Windows, Git for Windows opens a browser window to sign in the first time.
On a Mac or on Linux, if the terminal asks for a username and a password, the password it wants is not your GitHub password; GitHub's page [Caching your GitHub credentials in Git](https://docs.github.com/en/get-started/git-basics/caching-your-github-credentials-in-git) sets up a sign-in that Git remembers, with the GitHub CLI or Git Credential Manager.

### Why fetch exists

`git pull` is `git fetch` followed by a merge, and most days that is what you want.
`git fetch` alone is the careful version: it brings the remote's commits down without touching your work, so you can look at them first with `git log --oneline main..origin/main`, which lists the commits `origin/main` has and `main` does not.

### A remote is just another copy

Nothing about GitHub is special to Git: a remote can be any copy of the repository, on any server, or another folder on the same disk.
GitHub adds what Git does not have, such as pull requests, reviews, and the checks that run on them, which the next steps use.

**If it breaks:** `fatal: repository 'https://github.com/...' not found` means the address is wrong or the repository is private and you are not signed in as someone who can see it.
`fatal: The current branch main has no upstream branch` means this branch was never pushed with `-u`; run the `git push -u origin main` that the message suggests.
`Permission denied` or `Authentication failed` means the sign-in failed; follow the GitHub page above.

**Check:** You can say what `origin` and `origin/main` are, what each of `push`, `fetch`, and `pull` moves, and what to run when `git status` says ahead, behind, or diverged.
Then press **Mark this step as read**.

```quiz
`git status` says your branch is behind `origin/main` by 2 commits. What do you run?
- `git push`
= `git pull`
- `git commit`
> Behind means the remote has commits you do not; `git pull` fetches and merges them, here as a fast-forward.
```

```quiz
What does `git fetch` change on your computer?
- Your `main` branch and the files in the folder
= Only `origin/main`, your record of where the remote's `main` is
- Nothing at all; it only prints what is new
> Fetch downloads commits and moves the remote-tracking branch; merging them into your branch is a separate step.
```
