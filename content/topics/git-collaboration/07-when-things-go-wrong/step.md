---
title: When things go wrong
mode: read
---

Four things go wrong for everyone who works with a team in Git, usually in their first week: a push is rejected, a pull stops with a conflict, a commit lands on the wrong branch, and a secret gets committed.
Each has a short, safe fix, and none of them loses work if you read what Git prints before typing the next command.
Step through the picture to the rejected push, the first of the four, and watch why Git refuses it.

```demo name="remote-sync"
{ "scenario": "rejected" }
```

## A push rejected because the remote moved

A teammate pushed to `main` after your last pull, and you committed on `main` too, so your push is refused:

```text
To https://github.com/you/study-plan.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to 'https://github.com/you/study-plan.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
```

Git refuses because accepting your push would throw away your teammate's commit.
The fix is the one the hint gives: `git pull` to bring their commit down and merge it with yours, then `git push` again.
Never answer a rejected push with `git push --force`, which replaces the remote's history with yours and deletes your teammate's work from it.

## A pull that will not merge, or that conflicts

On a recent Git, the first `git pull` into a branch with commits of its own may stop before it starts:

```text
hint: You have divergent branches and need to specify how to reconcile them.
...
fatal: Need to specify how to reconcile divergent branches.
```

Git is asking whether a pull should merge or do something else, and this course merges.
Tell it once, for every repository on your computer, and pull again:

```bash
git config --global pull.rebase false
git pull
```

If you and your teammate changed the same lines, the pull's merge stops with a conflict, exactly as a local merge does:

```text
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Resolve it as in [Resolve a conflict](#/topic/git-collaboration/2): edit the file until it is right with no markers left, `git add README.md`, `git commit`, then `git push`.

## A commit on the wrong branch

You forgot to make a branch and committed the footer fix on `main`, and you have not pushed it.
Move the commit to a new branch, then put `main` back where the remote has it:

```bash
git branch fix-footer-color
git reset --hard origin/main
git switch fix-footer-color
```

`git branch` makes a new name at your commit, so the commit is safe there; `git reset --hard origin/main` moves `main` back to the remote's `main`, which never had the commit; and you switch to the new branch to carry on.
Run `git status` first and commit or undo any change in progress, because `reset --hard` overwrites uncommitted work.
If the commit was already pushed to `main`, leave the history alone and use `git revert` from [Undo safely](#/topic/git-basics/5) instead.

## A secret that was committed

A password, an API key, or a token was committed.

1. **Make it useless first**: go to the service that issued it and revoke it or create a new one; once it is in a commit, assume someone has it, especially if it was pushed to a public repository.
2. **Take it out of the project**: move it to a file that `.gitignore` lists, such as `.env`, remove it from the committed file, and commit that change.
3. **Do not count on deleting history**: the old commit still holds the secret, and on GitHub copies of it may already exist; tools such as `git filter-repo` can rewrite history, but only step 1 makes you safe.

GitHub's push protection refuses many well-known kinds of keys at `git push` time, which turns this mistake into a rejected push instead; read its message and remove the key from your commits before pushing again.

## Read more

### Reading before typing

Each of these messages says what happened and, in the `hint:` lines, what to do.
The commands that can lose work are few: `git reset --hard`, `git restore` on a changed file, `git push --force`, and deleting a branch with `-D` instead of `-d`.
Before any of them, `git status` and `git log --oneline -5` take two seconds and show exactly what is about to change.

### Rebase instead of merge

`git config pull.rebase true` is the other common choice: instead of a merge commit, a pull replays your commits on top of the remote's, which keeps the history a straight line.
It rewrites your unpushed commits, so it is best learned after merging feels routine; this course uses merge.

**If it breaks:** If a pull's merge opens an editor with a message starting "Merge branch 'main'", save and close it to finish the merge; [Ship it together](#/topic/git-collaboration/8) sets Visual Studio Code as that editor.
If you are lost in the middle of a merge, `git merge --abort` returns to where you were before the pull.

**Check:** For each of the four problems, you can name the message or situation that shows it and the fix, and say why `git push --force` is not the answer to a rejected push.
Then press **Mark this step as read**.

```quiz
Your push is rejected with "(fetch first)". What do you do?
- `git push --force`, since your copy is newer
= `git pull`, resolve any conflict, then `git push`
- Delete your local repository and clone again
> The remote has a commit you do not; pulling merges it with yours, and the next push includes both.
```

```quiz
A committed API key was pushed to a public repository. What comes first?
- Delete the file and push the deletion
- Rewrite the history so the commit disappears
= Revoke the key at the service that issued it
> Anyone may already have the key, so making it useless is the only step that protects you; cleaning the repository comes after.
```
