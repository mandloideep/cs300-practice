---
title: The daily loop
mode: read
---

Everything in this topic so far fits into one loop that a developer on a team runs many times a week: pull, branch, commit, push, open a pull request, answer review, merge, and pull again.
Each turn of the loop is one small change, and keeping the turns small and short is what keeps conflicts rare and reviews quick.
Step through both pictures: the first is your copy and GitHub's staying in step, the second is one turn of the loop on GitHub.

```demo name="remote-sync"
{ "scenario": "pull" }
```

```demo name="pull-request-flow"
{ "branch": "fix-footer-color", "title": "Fix the footer color", "checks": ["lint", "build"] }
```

## One turn of the loop

| | Command or action | Why |
| --- | --- | --- |
| 1 | `git switch main` then `git pull` | Start from the newest `main`, so your branch begins where everyone else is |
| 2 | `git switch -c fix-footer-color` | One branch per task, named for the task |
| 3 | Edit, then `git add` and `git commit` | Commit as you go, each commit one step that works |
| 4 | `git push -u origin fix-footer-color` | Put the branch on GitHub; push again after every few commits |
| 5 | Open the pull request | Describe the change and ask for a review |
| 6 | Answer review, push fixes | The pull request updates and the checks run again |
| 7 | Merge on GitHub and delete the branch | The change is on `main` for everyone |
| 8 | `git switch main`, `git pull`, `git branch -d fix-footer-color` | Your computer catches up, and the next turn starts clean |

## Keep turns short

A branch that lives for a day collects a day of everyone else's changes on `main`; one that lives for two weeks collects two weeks of them, and its merge is where the conflicts are.
Merge small pull requests often, and if a branch must live long, bring `main` into it every day or two:

```bash
git switch main
git pull
git switch fix-footer-color
git merge main
```

Any conflict then appears early and small, on your branch, where you resolve it as in [Resolve a conflict](#/topic/git-collaboration/2), instead of all at once in the pull request.

## What a team agrees on

A team writes a few conventions down, usually in the repository's `README.md` or a `CONTRIBUTING.md`, so that nobody has to guess:

- **Branch names**: a short description in lowercase with hyphens, such as `fix-footer-color`, sometimes with a prefix such as `feature/` or the issue number.
- **Commit messages**: what the commit does, as a command, under about sixty characters, as in [The three places](#/topic/git-basics/2).
- **Who reviews**: one approving review before merging is common, and nobody approves their own pull request.
- **How to merge**: one of the three choices from [Code review](#/topic/git-collaboration/5), the same every time.
- **`main` always works**: nobody pushes to it directly, and every pull request passes its checks before merging.

## Read more

### This site's loop

This site follows the same loop at a larger scale.
Several pieces of work run at once, each on its own branch, and each is merged into `main` when it is finished and `check.yml` has passed on it; the deploy workflow then publishes `main`, which [A workflow on every push](#/topic/deploy-with-github-pages/4) explains.
A topic such as this one is one turn: written on its branch, checked, merged, and live.

### When you are the only developer

The loop works alone too, without the review: a branch per task keeps `main` working while you experiment, and a pull request to yourself still runs the checks and leaves a record of why each change was made.

**Check:** You can list the eight parts of one turn of the loop in order, say why a long-lived branch causes conflicts, and name three conventions a team writes down.
Then press **Mark this step as read**.

```quiz
Why does the loop start with `git pull` on `main`?
- To push your last change before starting
= So the new branch starts from the newest `main`, with everyone's merged work
- Because Git refuses to create a branch otherwise
> A branch made from an old `main` starts behind, and every change it misses is a chance for a conflict at merge time.
```

```quiz
A branch has been open for two weeks and `main` has moved a lot. What keeps its merge small?
- Waiting until the feature is finished, then merging once
= Merging `main` into the branch every day or two
- Deleting the branch and starting over
> Bringing `main` in often turns one large conflict at the end into a few small ones along the way.
```
