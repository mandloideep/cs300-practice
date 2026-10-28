---
title: What a conflict is
mode: read
---

**We used this in:** [Git basics](#/topic/git-basics) merged two branches that changed different files; this topic starts where two branches change the same lines.

When two branches change the same lines in different ways, Git has two answers for one place in the file and no rule for choosing between them.
It does not guess: it writes both versions into the file between **conflict markers**, stops the merge, and waits for you to decide.
Press Step to watch the two branches of the study plan change the same heading, the merge stop, and the file with its markers; at the last step, choose a resolution.

```demo name="merge-conflict"
{
  "file": "index.html",
  "base": ["<h1>Study plan</h1>"],
  "ours": ["<h1>Study plan for the term</h1>"],
  "theirs": ["<h1>My study plan</h1>"]
}
```

## Two branches, one line

In the study plan, `main` and a branch named `rename-heading` both start from a commit whose heading is `<h1>Study plan</h1>`.
On `rename-heading`, the heading becomes `My study plan`; on `main`, it becomes `Study plan for the term`.
Each change is fine alone, and `git merge rename-heading` on `main` stops:

```text
Auto-merging index.html
CONFLICT (content): Merge conflict in index.html
Automatic merge failed; fix conflicts and then commit the result.
```

## The markers

Git leaves both versions in `index.html`, between three marker lines:

```html
<<<<<<< HEAD
      <h1>Study plan for the term</h1>
=======
      <h1>My study plan</h1>
>>>>>>> rename-heading
```

| Marker | What follows it |
| --- | --- |
| `<<<<<<< HEAD` | **Ours**: the lines as the branch you are on, `main`, has them |
| `=======` | **Theirs**: the lines as the branch being merged has them |
| `>>>>>>> rename-heading` | The end of the region, named after the branch being merged |

The rest of the file, every line only one side changed, is already merged.
A file can hold several marked regions, one for each place the two sides disagree.

## A merge in progress

Until you finish, the repository is in the middle of a merge, and `git status` says so:

```text
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   index.html
```

You have two ways out.
`git merge --abort` puts everything back as it was before the merge, which is always safe.
Or you **resolve** the conflict: edit the file until it is what the project should be, with every marker line removed, then `git add index.html` to tell Git it is resolved and `git commit` to make the merge commit.

## Resolving is deciding

The right resolution is often neither side.
Here, a heading that keeps both ideas, `My study plan for the term`, may be what both people wanted.
In code, it is usually both changes made to fit together, which the next step has you do in a React component.
Read both sides, and ask the person who wrote the other one when you are not sure what they meant.

## Read more

### Seeing the base too

By default the markers show ours and theirs but not what the lines were before either change.
`git config --global merge.conflictStyle diff3` adds a third section, after `|||||||`, with the base version, which makes it clearer what each side actually changed.

### When a conflict is not in the text

A conflict can also come from one branch changing a file that the other deleted, or from two branches adding different files with the same name.
`git status` names each case, such as `deleted by them` or `both added`, and the resolution is the same idea: make the folder what it should be, `git add` or `git rm` each file, then commit.

### A conflict is not an error

A conflict means two people worked on the same thing at the same time, which happens in every team.
Nothing is lost: both versions are in the file, both commits are in the history, and `git merge --abort` undoes the attempt.

**Check:** You can say why Git stops instead of choosing, what the lines after `<<<<<<< HEAD` and after `=======` are, and the two commands that finish a resolution.
Then press **Mark this step as read**.

```quiz
Why does Git stop with a conflict instead of choosing one version?
- It always prefers the branch you are on, but asks first
= Both branches changed the same lines differently, and Git has no rule for which change is right
- One of the branches has an error that must be fixed
> Changes in different places merge on their own; only two different changes to the same lines need a person.
```

```quiz
You edited `index.html` and removed every marker. What finishes the merge?
- `git merge --abort`
= `git add index.html`, then `git commit`
- Saving the file is enough
> `git add` marks the file resolved, and the commit records the merge with both parents.
```
