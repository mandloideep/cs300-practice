---
title: A pull request
mode: read
---

A **pull request** is a request, made on GitHub, to merge one branch into another, usually a feature branch into `main`.
It puts the branch's diff, a conversation about it, and the results of automatic checks on one page, so that the team sees and agrees to a change before it reaches `main`.
Press Step to follow one pull request of this site from the pushed branch to the merge, and notice that the merge waits until every check has passed.

```demo name="pull-request-flow"
{
  "branch": "git-basics-topic",
  "title": "Add the git-basics topic",
  "checks": ["lint", "format", "validate", "build", "test:scripts"]
}
```

## Push the branch

A pull request starts from a branch on GitHub, so the branch is pushed first:

```bash
git switch -c rename-heading
git commit -am "Rename the heading"
git push -u origin rename-heading
```

GitHub answers the first push of a new branch with the address that opens a pull request for it:

```text
remote:
remote: Create a pull request for 'rename-heading' on GitHub by visiting:
remote:      https://github.com/you/study-plan/pull/new/rename-heading
remote:
To https://github.com/you/study-plan.git
 * [new branch]      rename-heading -> rename-heading
branch 'rename-heading' set up to track 'origin/rename-heading'.
```

Open that address, or the repository page, where GitHub shows a **Compare & pull request** button for a branch pushed in the last hour.

## Open it

The form asks for two branches and two texts.

- **base** is the branch the change goes into, `main`, and **compare** is the branch it comes from, `rename-heading`.
- The **title** says what the change does, like a commit message: "Rename the heading".
- The **description** says why, what a reviewer should look at, and how to try it; a few sentences are enough.

**Create pull request** opens it, gives it a number, such as `#1`, and shows it under the repository's **Pull requests** tab.
More commits pushed to `rename-heading` later join the same pull request; there is no need to open another.

## What the page shows

| Tab or section | What it holds |
| --- | --- |
| **Conversation** | The description, every comment, every review, and every push, in order |
| **Commits** | The branch's commits that `main` does not have |
| **Files changed** | The diff of the whole branch against `main`, where reviewers comment on single lines |
| **Checks**, at the bottom of the conversation | The automatic checks that ran on the branch, each with a green check mark or a red cross |

## The checks: this site's check.yml

A repository can run commands on every pull request with **GitHub Actions**.
This site has a workflow, `.github/workflows/check.yml`, whose trigger and steps are:

```text
on:
  push:
    branches: [main]
  pull_request:
```

```text
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run validate
      - run: npm run build
      - run: npm run test:scripts
```

Every pull request to this site gets a fresh computer from GitHub that installs the project and runs those five commands.
If any of them fails, the pull request shows a red cross, with the log of the command that failed, and nobody merges it until a new commit fixes it; the five in the picture are those five commands.
A failing check is the cheapest bug report there is: it arrives before the code is on `main`.

## Merge it

When the checks pass and the reviewers agree, **Merge pull request** merges the branch into `main` on GitHub, and GitHub offers **Delete branch** right after.
Your computer does not know yet, so update it:

```bash
git switch main
git pull
git branch -d rename-heading
```

## Read more

### Why not merge on your own computer

You can merge locally and push `main`, as [Git basics](#/topic/git-basics/7) did on one computer.
On a team the pull request is better: the change is reviewed before it lands, the checks run on exactly what will be merged, and the conversation stays attached to the change for anyone who later asks why it was made.
Many teams protect `main` on GitHub so that a push straight to it is refused and every change goes through a pull request.

### A draft pull request

**Create draft pull request**, in the arrow beside the create button, opens a pull request that cannot be merged yet.
It is the way to share unfinished work early, run the checks on it, and ask for an opinion before it is ready.

### A pull request from a fork

To contribute to a repository you cannot push to, such as an open source project, you **fork** it, which makes a copy under your own account, push a branch to your fork, and open a pull request from there into the original.
The pull request page is the same.

**If it breaks:** If GitHub says "There isn't anything to compare", the branch has no commits that `main` lacks; check that you committed on the branch and pushed it.
A repository with no workflow, such as the study plan, shows no checks at all, which is fine: there is simply nothing to run.

**Check:** You can name the base and the compare branch of a pull request, say what the Files changed tab and the checks show, and list the three commands that update your computer after a merge on GitHub.
Then press **Mark this step as read**.

```quiz
A check on your pull request shows a red cross. What do you do?
- Merge anyway, since the code works on your computer
= Read the failing command's log, fix the problem on the branch, and push a new commit
- Close the pull request and open a new one
> New commits on the branch join the same pull request, and the checks run again on them.
```

```quiz
After a pull request is merged on GitHub, what does your computer's `main` hold?
- The merged change, because GitHub updates it
= The old `main`, until you switch to it and pull
- Nothing, because the branch was deleted
> GitHub changes only its own copy; `git pull` on `main` brings the merge down.
```
