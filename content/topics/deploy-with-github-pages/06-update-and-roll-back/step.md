---
title: Update and roll back
mode: local
---

A deployed project changes the way every project in this course changes: you edit, commit, and push, and the workflow publishes the result.
This step pushes a change and watches the site follow, pushes a build that fails and reads what the log says, and then uses `git revert` and a push to put the site back to an earlier version.
Step through the picture to the failing build, and notice that the deploy stage never runs, so the live site does not change.

```demo name="ci-pipeline"
{ "stages": ["install", "build", "deploy"], "failAt": 1 }
```

This step happens in a terminal and on GitHub, not in this site, in the `study-plan-react` repository from [Deploy a Vite project](#/topic/deploy-with-github-pages/5).
If you do not have it, this step's download is the same project; deploy it as that step does first.

```demo name="terminal"
{
  "cwd": "study-plan-react",
  "commands": [
    {
      "command": "git commit -am \"Rename the heading to My study plan\"",
      "output": [
        "[main 6456f97] Rename the heading to My study plan",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "Before this, change <h1>Study plan</h1> to <h1>My study plan</h1> in src/App.jsx and save."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan-react.git", "   6a5667c..6456f97  main -> main"],
      "note": "A new run starts in the Actions tab. When it is green, reload the site: the heading says My study plan."
    },
    {
      "command": "git commit -am \"Close the main element\"",
      "output": ["[main ae618e6] Close the main element", " 1 file changed, 1 insertion(+), 1 deletion(-)"],
      "note": "Before this, break the build on purpose: change </main> to </mian> in src/App.jsx and save. Git commits it, because Git does not check your code."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan-react.git", "   6456f97..ae618e6  main -> main"],
      "note": "This run fails at npm run build, and its deploy job is skipped. The site still shows My study plan."
    },
    {
      "command": "git log --oneline -3",
      "output": [
        "ae618e6 (HEAD -> main, origin/main) Close the main element",
        "6456f97 Rename the heading to My study plan",
        "6a5667c Add the study plan React project"
      ],
      "note": "The broken commit is the newest on main, on GitHub too. Undo it with a new commit."
    },
    {
      "command": "git revert --no-edit HEAD",
      "output": [
        "[main b216dfc] Revert \"Close the main element\"",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "A new commit that puts </main> back. Nothing in the history is rewritten."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan-react.git", "   ae618e6..b216dfc  main -> main"],
      "note": "This run is green again. The site did not change, because the broken commit never deployed."
    },
    {
      "command": "git revert --no-edit 6456f97",
      "output": [
        "[main 1f68b8b] Revert \"Rename the heading to My study plan\"",
        " 1 file changed, 1 insertion(+), 1 deletion(-)"
      ],
      "note": "Now roll the site back a version: a new commit that undoes the heading change, found by its hash in the log."
    },
    {
      "command": "git push",
      "output": ["To https://github.com/you/study-plan-react.git", "   b216dfc..1f68b8b  main -> main"],
      "note": "When this run is green, the site says Study plan again: rolled back by a commit, with the whole story in the log."
    }
  ]
}
```

## Push a change

Change the heading in `src/App.jsx` to `My study plan`, save, and run the first two commands.
Open the **Actions** tab: a run named after your commit message starts, and when both jobs are green, a reload of your address shows the new heading.
That is the whole loop from now on, for every change.

## A build that fails

Break the build on purpose, as the third command's note says, commit, and push.
The run turns red at the **build** job, and the **deploy** job is marked skipped.
Open the run, then the **build** job, then the red **Run npm run build** step; the end of its log reads:

```text
✗ Build failed in 224ms
error during build:
Build failed with 1 error:

[builtin:vite-transform] Expected corresponding JSX closing tag for 'main'.
    ╭─[ src/App.jsx:18:7 ]
    │
  9 │     <main>
    │      ──┬─
    │        ╰─── Opened here
    │
 18 │     </mian>
    │       ──┬─
    │         ╰─── Expected `</main>`
────╯

Error: Process completed with exit code 1.
```

It names the file and the line, `src/App.jsx:18`, and what it expected, exactly as `npm run build` would on your computer.
Reload your address: it still shows `My study plan`, because a failed build never reaches the deploy job.
GitHub also emails you about the failed run, so a broken push does not go unnoticed.

## Roll back with revert

There are two ways to make `main` green again: fix the typo in a new commit, or revert the commit that broke it.
Revert is the one to know, because it works the same for any commit, including one that built fine but put something wrong on the site.
Run `git log --oneline -3`, `git revert --no-edit HEAD`, and `git push`, and the run is green again.

Then roll the site back one real version: `git revert --no-edit 6456f97`, with the hash of your heading commit from your own log, and `git push`.
When the run is green, the site shows `Study plan` again.
Every step is a commit, so `git log` tells the whole story: a change, a breakage, its revert, and the rollback.

## Read more

### Why not reset and force-push

`git reset --hard 6a5667c` and `git push --force` would also put the old version back, by deleting the later commits from `main` on GitHub.
That rewrites history that others may already have, removes the record of what happened, and is exactly what [Undo safely](#/topic/git-basics/5) warns about; `revert` gets the same site with none of those costs.

### Checking before you push

`npm run build` on your computer before `git push` catches a broken build in seconds, before GitHub does.
On a team, the `check.yml` kind of workflow from [A pull request](#/topic/git-collaboration/4) runs the build on every pull request, so a broken change is caught before it reaches `main` at all.

**If it breaks:** If `git revert` stops with a conflict, a later commit changed the same lines; resolve it as in [Resolve a conflict](#/topic/git-collaboration/2), then `git add` and `git revert --continue`.
If a run stays yellow for more than a few minutes, open it to see which step is waiting; a run queued behind another waits for it, because the workflow allows one deployment at a time.
If the site does not change after a green run, force a reload with **Ctrl+Shift+R** or **Cmd+Shift+R**.

**Check:** The **Actions** tab shows a green run, a red run whose build log names `src/App.jsx:18`, and green runs after it, your site shows `Study plan` again, and `git log --oneline` shows both reverts.
Then press **I did this on my computer**.

```quiz
A push's build fails. What does the live site show?
- An error page with the build log
- Nothing; the site goes offline until a green run
= The version from the last green run
> The deploy job runs only after a successful build, so the site keeps its last good version.
```

```quiz
A change that built fine put a wrong price on the live site. How do you roll it back?
= `git revert` that commit, then `git push`
- Delete the repository's Pages setting
- `git reset --hard` and `git push --force`
> The revert is a new commit, so the workflow deploys the old version again with the history intact.
```
