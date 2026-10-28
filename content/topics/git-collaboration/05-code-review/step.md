---
title: Code review
mode: read
---

A pull request is also a request for a **review**: a teammate reads the change before it is merged, asks questions, and approves it or asks for changes.
Review catches bugs, but mostly it spreads knowledge, since after it two people understand the change instead of one.
Press Step through the cart summary's pull request and stop at the review: it comes after the checks and before the merge.

```demo name="pull-request-flow"
{ "branch": "cart-summary", "title": "Add a cart summary", "checks": ["lint", "build"] }
```

## What a reviewer looks for

Read the description first, then the **Files changed** tab, and check, in this order:

1. **It does what it says**: check out the branch with `git fetch` and `git switch cart-summary`, and try the feature.
2. **It is correct at the edges**: try an empty cart, one item and not "1 items", a price with cents, and a product added twice.
3. **It is readable**: names say what things are, components are small enough to hold in your head, and nothing is clever without a reason.
4. **It fits the project**: it follows the patterns and the style of the code around it, with no unrelated changes mixed in.

Formatting and lint belong to the checks, not to people; a reviewer who argues about semicolons is doing the formatter's job.

## Asking for a change

A review comment is attached to a line in **Files changed**, and it works best as a specific question or suggestion with a reason.
Suppose the first version of `CartSummary` printed `${items.length} items` for every count; a useful comment on that line reads:

```text
CartSummary shows "1 items" when there is one item. Could it say "1 item"?
items.length === 1 ? "1 item" : `${items.length} items` would do it.
```

Comment on the code, never on the person, and say which comments must be fixed before merging and which are only ideas, for example by starting an optional one with "Optional:".
GitHub's **Add a suggestion** button writes a change the author can accept with one click.
A review ends with one of three choices: **Comment**, **Approve**, or **Request changes**.

## Answering a review

Answer every comment: fix the code and push a new commit to the same branch, or reply with your reason if you disagree.
A new push updates the pull request and runs the checks again; reply "Done" or mark the conversation **Resolved** so the reviewer knows what to look at again.
Asking a question about a comment is fine, and so is agreeing to do a larger change in a later pull request.

## Small pull requests

A pull request of fifty lines gets a careful review in ten minutes; one of a thousand gets a skim and an approval.
Keep each pull request to one idea, such as "Add a cart summary", and split a large feature into steps that each work on their own.
The cart branch in [Resolve a conflict](#/topic/git-collaboration/2) is the right size: one component, one change to `ProductList`, and the wiring in `App`.

## Three ways to merge

GitHub's merge button has three choices, and a repository can turn any of them off.

**Create a merge commit** keeps every commit of the branch and adds a merge commit with two parents, exactly as `git merge` did in [Git basics](#/topic/git-basics/7).
The history shows the branch as a loop, which preserves how the work happened, including its "Fix typo" commits.

**Squash and merge** combines all of the branch's commits into one new commit on `main`, with the pull request's title as its message.
The history of `main` becomes one commit per pull request, which is easy to read and easy to revert; the individual commits remain visible on the pull request page.

**Rebase and merge** copies each of the branch's commits onto the end of `main`, one after another, with no merge commit.
The history stays a straight line with every commit kept, but the copies get new hashes, so it suits teams that keep their branch commits tidy.

## Read more

### This site and review

Every change to this site passes the same `check.yml` described in [A pull request](#/topic/git-collaboration/4) before it reaches `main`, and the commits are written so that each one makes sense alone.
That is the same discipline a review asks for: a change a reader can follow and a history that explains itself.

### Reviewing well takes practice

Start every review by saying what is good in the change.
Prefer questions, "What happens if the cart is empty?", to orders, and offer to pair when a thread grows past three replies, because a five-minute call settles what ten comments do not.

**Check:** You can name four things a reviewer looks for, write a review comment that is specific and gives a reason, and say what each of the three merge choices does to the history of `main`.
Then press **Mark this step as read**.

```quiz
Which merge choice puts exactly one new commit on `main` for the whole pull request?
- Create a merge commit
= Squash and merge
- Rebase and merge
> Squash combines the branch's commits into one; a merge commit keeps them all, and rebase copies each one.
```

```quiz
Which review comment is most useful?
- "This is wrong."
- "I would never write it this way."
= "With one item this shows '1 items'; could it check `items.length === 1`?"
> A useful comment names the problem, where it shows, and a way to fix it.
```
