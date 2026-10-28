---
title: Deploy a Vite project
mode: local
---

This step puts a React project on the web at your own address, built and published by the workflow from the last step.
The project in this step's download is ready for it: it carries `.github/workflows/deploy.yml`, `base: "./"` in `vite.config.js`, and a `.gitignore`, so the only setting left is the Pages source.
Step through the session before you type it; your hashes, counts, and GitHub name will differ.

```demo name="terminal"
{
  "cwd": "study-plan-react",
  "commands": [
    {
      "command": "npm install",
      "output": [
        "added 19 packages, and audited 20 packages in 1s",
        "",
        "8 packages are looking for funding",
        "  run `npm fund` for details",
        "",
        "found 0 vulnerabilities"
      ],
      "note": "Installs React and Vite and writes package-lock.json, which the workflow's npm ci needs. It must be committed."
    },
    {
      "command": "npm run build",
      "output": [
        "> study-plan-react@0.0.0 build",
        "> vite build",
        "",
        "vite v8.3.5 building client environment for production...",
        "transforming...",
        "✓ 16 modules transformed.",
        "rendering chunks...",
        "computing gzip size...",
        "dist/index.html                   0.39 kB │ gzip:  0.26 kB",
        "dist/assets/index-ChJn_2o4.css    0.39 kB │ gzip:  0.25 kB",
        "dist/assets/index-Bt2-u-hP.js   190.60 kB │ gzip: 60.05 kB",
        "",
        "✓ built in 241ms"
      ],
      "note": "The same build the workflow will run. If it works here, it works on GitHub; dist stays out of the repository because .gitignore lists it."
    },
    {
      "command": "git init -b main",
      "output": ["Initialized empty Git repository in /Users/you/cs300/study-plan-react/.git/"],
      "note": "The project becomes a repository with a main branch, the branch the workflow deploys."
    },
    {
      "command": "git add .",
      "output": [],
      "note": "Stages every file except node_modules and dist, which .gitignore excludes."
    },
    {
      "command": "git commit -m \"Add the study plan React project\"",
      "output": [
        "[main (root-commit) 6a5667c] Add the study plan React project",
        " 10 files changed, 1044 insertions(+)",
        " create mode 100644 .github/workflows/deploy.yml",
        " create mode 100644 .gitignore",
        " create mode 100644 README.md",
        " create mode 100644 index.html",
        " create mode 100644 package-lock.json",
        " create mode 100644 package.json",
        " create mode 100644 src/App.jsx",
        " create mode 100644 src/main.jsx",
        " create mode 100644 styles.css",
        " create mode 100644 vite.config.js"
      ],
      "note": "Ten files, with the workflow and the lockfile among them, and no node_modules or dist."
    },
    {
      "command": "git remote add origin https://github.com/you/study-plan-react.git",
      "output": [],
      "note": "Create the empty study-plan-react repository on GitHub first, then use the address it shows."
    },
    {
      "command": "git push -u origin main",
      "output": [
        "To https://github.com/you/study-plan-react.git",
        " * [new branch]      main -> main",
        "branch 'main' set up to track 'origin/main'."
      ],
      "note": "The push to main starts the workflow. Now set the Pages source to GitHub Actions and watch the run in the Actions tab."
    }
  ]
}
```

This step happens in a terminal and on GitHub, not in this site.

## Download and build

Press **Download this workspace**, unzip it, rename the folder to `study-plan-react`, and open it in Visual Studio Code.
Run `npm install` and `npm run build` in its terminal, as in the first two commands of the session.
`npm run dev` shows the page on your computer first if you want to see it: a heading and three topics, two of them crossed out.

## Commit and push

1. On GitHub, create a new **public** repository named `study-plan-react`, with no README, `.gitignore`, or license, as in [Ship it together](#/topic/git-collaboration/8).
2. Run the rest of the session: `git init -b main`, `git add .`, the commit, `git remote add origin` with your address, and `git push -u origin main`.

## Turn on Pages and watch the run

1. In the repository, open **Settings > Pages** and set **Source** to **GitHub Actions**.
2. Open the **Actions** tab: the run **Add the study plan React project** started with your push.
If it is still running, it will publish; if it already failed at the **deploy** job, it started before Pages was on, so choose **Deploy to GitHub Pages** on the left and press **Run workflow** to start a new run.
3. Open the run and watch **build** and then **deploy** turn green; the **deploy** job shows the address under its name.

Open `https://<your name>.github.io/study-plan-react/`: your React project is on the web, built on GitHub from the files you pushed.

## Read more

### The checklist for any project

To deploy another Vite project, such as one you downloaded from an earlier step or your own course project, check these five things first; [The address and the base](#/topic/deploy-with-github-pages/3) explains each.

1. `base: "./"` in `vite.config.js`, so that the built page finds its assets at any address; this step's project already has it.
2. The Pages source in the repository's **Settings > Pages**: **GitHub Actions** for a Vite project and **Deploy from a branch** for a plain page.
3. `HashRouter` in place of `BrowserRouter`, or a `404.html` that copies `index.html`, in a project that uses React Router.
4. A `.gitignore` with `node_modules` and `dist`, so that the installed packages and the built files are never committed.
5. Nothing secret in the project, since every file of a public repository and every built file is public; a `.env` may hold a public API address and nothing else.

Then copy `.github/workflows/deploy.yml` from this step's project into it, with the same folder names, commit, and push.

### What the workflow used

The run used only what you committed: `package.json` and `package-lock.json` for `npm ci`, the source files for `npm run build`, and the workflow itself.
That is why a project that builds on your computer but not on GitHub almost always has a file that was never committed, or a lockfile that is out of date.

**If it breaks:** A red **build** job with `Dependencies lock file is not found` means `package-lock.json` was not committed; run `npm install`, commit the lockfile, and push.
`npm ci` failing with a message that `package.json` and `package-lock.json` must be in sync means the two were changed separately; run `npm install` on your computer, commit both, and push.
A red **deploy** job whose log asks you to ensure GitHub Pages has been enabled means the Pages source is not GitHub Actions; set it and press **Run workflow**.
A blank page with a 404 for a file under `/assets/` in the console means `base: "./"` is missing from `vite.config.js`.
If the address shows GitHub's 404 page, the first deploy has not finished; wait for the green run.

**Check:** The run in the **Actions** tab is green, and `https://<your name>.github.io/study-plan-react/` shows the heading and the three topics.
Then press **I did this on my computer**.

```quiz
Why is `dist` not in the repository, though the site is built from it?
- GitHub Pages builds the site from `src` by itself
= The workflow runs `npm run build` on GitHub and publishes the `dist` it makes
- `dist` is committed, but hidden
> The workflow builds `dist` fresh on every run, so committing it would only add files that are rebuilt anyway.
```
