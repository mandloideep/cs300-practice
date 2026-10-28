---
title: Do it on your computer
mode: local
---

This step runs everything in this topic for real, in your own terminal: you turn a small project into a repository, commit it, make a branch, commit on both branches, merge, and read the log.
The project is a plain page with a stylesheet and a script, so there is nothing to install before the first commit.
Step through each terminal session below before you type its commands, and compare what your terminal prints with it as you go; your hashes and times will differ.

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git --version",
      "output": ["git version 2.54.0"],
      "note": "git --version prints the version of Git. Any version from 2.28 on works for this step."
    },
    {
      "command": "git config --global user.name \"Your Name\"",
      "output": [],
      "note": "Git writes your name into every commit you make. Use your own name; --global sets it once for every repository on this computer."
    },
    {
      "command": "git config --global user.email \"you@example.com\"",
      "output": [],
      "note": "Your email goes into every commit too. Use the email of your GitHub account, so that GitHub links your commits to you in the next topic."
    },
    {
      "command": "git init -b main",
      "output": ["Initialized empty Git repository in /Users/you/cs300/study-plan/.git/"],
      "note": "git init turns the folder into a repository by creating the hidden .git folder. -b main names the first branch main."
    },
    {
      "command": "git status",
      "output": [
        "On branch main",
        "",
        "No commits yet",
        "",
        "Untracked files:",
        "  (use \"git add <file>...\" to include in what will be committed)",
        "\t.gitignore",
        "\tREADME.md",
        "\tindex.html",
        "\tsrc/",
        "\tstyles.css",
        "",
        "nothing added to commit but untracked files present (use \"git add\" to track)"
      ],
      "note": "Every file is untracked: Git sees the files but has never recorded them."
    },
    {
      "command": "git add .",
      "output": [],
      "note": "git add . stages every file in the folder that .gitignore does not exclude. It prints nothing when it works."
    },
    {
      "command": "git status",
      "output": [
        "On branch main",
        "",
        "No commits yet",
        "",
        "Changes to be committed:",
        "  (use \"git rm --cached <file>...\" to unstage)",
        "\tnew file:   .gitignore",
        "\tnew file:   README.md",
        "\tnew file:   index.html",
        "\tnew file:   src/main.js",
        "\tnew file:   styles.css"
      ],
      "note": "The five files are staged as new files, which is exactly what the first commit will record."
    },
    {
      "command": "git commit -m \"Add the study plan page\"",
      "output": [
        "[main (root-commit) e12a937] Add the study plan page",
        " 5 files changed, 59 insertions(+)",
        " create mode 100644 .gitignore",
        " create mode 100644 README.md",
        " create mode 100644 index.html",
        " create mode 100644 src/main.js",
        " create mode 100644 styles.css"
      ],
      "note": "The first commit. root-commit means it has no parent, and e12a937 is the start of its hash; yours differs."
    },
    {
      "command": "git log --oneline",
      "output": ["e12a937 (HEAD -> main) Add the study plan page"],
      "note": "The log holds one commit, and HEAD points at main, which points at it."
    }
  ]
}
```

This step happens in a terminal, not in this site.

## Install Git and open the project

Open a terminal and run `git --version`.
If it prints a version, Git is installed.
If the command is not found, install Git from [git-scm.com/downloads](https://git-scm.com/downloads), then close the terminal and open a new one; on a Mac, running `git --version` the first time may offer to install the command line developer tools instead, which include Git.

Press **Download this workspace** on this step and unzip the file.
Rename the unzipped folder from `git-basics-step-8` to `study-plan`, move it to the folder where you keep your course work, and open it in Visual Studio Code with **File > Open Folder**.
Open a terminal there with `` Ctrl+` `` or **Terminal > New Terminal**; it starts inside `study-plan`.
This project has no `package.json`, so there is nothing to install: double-click `index.html` in your file manager to open the page, which lists three topics with the first one crossed out.

## Tell Git who you are, once

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

Use your own name and the email of your GitHub account.
If you set these in class already, `git config --global user.name` prints the name you set, and you can skip them.

## Make the repository and the first commit

```bash
git init -b main
git status
git add .
git status
git commit -m "Add the study plan page"
git log --oneline
```

The first session above shows what each of these prints.

## A branch, a commit on each side, and a merge

Now make the history from [Merge a branch](#/topic/git-basics/7): a branch with one commit, one more commit on `main`, and a merge commit that joins them.
Two of the commands come after an edit you make in Visual Studio Code; the session says which.

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git switch -c add-react",
      "output": ["Switched to a new branch 'add-react'"],
      "note": "A new branch at the current commit, with HEAD on it. Now open src/main.js, add the line { title: \"Build a React project\", done: false }, after the Deploy line, and save."
    },
    {
      "command": "git diff",
      "output": [
        "diff --git a/src/main.js b/src/main.js",
        "index 2a55290..df5ef9f 100644",
        "--- a/src/main.js",
        "+++ b/src/main.js",
        "@@ -2,6 +2,7 @@ const topics = [",
        "   { title: \"Git basics\", done: true },",
        "   { title: \"Git collaboration\", done: false },",
        "   { title: \"Deploy with GitHub Pages\", done: false },",
        "+  { title: \"Build a React project\", done: false },",
        " ];",
        " ",
        " const list = document.querySelector(\"#topics\");"
      ],
      "note": "git diff shows the unstaged change: one line added, marked with +. Press q if the diff opens in a pager."
    },
    {
      "command": "git commit -am \"Add a React project to the plan\"",
      "output": ["[add-react 756f18c] Add a React project to the plan", " 1 file changed, 1 insertion(+)"],
      "note": "-a stages every change to a tracked file and -m gives the message, so one command commits the edit. The commit lands on add-react."
    },
    {
      "command": "git switch main",
      "output": ["Switched to branch 'main'"],
      "note": "Back on main, src/main.js no longer has the React line. Now open styles.css, add color: gray; under text-decoration: line-through; in the .done rule, and save."
    },
    {
      "command": "git commit -am \"Gray out the finished topics\"",
      "output": ["[main 483328b] Gray out the finished topics", " 1 file changed, 1 insertion(+)"],
      "note": "A commit on main. main and add-react have now diverged: each has a commit the other does not."
    },
    {
      "command": "git merge --no-edit add-react",
      "output": [
        "Merge made by the 'ort' strategy.",
        " src/main.js | 1 +",
        " 1 file changed, 1 insertion(+)"
      ],
      "note": "Because main moved, Git makes a merge commit. --no-edit keeps the message Merge branch 'add-react' without opening an editor."
    },
    {
      "command": "git log --oneline --graph",
      "output": [
        "*   513db4a (HEAD -> main) Merge branch 'add-react'",
        "|\\  ",
        "| * 756f18c (add-react) Add a React project to the plan",
        "* | 483328b Gray out the finished topics",
        "|/  ",
        "* e12a937 Add the study plan page"
      ],
      "note": "Read from the bottom: the first commit, the two branches side by side, and the merge commit that joins them."
    },
    {
      "command": "git branch -d add-react",
      "output": ["Deleted branch add-react (was 756f18c)."],
      "note": "The branch is merged, so its name can go. The commit stays in the history."
    },
    {
      "command": "git log --oneline --graph",
      "output": [
        "*   513db4a (HEAD -> main) Merge branch 'add-react'",
        "|\\  ",
        "| * 756f18c Add a React project to the plan",
        "* | 483328b Gray out the finished topics",
        "|/  ",
        "* e12a937 Add the study plan page"
      ],
      "note": "The same history without the add-react label: a repository with a merged branch in its log."
    }
  ]
}
```

Reload `index.html` in the browser after the merge: it lists four topics, and the crossed-out one is gray, so both branches' work is on `main`.

## Read more

### Keep this repository

The next topic, [Git collaboration](#/topic/git-collaboration), starts from this `study-plan` repository: it puts it on GitHub, opens a pull request, and makes a real conflict.
Keep the folder where it is.

### What Visual Studio Code shows

The **Source Control** view in Visual Studio Code, the branch icon in the left bar, reads the same repository.
It lists changed files as `git status` does, and its **+** next to a file is `git add`.
Use the terminal for this topic so you see each command, and use the view later when it is quicker.

**If it breaks:** `git: command not found` or `'git' is not recognized` means Git is not installed or the terminal was opened before installing it; open a new terminal.
`error: unknown switch 'b'` after `git init -b main` means Git is older than 2.28; update it from [git-scm.com/downloads](https://git-scm.com/downloads).
`Author identity unknown` means the two `git config` commands did not run; run them and commit again.
`fatal: not a git repository` means the terminal is not inside `study-plan`; open the folder itself in Visual Studio Code.
On Windows, `warning: in the working copy of 'index.html', LF will be replaced by CRLF` is Git converting line endings and is harmless.
If a command opens an editor full of lines starting with `#`, a `-m` or `--no-edit` was left out; save and close the editor to go on.

**Check:** `git log --oneline --graph` in your `study-plan` folder shows four commits, with the merge commit at the top and the two branches drawn side by side, and the page lists four topics with the crossed-out one in gray.
Then press **I did this on my computer**.

```quiz
After `git branch -d add-react`, where is the commit "Add a React project to the plan"?
- Gone, with the branch
- Only in the `.git` folder of a backup
= Still in the history, as the second parent of the merge commit
> Deleting a branch removes only its name; `main` reaches the commit through the merge.
```
