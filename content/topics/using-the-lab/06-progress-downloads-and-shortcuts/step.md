---
title: Progress, downloads, and shortcuts
mode: read
---

This last step says where the lab keeps your work, how to take a step home to your own computer, and the few keys that save time.
Read it once now and come back to it when you first change computers or browsers.
Nothing here needs the editor.

## Where your progress lives

The lab has no accounts and no server, so your progress is kept in this browser and nowhere else.
An edit step counts as complete the moment every required check passes, a read step when you press **Mark this step as read**, and a local step when you press **I did this on my computer**.
The step list at the bottom of each step page marks the steps you completed, and each topic page shows a progress bar.

Your edits are kept too: every file you change is saved in this browser as you type, step by step, so you can close the tab and come back to exactly where you were.
**Reset to starter** on a step deletes that step's saved edits and nothing else.

Three things lose browser data, so know them before they happen:

- A private or incognito window forgets everything when you close it.
- Clearing your browser's site data for this site deletes your progress with it.
- A different browser or a different computer starts empty, because the data never left the first one.

## Moving your progress

The home page has a **Your progress** section with two buttons.
**Export progress** saves one small JSON file with your completed steps and your edited files.
**Import progress** reads such a file in another browser and, after you confirm in a dialog that says how many steps the file holds, replaces what that browser had.
Export before you switch from a lab computer to your laptop, and keep the file somewhere you can reach from both, such as your email or a cloud drive.

## Taking a step home

Every edit step has **Download this workspace** under the editor.
It saves a ZIP file named after the topic and the step, such as `using-the-lab-5.zip`, with your current files in it, edited or not.
A React step downloads as a complete Vite project: unzip it, open the folder in Visual Studio Code, and run `npm install` and then `npm run dev` in its terminal, as the Vite topic shows you in Week 10.
A plain HTML, CSS, and JavaScript step downloads as a folder you open by double-clicking `index.html` or with Live Server.
A local step has its own download, the project the step tells you to run, and it is the only way to get those files.

## Running and keys

| Key or button | What it does |
| --- | --- |
| `Ctrl+Enter`, or `Cmd+Enter` on a Mac | Runs the code while the cursor is in the editor |
| `Tab` in the editor | Indents the line, as in any code editor |
| `Esc`, then `Tab` | Leaves the editor so that `Tab` moves on to the buttons below it |
| **Run** | Runs from scratch, with the console and the page's saved data cleared |
| **Run, keeping saved data** | Appears only on steps whose code saves data in the browser, and runs without clearing it, the way a page reload keeps it |

Every page of the lab has its own address, so a link to a step opens that step.
The links your instructor posts in D2L open a week's unit, which lists the topics for that week in order.

Predict before you leave: if you finish three steps on a lab computer and open the lab on your laptop that evening, how many of those steps will the laptop show as complete?
None, unless you exported your progress on the lab computer and imported it on the laptop.

## What comes next

You have now used every part of the step page that the first weeks need.
Go back to your week's unit from the home page and start its first topic.

**Check:** You can say, in one sentence each, where your progress is kept, how to move it to another browser, and what to run in a downloaded React workspace.
Then press **Mark this step as read**, and this topic is complete.

**If it breaks:** If the home page shows no progress after you completed steps, check that you are in the same browser and not in a private window.
If an imported file is refused, it was exported by a newer version of the lab or is not a progress file; export it again from the browser that has your work.
If `npm install` fails in a downloaded project, Node is missing; the Vite topic shows how to install it.
