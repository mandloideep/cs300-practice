---
title: A plain page from a branch
mode: local
---

The `study-plan` page from the Git topics is already a static site: an `index.html`, a stylesheet, and a script, with no build step.
In this step you publish it with GitHub Pages straight from its `main` branch, open it at your own address, and then push a change and watch the page follow.
Step through the session first; most of this step happens in the repository's settings on GitHub, and the terminal is for the change at the end.

```demo name="terminal"
{
  "cwd": "study-plan",
  "commands": [
    {
      "command": "git switch main",
      "output": ["Already on 'main'", "Your branch is up to date with 'origin/main'."],
      "note": "Pages will publish main, so start there."
    },
    {
      "command": "git pull",
      "output": ["Already up to date."],
      "note": "Your copy and GitHub's agree, so the page Pages publishes is the one in your folder. Now turn on Pages in the repository's settings, as below, and open the address."
    },
    {
      "command": "git commit -am \"Add a footer\"",
      "output": ["[main a282901] Add a footer", " 1 file changed, 1 insertion(+)"],
      "note": "Before this, add <footer>Published with GitHub Pages</footer> after </main> in index.html and save. The change is committed but only on your computer."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan.git", "   3d55d67..a282901  main -> main"],
      "note": "The push reaches main on GitHub, and Pages publishes the branch again on its own. Reload the page in a minute to see the footer."
    }
  ]
}
```

This step happens in a terminal and on GitHub, not in this site.

## Before you start

You need the `study-plan` repository on GitHub from [Ship it together](#/topic/git-collaboration/8).
If you do not have it, press **Download this workspace**, unzip it, rename the folder to `study-plan`, and follow the first part of that step to make it a repository and push it to a new public repository named `study-plan`.
GitHub Pages is free for public repositories on a free account.

## Turn on Pages from the branch

1. Open the repository on GitHub and choose **Settings**, then **Pages** in the left column.
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Under **Branch**, choose `main` and the folder `/ (root)`, and press **Save**.

GitHub starts publishing at once.
The **Actions** tab shows a run named **pages build and deployment**, which GitHub made for you; in a minute or so it turns green, and the **Pages** settings show **Your site is live at** with the address.

## Open your address

The address is `https://<your name>.github.io/study-plan/`, with your GitHub name in lowercase.
Open it: the page shows your heading, the list of topics with the finished ones crossed out in gray, exactly as `index.html` showed on your computer.
Anyone with the address can open it now, on any computer or phone.

The page works at that address because of how its files point at each other.
`index.html` loads `styles.css` and `src/main.js` with relative paths, which the browser resolves against the page's own folder, `/study-plan/`.
[The address and the base](#/topic/deploy-with-github-pages/3) shows what happens to a project whose paths start with `/` instead.

## Push a change

Run the session above: add the footer, commit, and push.
The push starts a new **pages build and deployment** run in the **Actions** tab, and when it is green, a reload of your address shows the footer.
From now on, every push to `main` updates the site.

## Read more

### What Pages did

With **Deploy from a branch**, Pages takes the files of `main` as they are and copies them to its servers; there is no build, which is why it suits a plain page and not a Vite project, whose `dist` folder is not in the repository.
The run in the Actions tab is GitHub's own workflow for this, so you see when a publish starts, when it finishes, and whether it failed, just as you will with your own workflow in the next steps.

### A page that is gone or stale

A browser keeps copies of the files it loaded, so a reload right after a push can still show the old page for a minute.
Wait for the run to finish, then reload; a forced reload, **Ctrl+Shift+R** or **Cmd+Shift+R**, asks for fresh copies.

**If it breaks:** If the address shows GitHub's 404 page, the first publish has not finished; wait for the green run in **Actions** and reload.
If the page shows but has no styles or no list, a path in `index.html` starts with `/`; it should be `styles.css` and `src/main.js`, as in the download.
If **Settings** has no **Pages** entry, the repository is private on a free account; make it public under **Settings > General > Danger Zone > Change visibility**.

**Check:** Your page opens at `https://<your name>.github.io/study-plan/` with its styles and its list, and after your push it shows the footer.
Then press **I did this on my computer**.

```quiz
After you set the Pages source to the `main` branch, what does a push to `main` do?
- Nothing, until you press Save in the settings again
= Starts a new publish of the branch, and the page updates when it finishes
- Builds the project with `npm run build` first
> Deploy from a branch republishes on every push to that branch, with no build step.
```
