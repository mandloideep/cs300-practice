---
title: Ship it together
mode: local
---

This step does everything in this topic for real: you put the `study-plan` repository from [Git basics](#/topic/git-basics/8) on GitHub, open a pull request from a branch, merge it on GitHub, and pull the merge; then you make a real conflict between two copies of the repository and resolve it.
Step through each terminal session before you type its commands; your hashes, times, and GitHub name will differ.
The commands that come after an edit say which edit in their note.

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git config --global pull.rebase false",
      "output": [],
      "note": "Once per computer: a git pull that finds new commits on both sides merges them. Without it, a recent Git stops and asks."
    },
    {
      "command": "git config --global core.editor \"code --wait\"",
      "output": [],
      "note": "Once per computer: when Git needs a message, such as for a merge commit, it opens Visual Studio Code and waits until you close the tab."
    },
    {
      "command": "git remote add origin https://github.com/you/study-plan.git",
      "output": [],
      "note": "Names the empty GitHub repository origin. Use the address GitHub showed you, with your own user name in place of you."
    },
    {
      "command": "git push -u origin main",
      "output": [
        "To https://github.com/you/study-plan.git",
        " * [new branch]      main -> main",
        "branch 'main' set up to track 'origin/main'."
      ],
      "note": "The whole history goes up to GitHub, after a few progress lines. -u links main to origin/main for every later push and pull."
    },
    {
      "command": "git switch -c mark-collaboration-done",
      "output": ["Switched to a new branch 'mark-collaboration-done'"],
      "note": "A branch for one change. Now open src/main.js, change done: false to done: true on the Git collaboration line, and save."
    },
    {
      "command": "git commit -am \"Mark Git collaboration as done\"",
      "output": [
        "[mark-collaboration-done e6cd32f] Mark Git collaboration as done",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "The change is one commit on the branch."
    },
    {
      "command": "git push -u origin mark-collaboration-done",
      "output": [
        "remote:",
        "remote: Create a pull request for 'mark-collaboration-done' on GitHub by visiting:",
        "remote:      https://github.com/you/study-plan/pull/new/mark-collaboration-done",
        "remote:",
        "To https://github.com/you/study-plan.git",
        " * [new branch]      mark-collaboration-done -> mark-collaboration-done",
        "branch 'mark-collaboration-done' set up to track 'origin/mark-collaboration-done'."
      ],
      "note": "The branch is on GitHub, which prints the address that opens a pull request for it. Open it, create the pull request, and merge it on GitHub before the next session."
    }
  ]
}
```

This step happens in a terminal and on GitHub, not in this site.

## Before you start

You need a GitHub account, Git set up as in [Do it on your computer](#/topic/git-basics/8), and the `study-plan` repository from that step.
If you do not have it, press **Download this workspace**, unzip it, rename the folder to `study-plan`, open it in Visual Studio Code, and run `git init -b main`, `git add .`, and `git commit -m "Add the study plan page"` in its terminal.

The editor setting needs Visual Studio Code's `code` command in your terminal: on a Mac, open the Command Palette with **Cmd+Shift+P** in Visual Studio Code and run **Shell Command: Install 'code' command in PATH** once; on Windows the installer adds it.

## Put the repository on GitHub

1. On GitHub, choose **New repository** from the **+** menu at the top right.
2. Name it `study-plan`, leave it **Public**, and leave **Add a README file**, **.gitignore**, and **license** off, so the repository starts empty and your history goes into it unchanged.
3. Press **Create repository**; GitHub shows the address of the repository, `https://github.com/<your name>/study-plan.git`.

Then run the first four commands of the session above in your `study-plan` folder.
The first push asks you to sign in to GitHub, as [A remote on GitHub](#/topic/git-collaboration/3) describes.
Reload the repository page: it shows your files, your `README.md` under them, and, under the commit count, the four commits from Git basics.

## A pull request from a branch

Run the last three commands of the session, with the edit to `src/main.js` its note describes.
Then, on GitHub:

1. Open the address the push printed, or press **Compare & pull request** on the repository page.
2. Check that **base** is `main` and **compare** is `mark-collaboration-done`, write a one-sentence description, and press **Create pull request**.
3. Open **Files changed** and read the one-line diff: `false` became `true`.
4. Back on **Conversation**, press **Merge pull request**, then **Confirm merge**, then **Delete branch**.

## Pull the merge

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git switch main",
      "output": ["Switched to branch 'main'", "Your branch is up to date with 'origin/main'."],
      "note": "Back on main. Up to date is what the last fetch said; the merge on GitHub happened after it."
    },
    {
      "command": "git pull",
      "output": [
        "From https://github.com/you/study-plan",
        "   513db4a..b063134  main       -> origin/main",
        "Updating 513db4a..b063134",
        "Fast-forward",
        " src/main.js | 2 +-",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "Your main had no new commits, so the pull is a fast-forward to GitHub's merge commit, after a few progress lines starting with remote:."
    },
    {
      "command": "git branch -d mark-collaboration-done",
      "output": ["Deleted branch mark-collaboration-done (was e6cd32f)."],
      "note": "The branch is merged into main, so its local name can go too."
    },
    {
      "command": "git log --oneline --graph -3",
      "output": [
        "*   b063134 (HEAD -> main, origin/main, origin/HEAD) Merge pull request #1 from you/mark-collaboration-done",
        "|\\  ",
        "| * e6cd32f (origin/mark-collaboration-done) Mark Git collaboration as done",
        "|/  ",
        "*   513db4a Merge branch 'add-react'"
      ],
      "note": "GitHub's merge commit, named after the pull request, joins your branch into main. That is a merged pull request in your history."
    }
  ]
}
```

Reload `index.html`: the Git collaboration topic is crossed out too.

## A real conflict

A conflict needs two copies of the repository that change the same line.
Work with a partner if you can: on GitHub, in the repository's **Settings > Collaborators**, add your partner, who accepts the invitation by email and clones the repository.
Alone, a second clone in another folder plays the partner; the session below does that.

```demo name="terminal"
{
  "cwd": "cs300",
  "commands": [
    {
      "command": "git clone https://github.com/you/study-plan.git study-plan-second",
      "output": ["Cloning into 'study-plan-second'...", "done."],
      "note": "A second copy of the repository, in its own folder, playing your partner. Run this in the folder that holds study-plan, not inside it."
    },
    {
      "command": "cd study-plan-second",
      "output": [],
      "note": "In the second copy, change the h1 in index.html to Our study plan and save."
    },
    {
      "command": "git commit -am \"Rename the heading to Our study plan\"",
      "output": [
        "[main 49dcda5] Rename the heading to Our study plan",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "The partner's change, committed on main."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan.git", "   b063134..49dcda5  main -> main"],
      "note": "The partner's commit is on GitHub now."
    },
    {
      "command": "cd ../study-plan",
      "output": [],
      "note": "Back in your own copy, which knows nothing about that commit. Change the same h1 in index.html to Study plan for the term and save."
    },
    {
      "command": "git commit -am \"Name the term in the heading\"",
      "output": [
        "[main f3ca37f] Name the term in the heading",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "Your change to the same line, committed on your main."
    },
    {
      "command": "git push",
      "output": [
        "To https://github.com/you/study-plan.git",
        " ! [rejected]        main -> main (fetch first)",
        "error: failed to push some refs to 'https://github.com/you/study-plan.git'"
      ],
      "note": "Rejected, followed by hint lines: GitHub has a commit you do not. Pull first."
    },
    {
      "command": "git pull",
      "output": [
        "From https://github.com/you/study-plan",
        "   b063134..49dcda5  main       -> origin/main",
        "Auto-merging index.html",
        "CONFLICT (content): Merge conflict in index.html",
        "Automatic merge failed; fix conflicts and then commit the result."
      ],
      "note": "The pull's merge stops: both copies changed the same line. Open index.html and resolve it, then go on."
    }
  ]
}
```

## Resolve it for real

Open `index.html` in your `study-plan` folder.
The marked region shows your heading after `<<<<<<< HEAD` and the partner's after `=======`; the closing marker is labeled with the partner's commit hash, because the other side of a pull is a commit, not a branch of yours:

```html
<<<<<<< HEAD
      <h1>Study plan for the term</h1>
=======
      <h1>Our study plan</h1>
>>>>>>> 49dcda5d85e0686dca5500346192f60e4e9b895f
```

Replace the five lines with one heading that keeps both ideas, `<h1>Our study plan for the term</h1>`, and save.

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git add index.html",
      "output": [],
      "note": "Marks the conflict in index.html as resolved."
    },
    {
      "command": "git commit --no-edit",
      "output": ["[main 3d55d67] Merge branch 'main' of https://github.com/you/study-plan"],
      "note": "Finishes the merge with the message Git prepared, which names where the other side came from."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan.git", "   49dcda5..3d55d67  main -> main"],
      "note": "The merge goes up, and this time the push is accepted: it contains the partner's commit."
    },
    {
      "command": "git log --oneline --graph -4",
      "output": [
        "*   3d55d67 (HEAD -> main, origin/main, origin/HEAD) Merge branch 'main' of https://github.com/you/study-plan",
        "|\\  ",
        "| * 49dcda5 Rename the heading to Our study plan",
        "* | f3ca37f Name the term in the heading",
        "|/  ",
        "*   b063134 Merge pull request #1 from you/mark-collaboration-done"
      ],
      "note": "Your commit and the partner's, side by side, joined by the merge you resolved."
    }
  ]
}
```

To finish the loop, go to `study-plan-second` and run `git pull`: it fast-forwards to your merge, and both copies agree again.

## Read more

### With a partner, through pull requests

The conflict above happened on `main` because both copies committed to it directly, which is the fastest way to make one.
On a team, each of you would work on a branch and open a pull request, and the second pull request would show "This branch has conflicts that must be resolved".
The fix is the same work in a different place: on your branch, `git fetch` and `git merge origin/main`, resolve, commit, and push, and the pull request becomes mergeable.

### What GitHub shows now

The repository's **Insights > Network** page draws the same graph as `git log --graph`, and the **Commits** list shows each commit with its author, so a partner's commits show their name and yours show yours.

**If it breaks:** `remote origin already exists` means the remote was added before; `git remote -v` shows its address, and `git remote set-url origin <address>` fixes a wrong one.
`Updates were rejected` on the first push means the GitHub repository was created with a README; run `git pull --allow-unrelated-histories`, keep both sides of any conflict, commit, and push.
If `git commit` or `git pull` opens a Visual Studio Code tab and the terminal seems to hang, it is waiting for you: close the tab to go on.
`code: command not found` means the `code` command is not installed; follow the Mac instruction above, or run `git config --global core.editor "nano"` instead.
If the pull merged without a conflict, the two copies changed different lines; make both change the `<h1>` line and try again.

**Check:** On GitHub, the **Pull requests** tab shows your pull request as merged, and in your `study-plan` folder `git log --oneline --graph` shows the merge of that pull request and, above it, the merge you resolved, with your commit and the second copy's side by side.
Then press **I did this on my computer**.

```quiz
Your push was rejected and the pull that followed stopped with a conflict. After you fix the file, what do you run?
- `git push --force`
= `git add` on the file, `git commit`, then `git push`
- `git pull` again
> The add and the commit finish the merge, and the push is accepted because it now includes the remote's commit.
```
