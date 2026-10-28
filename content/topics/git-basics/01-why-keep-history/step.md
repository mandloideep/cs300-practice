---
title: Why keep history
mode: read
---

Every project you have built this semester changed many times, and each save replaced the version before it.
This step shows what **Git** keeps instead: every version of the project, who changed what and why, and a way back to any of them.
The picture holds the first four commits of this site's own repository; press Step to walk them from the oldest, and select one to see the files it changed.

```demo name="commit-graph"
{
  "commits": [
    { "hash": "ae50518", "message": "first commit", "files": ["README.md"] },
    {
      "hash": "7e727e1",
      "message": "Add design, kickoff, and Phase 1 contracts documents",
      "files": ["docs/CONTRACTS.md", "docs/DESIGN.md", "docs/KICKOFF.md"]
    },
    {
      "hash": "14f5551",
      "message": "Pin edit block semantics in the contracts",
      "files": ["docs/CONTRACTS.md"]
    },
    {
      "hash": "8de0b53",
      "message": "Scaffold the site shell (milestone 1)",
      "files": ["index.html", "package.json", "src/main.jsx", "src/app/App.jsx"]
    }
  ]
}
```

## A folder of copies

Without version control, keeping old versions means copying the folder.

```text
study-plan/
study-plan-copy/
study-plan-final/
study-plan-final-v2/
study-plan-final-v2-fixed-styles/
```

A week later nobody can say which copy is the newest, what changed between two of them, or why.
When a partner sends their own copy, there is no way to combine the two except by reading both line by line.

## What a repository gives instead

A **repository** keeps one folder and its whole history.

- **Every version**: each saved version is kept, and you can open the project as it was at any of them.
- **Who changed what, and why**: each version records its author, its date, the files it changed, and a message written by the person who made it.
- **A way back**: a mistake is undone by going back to, or undoing, one version, without touching the work that came after it.

The commits in the picture are a real example.
The third one, `14f5551`, changed one file, `docs/CONTRACTS.md`, and its message says why; reading the history of that one file later shows every decision made in it, in order.

## Three words

These three words come up in every step of this topic.

| Word | What it is |
| --- | --- |
| Repository | The project folder together with its history, which Git keeps in a hidden `.git` folder inside it |
| Commit | One saved version of the whole project: a snapshot of every file, with a message, an author, a date, and a link to the commit before it |
| Working tree | The files you see and edit in the folder right now, which may differ from the last commit |

## Read more

### Git and GitHub

**Git** is a program that runs on your own computer and keeps the history inside the project folder; it works with no network and no account.
**GitHub** is a website that keeps a copy of a Git repository online, so that a team shares one history and a project can be published; [Git collaboration](#/topic/git-collaboration), the next topic, starts there.
This topic uses Git alone.

### This site's history

CS300 Practice is a Git repository, and everything in it, every topic, every explainer, and this step, arrived as commits.
The repository is public, and its history is at [github.com/mandloideep/cs300-practice/commits/main](https://github.com/mandloideep/cs300-practice/commits/main), newest first.
Each commit has a short message in the same style as the four above: what changed, written as a command, such as "Pin edit block semantics in the contracts".

### Why a snapshot

A commit records the whole project, not only the lines that changed.
Git stores this efficiently, since a file that did not change is stored once and shared by every commit that holds it, and it computes the changes between two snapshots whenever you ask for them, which [Read the history](#/topic/git-basics/3) shows.

**Check:** You can say, in one sentence each, what a repository, a commit, and the working tree are, and name two things a repository gives you that a folder of copies does not.
Then press **Mark this step as read**.

```quiz
What does one commit record?
- Only the lines you changed since the last commit
= A snapshot of the project's files, with a message, an author, a date, and the commit before it
- A copy of the project on GitHub
> A commit is a whole snapshot with its own details; Git works out what changed between two commits when you ask.
```

```quiz
Where does Git keep a repository's history?
- On GitHub, so it needs a network connection
= In a hidden `.git` folder inside the project folder
- In a separate copy of the folder for each version
> The history lives inside the project, in `.git`; GitHub is an optional place to share a copy of it.
```
