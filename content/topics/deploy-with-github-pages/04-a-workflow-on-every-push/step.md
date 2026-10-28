---
title: A workflow on every push
mode: read
---

A Vite project's `dist` folder is never committed, so GitHub has to build it before Pages can publish it.
A **GitHub Actions workflow**, a file in the repository, tells GitHub to do that on every push: install, build, and deploy, on a fresh computer, in that order.
Step through the picture of one run, and notice that the site changes only at the last stage, after everything before it has passed.

```demo name="ci-pipeline"
{ "stages": ["install", "build", "deploy"], "failAt": null }
```

## The file

The workflow lives at `.github/workflows/deploy.yml`, and the project this topic downloads carries it.
It is this site's own deploy workflow cut down to what a project without tests needs.
The file is YAML, where indentation shows what belongs to what; read it a part at a time.

```text
name: Deploy to GitHub Pages
```

The name the **Actions** tab shows for every run of this workflow.

```text
on:
  push:
    branches: [main]
  workflow_dispatch:
```

The **trigger**: a run starts on every push to `main`, and `workflow_dispatch` adds a **Run workflow** button in the Actions tab, so you can start one by hand.
A push to another branch does not deploy, so work on a branch can be pushed and reviewed without changing the live site.

```text
permissions:
  contents: read
  pages: write
  id-token: write
```

What the run may do: read the repository, publish to Pages, and prove to Pages which repository and run it comes from.
Nothing else, so a mistake in the workflow cannot change the repository itself.

```text
concurrency:
  group: pages
  cancel-in-progress: false
```

At most one deployment at a time; a run started by a second quick push waits for the first instead of racing it.

```text
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist
```

The **build** job gets a fresh Linux computer from GitHub and runs its steps in order.
`checkout` copies the repository onto it, `setup-node` installs Node 24, the version this course uses, and keeps npm's downloads between runs, `npm ci` installs exactly what `package-lock.json` lists, `npm run build` writes `dist`, and `upload-pages-artifact` packs `dist` for Pages.
`npm ci` is `npm install` for machines: it never changes the lockfile and fails if `package.json` and the lockfile disagree, which is why the lockfile must be committed.

```text
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v5
```

The **deploy** job publishes the packed `dist`.
`needs: build` makes it wait for the build job and skip entirely if the build failed, so a broken build never reaches the site.
The `environment` gives the run a link to the live address, which the Actions tab shows on the run's summary.

## Set the Pages source to GitHub Actions

A workflow can publish only when the repository allows it: in **Settings > Pages**, set **Source** to **GitHub Actions**.
This is the one setting a Vite project needs, and [Deploy a Vite project](#/topic/deploy-with-github-pages/5) does it.

## What the Actions tab shows

Each push to `main` adds a run to the repository's **Actions** tab, named after its commit message, with a yellow dot while it runs, then a green check mark or a red cross.
Open a run to see its two jobs and, inside each, every step with its log.
A failed step is marked red and its log ends with the error, the same one `npm run build` prints on your computer.

## Read more

### This site's deploy.yml

This site's own `.github/workflows/deploy.yml` has the same `build` and `deploy` jobs, the same permissions, and the same actions, with three additions.
Its `build` job also runs `npm run lint`, `npm run format:check`, `npm run validate`, and `npm run test:scripts`; a `test` job runs the Playwright suite in three parallel parts; and the trigger is a schedule, every Monday at 12:00 UTC, plus the **Run workflow** button, because this site opens one week of Guided Practice at a time.
A separate workflow, `check.yml`, runs the same checks on every push to `main` and every pull request without deploying, which is what [A pull request](#/topic/git-collaboration/4) showed.

### Why versions after @

`actions/checkout@v7` pins the major version of each action, so a breaking change in a later version cannot break your deploy without your knowing.
When a new major version comes out, a workflow is updated on purpose, in a commit of its own.

**Check:** You can say what starts a run of this workflow, what each of the two jobs does, and why a failed build cannot change the live site.
Then press **Mark this step as read**.

```quiz
A push changes only `README.md` on `main`. Does the workflow run?
= Yes; every push to `main` starts a run, whatever it changes
- No; only changes under `src` start a run
- Only when someone presses Run workflow
> The trigger is any push to `main`; the build simply produces the same site again.
```

```quiz
The build job fails at `npm run build`. What happens to the live site?
- It shows an error page until the next run
= Nothing; the deploy job never runs, so the last good version stays live
- It goes offline
> `needs: build` skips the deploy job when the build fails, so only a green run can change the site.
```
