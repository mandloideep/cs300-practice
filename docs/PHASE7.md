# Phase 7 plan: CS300 Practice, the project tree, Git, and deployment

Phase 6 made every step interactive-first, and Fall 2026 is the first semester in which students use the site.
Four things stand between the site and that semester.
The first is its name: the course reserves "lab" for the graded AI Labs, so the site becomes **CS300 Practice**, each week's set of topics becomes that week's **Guided Practice**, and the word "lab" leaves the repository name, the address, the interface, and the content, as [FALL-2026.md](FALL-2026.md) lays out.
The second is the shape of a project: the editor shows a step's files as a flat row of tabs, so a student never sees that `main.jsx` sits inside `src/`, never learns what each file is for, and never learns which files a real project has that the site leaves out, such as `package.json`, `node_modules`, and `dist`.
The third is version control: Git has been taught in class this term, but the site has nothing for it beyond one sentence about committing the lockfile, so a student has nowhere to practice a commit, a branch, a conflict, or a pull request.
The fourth is deployment: a student can download a project from any step and cannot put it on the web, although the site itself is deployed from GitHub on every push.
Phase 7 does all four for Fall 2026 alone: the rename and the fall-only release first, then two Git topics and a deployment topic in a unit that opens the day they merge, then a file tree in every edit step that names each file and shows the files the downloaded project will have.
Spring 2027 stays in the repository, is not deployed, and is not touched; its path is planned when the semester approaches.
The design in [DESIGN.md](DESIGN.md) does not change: the site stays static, nothing runs on a server, and Git itself runs only on the student's own computer.

The curriculum numbering shifts: the topics [CURRICULUM.md](CURRICULUM.md) marks Phase 7 today, `styling-with-tailwind`, `widely-used-libraries`, `code-quality`, and `http-and-apis`, become Phase 8, and the production topics become Phase 9.
The two Git topics take the place of the Git steps those later topics planned, as the "Changes to the curriculum" section says.

## What Phase 7 delivers

- **The name.** The repository is renamed `cs300-practice`, the site is served at `/cs300-practice/`, the header reads CS300 Practice, and every student-facing string in the source, the content, the D2L export, and the downloaded workspace README says CS300 Practice, Guided Practice, this site, or the browser, never "lab".
  The `using-the-lab` topic becomes `getting-started`, titled "Using CS300 Practice".
- **Fall 2026 only.** `spring-2027.json` is marked inactive, Weeks 11 to 13 of `fall-2026.json` get their `opens` dates, and the Foundations unit that holds the HTML, CSS, JavaScript, DOM, fetch, and tooling topics stays open from the first day, so that the deployed site shows one path, one week at a time, with the earlier material there to revisit.
- **The D2L export for Fall 2026.** The export page heads the week's topics "Guided Practice", says in one line that it is practice with nothing graded and nothing submitted, carries a "Before you start" block on the Week 10 page about browser storage and the tour, and links with the new address.
- **The file tree.** The flat tabs in the editor of every edit step are replaced by a tree with folders, following the WAI-ARIA tree pattern, with the edited-file mark kept and the same keyboard reach as the tabs had.
- **What each file is.** Selecting a file in the tree shows a one-line description under it: what the file is for and who loads it.
  Descriptions come from a site dictionary of well-known paths, and a step can override or add to them in its front matter.
- **The files the site leaves out.** A collapsed "On your computer" group at the bottom of the tree lists the files the downloaded project has beyond the workspace, `package.json`, `package-lock.json`, `vite.config.js`, `.gitignore`, `node_modules/`, and `dist/`, each with a description and a mark that says it is not editable here.
  The list is computed by the same code that writes "Download this workspace", so the tree and the download never disagree.
- **A `project-tree` explainer.** An interactive tree for explanations, driven by the fence body, that grows a stage at a time: the folder after `npm create vite`, after `npm install`, after `npm run build`.
  It serves `getting-started`, `vite-project-anatomy`, `tooling-from-scratch`, `modules-and-imports`, `app-architecture`, and the Git topics.
- **A step about the files.** A new step in `getting-started`, "The files of a step", that uses the tree, and short additions to the steps of `vite-project-anatomy` and `tooling-from-scratch` that already talk about files but cannot show them.
- **The tour and the page tour.** The editor stop of the step-page tour and the `page-tour` explainer mention the tree and the "On your computer" group.
- **Six Git explainers.** `three-trees`, `commit-graph`, `branch-and-merge`, `merge-conflict`, `remote-sync`, and `pull-request-flow`, each one moving picture of one Git idea, built on the same kit and contract as every Phase 6 explainer.
- **Two Git topics.** `git-basics` in the `tooling` area, from "why keep history" through branches and merges on one computer, and `git-collaboration`, from a conflict through remotes, pull requests, review, and how a team works in one repository.
  Both are read steps with explainers and quizzes, one edit step where the student resolves a conflict inside the site, and local steps where the student runs real Git in their own terminal and on GitHub.
- **A deployment topic.** `deploy-with-github-pages`, from what a static host serves, through a plain page published from a branch, to a Vite project built and published by a GitHub Actions workflow on every push, with the workflow file ready to use and a checklist of what to change in a project before it deploys.
- **Deployable downloads.** Every Vite project that "Download this workspace" writes gains the deploy workflow, a relative `base`, and a README section that says how to put it on GitHub Pages, so a student deploys any step's project without editing it.
- **Two deployment explainers.** `static-deploy` and `ci-pipeline`, pulled forward from the production phase, since the deployment topic needs them now.
- **A Git and GitHub unit in Fall 2026.** The three topics in a unit of `fall-2026.json` with no `opens` date, so it is on the deployed site the day its topics merge.
- **Documentation.** The file tree, the `files` front-matter field, and the `project-tree` fence body in [CONTRACTS.md](CONTRACTS.md) section 8, the README's title, addresses, "How the site is organized", and "Adding an explainer" sections, the new rows in [EXPLAINERS.md](EXPLAINERS.md) and [CURRICULUM.md](CURRICULUM.md), and [FALL-2026.md](FALL-2026.md) checked off as each item lands.

## The name and the semester

### CS300 Practice

[FALL-2026.md](FALL-2026.md) sections A and B are the complete list; this plan fixes the order and what stays.
The repository is renamed on GitHub first, by the instructor, and the local remote is pointed at it.
Then one commit changes every hardcoded path: `base` in `vite.config.js`, the two addresses in `playwright.config.js`, the runtime URL pattern in `tests/runner.spec.js`, `SITE_URL` in `scripts/export-d2l.mjs`, `name` in `package.json`, and the README and the docs.
A second commit renames the site: the header wordmark, the document title suffix, the home page, `index.html`, the progress import messages, the downloaded workspace README, the two runtime messages that say "the lab", the harness title, the export link text, the scaffold templates, and every test that asserts on one of those strings.
A third commit renames the content: `using-the-lab` becomes `getting-started` with the title "Using CS300 Practice" and its six steps reworded, and the roughly 216 uses of "lab" in 94 files under `content/` become "CS300 Practice" where the site is named and "this site" or "the browser" where the prose means the place the code runs, including the Spring topics so that Spring does not inherit the old name.
The deploy runs by hand after the three commits land, and no link is posted in D2L until the new address serves the site.

What stays: the `cs300-lab` message source, the `cs300-lab:progress` and `cs300-lab:custom-base` storage keys, the `__LAB__` bridge object, and `LAB_BUILD_DATE`.
Students never see them, and renaming the progress key would discard the progress of anyone who used the site before the rename.

The rename lands before any other Phase 7 work branches, because it touches every topic folder and most of `src/`, and a stream that branched earlier would merge the old name back in.

### Fall 2026 only

`content/paths/spring-2027.json` gains `"active": false`, so the build leaves it out and the deployed home page shows Fall 2026 alone; validation still checks the Spring content.
`content/paths/fall-2026.json` has six units: `foundations`, open from the first day and holding the fifteen HTML, CSS, JavaScript, DOM, fetch, and tooling topics as optional; `git-and-github`, open from the first day and holding `git-basics`, `git-collaboration`, and `deploy-with-github-pages`; `week-10`, open now; and `week-11`, `week-12`, and `week-13` with `opens` of `2026-11-02`, `2026-11-09`, and `2026-11-16`, which the Monday run of `deploy.yml` opens.
Git was taught in class before the site opened, so its unit is practice for taught material like Foundations and its topics are optional; changing a topic to required is one word in the path file.
The unit's intro says that in one paragraph and that the deployment topic is where a student's own project goes on the web.
The instructor previews each Monday before it happens with `LAB_BUILD_DATE=2026-11-02 npm run build && npm run preview` and walks the path page.

### The D2L export

`scripts/export-d2l.mjs` heads the topic lists "Guided Practice" and "Optional practice", prints one line under the intro that says this is practice, not graded, with no submission, and on the Week 10 page prints a "Before you start" block: progress stays in the browser you use, so use your own laptop or export your progress from the home page; a private window forgets everything; take the fifteen-minute tour first.
The pages are re-exported with `LAB_BUILD_DATE=2026-12-13` so that every week is written at once, and copied into the course repository's posting kit.
A `session` field on each unit topic entry, so that the export can group a week's topics by session, is a decision for the instructor and is not in this plan; without it the Lesson placement is done by hand, as today.

## The file tree

### What the student sees

At desktop width the editor pane has two columns: the tree on the left, about twelve rem wide, and the code on the right.
A **Files** button in the editor header hides and shows the tree, and the choice is kept in progress as a site preference, so a student who wants the whole width for code sets it once.
At phone width the tree is a disclosure above the code that shows the active file's path and opens the tree in place, so the code never shares the width with it.

The tree shows the workspace files in their folders, folders first, then files, each level sorted by name, with every folder expanded at first.
The active file is marked as selected, and an edited file keeps the dot the tabs show today.
Selecting a file opens it in the editor and shows its description in one line under the tree, in the muted meta style.

The last node of the tree is a collapsed group, **On your computer**, that holds the files the downloaded project has beyond the workspace.
For a React workspace those are `package.json`, `package-lock.json`, `vite.config.js`, `.gitignore`, `node_modules/`, and `dist/`, plus `.env` when the step reads an API base, and for a vanilla workspace only `README.md`.
Selecting one shows its description and the sentence "This file is not in CS300 Practice; it is in the project you download."
`package-lock.json`, `node_modules/`, and `dist/` carry a second sentence that says which command creates them.

### Where the descriptions come from

`src/editor/fileRoles.js` is a dictionary of well-known paths and patterns with a one-sentence description each: `index.html`, `src/main.jsx`, `src/App.jsx`, `styles.css` and `src/*.css`, `src/components/*.jsx`, `src/hooks/use*.js`, `src/data/*.json`, `src/main.js` and `src/*.js` in a vanilla workspace, and every file of the "On your computer" group.
A file that matches nothing gets "A file of this step's project" rather than nothing, so the line is never empty.

A step may carry a `files` field in its front matter that maps workspace paths to a sentence, which replaces the dictionary's sentence for that path in that step.
The content build copies it into the compiled step as `fileNotes`, and the validator rejects a path that is not in the workspace.
The retrofit of existing topics is not part of Phase 7; the dictionary covers today's workspaces, and a step adds `files` only when its own files need a sentence of their own.

### How the tree is built

The tree is computed by one pure function, `projectLayout(step, files, api)` in `src/ui/workspaceProject.js`, that returns the ordered list of entries with their depth, kind, source (workspace or download), and description, and the zip builder is rewritten to write exactly the files that function lists.
`src/editor/FileTree.jsx` renders that list, replaces `FileTabs.jsx` in `CodeEditor.jsx`, and takes the same place in `SolutionDiff.jsx`, where the "On your computer" group is left out because the diff compares workspace files only.
`FileTabs.jsx` is deleted.

Keyboard: the tree is one tab stop; Up and Down move between visible nodes, Left collapses a folder or moves to its parent, Right expands a folder or moves to its first child, Home and End jump to the ends, Enter or Space opens a file, and typing a letter moves to the next node that starts with it.
The editor's existing `jumpTo` keeps working through the tree, and the console's and inspector's links to a file line still land on the right file.

Tests: `tests/files.spec.js` covers the tree's keyboard pattern, the edited-file mark, the descriptions, the "On your computer" group for a React, a router, a fetching, and a vanilla step, the Files preference, the phone-width disclosure, and that the entries the tree lists for a step are exactly the paths in the zip that the download writes; `tests/a11y.spec.js` gains the tree.

### The `project-tree` explainer

The fence body is an indented listing, one entry per line, a folder ending in `/`, and a description after two or more spaces; a `stage:` line starts a stage, and a line that starts with `+` in a later stage is a file that appears at that stage.

````markdown
```demo name="project-tree"
stage: After npm create vite
my-first-react/
  index.html          The page the browser opens; React draws inside its root div
  package.json        The project's name, its scripts, and the packages it needs
  src/
    main.jsx          Finds the root div and renders App into it
    App.jsx           The top component
stage: After npm install
+ node_modules/       Every installed package; never edited, never committed
+ package-lock.json   The exact version npm chose for every package
stage: After npm run build
+ dist/               The built site a server hosts; rebuilt from src, never edited
```
````

Step moves between stages, a file that appeared in the current stage is marked fresh, selecting a file shows its description, and the caption names the command that produced the stage.
With no `stage:` lines the whole listing is one stage and the explainer is a labeled tree with Step moving the selection through the files.
The validator parses the body and rejects an indentation that does not nest or a `+` line outside a later stage.

## Git in CS300 Practice

### Decisions

Git does not run inside the site.
A Git implementation for the browser would be a large dependency, would still not be the Git the student types into their own terminal, and would teach the site rather than the tool.
So the Git ideas are taught the way Phase 6 teaches the event loop: an explainer models the idea and the student drives it, a predict or quiz block asks what Git will say before Git says it, and a local step has the student run the real commands in their own terminal with the `terminal` explainer scripting what they will see.
One idea does run in the site: a merge conflict is a file with markers in it, and resolving one is an edit, so that step is an edit step with a check.

The two topics use this repository as the worked example wherever a real repository is needed, as the production topics plan to: its commits, its branches, its pull requests, and its `check.yml` that runs on every pull request.

### `git-basics`

Area `tooling`, no prerequisites, about fifty minutes.
A student can take it in any week, since it needs only a terminal and the project they download from any step.

| Step | Mode | Shows | Explainer |
| --- | --- | --- | --- |
| why-keep-history | read | A folder of copies named `final-v2`, and what a repository gives instead: every version, who changed what, and a way back; what a repository, a commit, and the working tree are | `commit-graph` |
| the-three-places | read | The working tree, the staging area, and the repository; `git status`, `git add`, `git commit`, and why the staging step exists; what a commit message is for | `three-trees` |
| read-the-history | read | `git log`, `git diff`, `git show`; a commit as a snapshot with a hash and a parent; which changes a diff shows | `commit-graph` |
| what-to-commit | read | `.gitignore`, the lockfile rule from `tooling-from-scratch`, and secrets that never go in; a quiz on which files of a Vite project are committed | `project-tree` |
| undo-safely | read | `git restore` for a file, `git restore --staged`, `git revert` for a commit, and why `reset --hard` is the one to be careful with | `three-trees` |
| a-branch-is-a-pointer | read | `git branch`, `git switch`, commits on a branch moving the pointer, `HEAD`, and two branches that diverge | `branch-and-merge` |
| merge-a-branch | read | A fast-forward merge and a merge commit, when each happens, and what `git log --graph` draws | `branch-and-merge` |
| do-it-on-your-computer | local | Download a project, `git init`, commit it, make a branch, commit on it, merge it, and read the log; the step scripts every command and its output | `terminal` |

### `git-collaboration`

Area `tooling`, prerequisite `git-basics`, about sixty minutes.

| Step | Mode | Shows | Explainer |
| --- | --- | --- | --- |
| what-a-conflict-is | read | Two branches that change the same lines, why Git cannot choose, and the markers it writes instead | `merge-conflict` |
| resolve-a-conflict | edit | A workspace whose `src/App.jsx` holds conflict markers from two branches that each added a feature; the student keeps both, the page runs, and the check confirms no marker remains and both features render | `merge-conflict` |
| a-remote-on-github | read | A repository on GitHub, `clone`, `origin`, `push`, `fetch`, and `pull`; ahead and behind; what `git status` says about the remote | `remote-sync` |
| a-pull-request | read | A branch pushed, a pull request opened, the diff, the conversation, the checks, and the merge; this site's own pull requests as the example | `pull-request-flow` |
| code-review | read | What a reviewer looks for, how to ask for and answer a comment, small pull requests, and the squash, merge, and rebase choices in one paragraph each | `pull-request-flow` |
| the-daily-loop | read | Pull before you start, branch per task, commit as you go, push, open the pull request, address review, merge, delete the branch, pull again; the conventions a team agrees on | `remote-sync`, `pull-request-flow` |
| when-things-go-wrong | read | A push rejected because the remote moved, a pull that conflicts, a commit on the wrong branch, and a secret that was committed; the fix for each | `remote-sync` |
| ship-it-together | local | Create a repository on GitHub, push the project from `git-basics`, open a pull request from a branch, merge it on GitHub, pull the merge; then, with a partner or a second clone, make a conflict and resolve it for real | `terminal` |

The two local steps download the same small vanilla project from `local/`, a page with a stylesheet and a script, so that no `npm install` stands between the student and the first commit.
The topic's links point at the Git book's first chapters and GitHub's own documentation for the pull request pages, as the `links` field allows.

### `deploy-with-github-pages`

Area `tooling`, prerequisite `git-collaboration`, about forty-five minutes.
It uses this site's own `deploy.yml` and GitHub Pages address as the worked example and ends with the student's own project on the web.

| Step | Mode | Shows | Explainer |
| --- | --- | --- | --- |
| what-a-static-host-serves | read | A folder of plain files served at an address; `dist/` from `tooling-from-scratch` as that folder; what a host does and does not do; why there is no server to write | `static-deploy` |
| a-plain-page-from-a-branch | local | Push the vanilla project from `git-basics`, set the Pages source to the `main` branch in the repository settings, and open `https://<user>.github.io/<repo>/`; the first deployment with no build step | `terminal` |
| the-address-and-the-base | read | Why a project at `/<repo>/` breaks when its assets start with `/`; `base: "./"` in `vite.config.js`; why a `BrowserRouter` route returns 404 on a refresh at Pages and the two fixes, `HashRouter` or a `404.html` copy of `index.html`; a quiz on which project needs which | `static-deploy` |
| a-workflow-on-every-push | read | The ready `deploy.yml` read line by line: the trigger, the permissions, checkout, Node, `npm ci`, `npm run build`, the Pages artifact, and the deploy job; the Pages source set to GitHub Actions; what the Actions tab shows | `ci-pipeline` |
| deploy-a-vite-project | local | Download any React step's project, which carries the workflow and the relative base, push it, set the Pages source to GitHub Actions, watch the run, and open the address | `terminal` |
| update-and-roll-back | local | Change the heading, commit, push, and watch the site change; a build that fails and what the log says; `git revert` and a push that rolls the site back | `ci-pipeline` |

The workflow the topic ships, and that every downloaded Vite project carries at `.github/workflows/deploy.yml`, is this site's own workflow cut to what a project without tests needs:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

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

What a student changes in a project before it deploys, which the topic's checklist step and the downloaded README both list:

1. `base: "./"` in `vite.config.js`, so that the built page finds its assets at any address; a downloaded project already has it.
2. The Pages source in the repository's Settings, "GitHub Actions" for a Vite project and "Deploy from a branch" for a plain page.
3. `HashRouter` in place of `BrowserRouter`, or a `404.html` that copies `index.html`, in a project that uses React Router; the downloaded README of a routing step says so.
4. `.gitignore` with `node_modules` and `dist`, which every downloaded project already has, so that the built files are never committed.
5. Nothing secret in the project, since every file of a public repository and every built file is public; the `.env` a fetching step writes holds only a public API address.

The download changes are a contract change to section 5.2: `vite.config.js` gains `base: "./"`, the zip gains `.github/workflows/deploy.yml`, and the README gains a "Deploy to GitHub Pages" section with the checklist above; a vanilla download's README gains the "Deploy from a branch" sentence.
The files stream owns that change, because the download is built by the same `projectLayout` the file tree uses, and the "On your computer" group then lists `.github/workflows/deploy.yml` too.

### The Git explainers

| Id | Shows |
| --- | --- |
| `three-trees` | The working tree, the staging area, and the repository as three columns; a file edited, added, and committed moves across them, with the `git status` output for each state; Reset puts it back |
| `commit-graph` | Commits as a chain from the fence body, each with a short hash, a message, and a parent arrow; selecting one shows the snapshot it holds and the diff from its parent |
| `branch-and-merge` | A `main` and a feature branch from the fence body; Step commits on either, `HEAD` follows the switch, and the merge draws a fast-forward or a merge commit depending on whether `main` moved |
| `merge-conflict` | Two branches that change the same line, the merge that stops, the file with `<<<<<<<`, `=======`, and `>>>>>>>` markers, and the resolved file after a choice the student makes |
| `remote-sync` | A local and a remote graph side by side; `push`, `fetch`, and `pull` move commits between them, with ahead and behind counts and a rejected push when the remote has moved |
| `pull-request-flow` | A branch pushed, a pull request opened, review comments, the checks running, the merge, and the branch deleted, one stage at a time |
| `static-deploy` | `dist/` copied to a host, the address each file gets under `/<repo>/`, a request for a route refreshed, and what the host answers with and without a `404.html` |
| `ci-pipeline` | Push, install, build, and deploy as stages with the log of each, a failing build that stops the rest, and the site unchanged until a run is green |

`static-deploy` and `ci-pipeline` are the two the production phase planned for `deploying-and-ci`; they are built now and that topic reuses them.

Each explainer takes its commits and branches from the fence body where that makes sense, so a step shows its own history rather than a canned one, and each follows the Phase 6 contract: no autoplay, Play, Pause, Step, and Reset from the keyboard, the final state under reduced motion, a text description, tokens only.

### Changes to the curriculum

- `git-basics` and `git-collaboration` are added to Part 4 of [CURRICULUM.md](CURRICULUM.md) as Phase 7.
- `code-quality` loses its `version-control-in-one-page` step and gains `git-basics` as a prerequisite.
- `how-teams-ship` keeps `repositories-branches-and-pull-requests` as a short step that assumes `git-collaboration` and adds what a team layers on top: protected branches, required reviews, and release branches.
- `deploy-with-github-pages` is added to Part 4 as Phase 7; `deploying-and-ci` in Part 5 drops `github-pages-netlify-and-vercel` and `a-pipeline-on-every-push`, assumes the new topic, and keeps `static-hosting` as a comparison of hosts, `preview-deploys`, and `the-lab-s-own-workflow`, retitled for the rename.
- `using-the-lab` is renamed `getting-started` everywhere it appears, and gains `the-files-of-a-step` after `your-first-edit`; its `page-tour` entry for the editor names the tree.
- "Part 6: the lab itself" becomes "Part 6: the site itself", and every "lab" in the two inventories that names the site follows the rename.
- [EXPLAINERS.md](EXPLAINERS.md) gains `project-tree` under "The site itself" and a "Git and deployment" section with the six Git explainers, all Phase 7, and `static-deploy` and `ci-pipeline` moved into it from Production with their phase set to 7.

## Milestones, in order

1. **Sign-off.** The instructor reads this plan, confirms the repository name, and reads the new rows in [EXPLAINERS.md](EXPLAINERS.md) and [CURRICULUM.md](CURRICULUM.md); no code starts until they stand.
2. **The rename.** The instructor renames the repository on GitHub; then the three commits of "CS300 Practice" above, the `active` flag on Spring, the `opens` dates on Weeks 11 to 13, the D2L export changes, and a deploy by hand that is confirmed at the new address; [FALL-2026.md](FALL-2026.md) sections A, B, C, and E checked off.
3. **Contracts.** Section 8 of [CONTRACTS.md](CONTRACTS.md): the `files` front-matter field and `fileNotes` in the compiled step, the `projectLayout` entry shape, the Files preference in progress, the `project-tree` fence body, the fence bodies of the Git and deployment explainers, and the section 5.2 changes to the download; the nine new ids seeded in `src/demos/registry.json`.
4. **The Git explainers.** The six Git explainers in the order the content needs them, `three-trees`, `commit-graph`, `branch-and-merge`, `merge-conflict`, `remote-sync`, `pull-request-flow`, then `static-deploy` and `ci-pipeline`, each in `tests/demos.spec.js` through the registry.
5. **`git-basics`.** The eight steps, the local project, the topic's links, and its tests in `tests/steps.spec.js`.
6. **`git-collaboration`.** The eight steps, the conflict workspace with its solution and check, the local project, and its tests.
7. **`deploy-with-github-pages`.** The six steps, the workflow file in the local project, the topic's links, and its tests.
8. **The Git and GitHub unit.** The three topics in `fall-2026.json`, the curriculum and explainer tables marked `in use`, and a deploy; this is the first thing students see from Phase 7.
9. **The file tree and the deployable download.** `projectLayout`, `FileTree.jsx`, the dictionary, the preference, the zip builder on the shared layout with the workflow, the base, and the README section, the tour and page-tour text, `tests/files.spec.js`, and the README section.
10. **The `project-tree` explainer and the `files` field.** The explainer, its validator rule, the `files` field through the build and the validator, and the `the-files-of-a-step` step in `getting-started`.
11. **Content touch-ups.** The `project-tree` fence in `vite-project-anatomy`, `tooling-from-scratch`, `modules-and-imports`, and `app-architecture`, with explanations only, workspaces, solutions, and checks unchanged.
12. **Docs.** The README's content sections and the D2L pages re-exported with the new unit.

Milestone 2 is done by one worker alone, but the Git streams do not wait for it: they write with the new name from the first line, in folders the rename never touches, and only their path entries in milestone 8 wait for the rename to merge.
Milestones 4 to 8 come before the file tree because the Git unit has no date and goes live the day it merges, and `deploy-a-vite-project` needs only the workflow in its own `local/` folder until the download carries it too.

## Definition of done for Phase 7

- The site is served at the new address, reads CS300 Practice everywhere a student looks, and `grep -ri "lab" content/ src/ scripts/export-d2l.mjs` finds only the internal identifiers this plan keeps.
- The deployed home page shows Fall 2026 alone, with Foundations and Week 10 open and Weeks 11 to 13 closed until their Mondays, and a `--all` build still carries Spring.
- Every edit step shows its files as a tree with folders, a description for the selected file, and the "On your computer" group, from the keyboard and at phone width, and the group lists exactly the files the download writes.
- `FileTabs.jsx` is gone, and every test that drove the tabs drives the tree.
- A student who finishes `git-basics` has a repository on their own computer with a merged branch in its log, one who finishes `git-collaboration` has a merged pull request on GitHub and has resolved a real conflict, and one who finishes `deploy-with-github-pages` has a Vite project on the web at their own GitHub Pages address that redeploys on every push.
- Any React step's downloaded project deploys to GitHub Pages with no edit beyond setting the Pages source, and the "On your computer" group lists the workflow.
- Every Phase 7 explainer in [EXPLAINERS.md](EXPLAINERS.md) is `in use` and passes axe with motion allowed and reduced.
- Every new step validates, its solution passes its checks in the Playwright suite, and the full suite is green on `main`.
- The README documents the tree, the `files` field, and the `project-tree` fence, and [FALL-2026.md](FALL-2026.md) sections A to C and E are checked off, with section F's verification walk recorded.

## Work streams

Phase 7 uses the shape of Phase 6, with one difference: the rename stream runs first and alone, and the three others branch from `main` only after it has merged.

| Stream | Milestones | Owns | Must not touch |
| --- | --- | --- | --- |
| rename | 2 | everything the three rename commits touch, `content/paths/`, `scripts/export-d2l.mjs`, [FALL-2026.md](FALL-2026.md) | nothing is excluded, which is why it runs alone |
| files | 9, 10 | `src/editor/`, `src/ui/workspaceProject.js`, `src/ui/Tour.jsx`, `src/demos/page-tour/`, `src/demos/project-tree/`, `src/progress/`, `src/styles/workspace.css`, the `files` field in `scripts/lib/content.mjs` and `scripts/validate-content.mjs`, `tests/files.spec.js`, `tests/a11y.spec.js`, `content/topics/getting-started/` | the other topic folders, `src/runner/`, `src/inspector/`, the other explainers |
| git-explainers | 4 | the eight explainer folders under `src/demos/`, `tests/demos.spec.js` | `content/`, `src/editor/`, `src/ui/`, `scripts/` |
| git-content | 5, 6, 7, 8, 11, 12 | `content/topics/git-basics/`, `content/topics/git-collaboration/`, `content/topics/deploy-with-github-pages/`, the four touched topic folders in milestone 11, the `git-and-github` unit in `content/paths/fall-2026.json` once the rename has merged, `tests/steps.spec.js`, `tests/lib/steps.js`, [CURRICULUM.md](CURRICULUM.md), [EXPLAINERS.md](EXPLAINERS.md) statuses | `getting-started`, `spring-2027.json`, everything under `src/` and `scripts/` |

The rename, git-explainers, and git-content streams start together; the files stream starts when the rename has merged, since it rewrites `src/ui/` and `getting-started`.
Each worker runs its Playwright suite on its own port, pushes its branch after every commit, and the orchestrator merges in milestone order and runs lint, format, validate, build, the script tests, and the Playwright suite on `main` after each merge.

## Decisions already made

1. The site is CS300 Practice, a week's topics are its Guided Practice, and "lab" is not used for the site anywhere a student reads; the repository name `cs300-practice` is the instructor's to confirm at sign-off.
2. Internal identifiers keep `lab`, so that saved progress survives the rename.
3. Fall 2026 is the only deployed path this term; Spring 2027 is planned later and is not touched beyond the `active` flag and the content-wide rename.
4. The earlier material is a Foundations unit in Fall 2026, open from the first day and optional, rather than spread across the React weeks.
5. The tree replaces the tabs rather than sitting beside them; two ways to pick a file would be one too many.
6. The "On your computer" group is computed from the download, never written by hand, so it cannot drift from the zip.
7. Descriptions come from a dictionary with a per-step override, not from a field every step must carry, so no existing step changes to get them.
8. Git runs only on the student's computer; the site models Git with explainers and runs the one Git task that is an edit, resolving a conflict.
9. Git is two topics, one for a single computer and one for a team, and deployment is a third, so that each is one sitting.
10. The Git and deployment topics use this repository's own history, pull requests, workflow, and Pages address as their worked example.
11. The Git and GitHub unit has no date and is optional, like Foundations, because the class has already covered Git; it goes live the day its topics merge.
12. Deployment targets GitHub Pages only, with the workflow as the way for a Vite project and the branch source as the way for a plain page; other hosts stay in the production phase.
13. Downloaded Vite projects carry the workflow and `base: "./"`, so deploying a step's project needs no edit.
14. The planned Phase 7 and Phase 8 topics move to Phase 8 and Phase 9; `static-deploy` and `ci-pipeline` move the other way, into Phase 7.

## When to ask

Ask only when blocked on something the design, the contracts, and this plan do not settle and a reasonable default would make the work useless if wrong.
Otherwise choose, state the choice in the milestone report, and continue.
