---
title: What a step page is
mode: read
---

Every lesson in this lab is a topic, and every topic is a short row of steps that you take in order.
This page is a step, and it is the plain kind: you read it and mark it as read.
Most steps are the other kind, where you edit code on the right, run it, and see what it does, and the next step is one of those.
Spend two minutes here learning what each part of an edit step is for, so that the rest of the semester you know where to look.

## Three kinds of step

An **edit** step has the explanation and, beside it, an editor with the code, the page that code draws, and the console that shows what it printed.
A **read** step, like this one, has the explanation only, and a **Mark this step as read** button at the end.
A **local** step happens on your own computer: it explains what to type in your terminal and offers a download of the project to run there, and it ends with **I did this on my computer**.

The line above each step's title says where you are, such as **Step 1 of 6**.
At the bottom of every step page, the step navigation links to the previous and the next step and lists every step in the topic, each marked once you complete it.

## The panes of an edit step

On a wide screen the explanation sits on the left and the work panes run down the right, in the order this table gives them; on a phone or a narrow window everything stacks in that same order.

| Pane | What it is for | When to look at it |
| --- | --- | --- |
| Explanation | What the step builds, the edits to type, and what you should see | First, and again after every run |
| Editor | The step's files, one tab per file, with **Run** and the other buttons under it | Whenever an edit block names a file |
| Result | The page your code draws, live: you can click and type in it | After every run |
| Console | Everything your code printed with `console.log`, and every error in red | After every run, even when the page looks right |
| Inspector | A picture of the page's parts: React components, their state, what re-rendered, or the elements of a plain page | When a step asks you to watch something change |
| Network | Every request the page made and its answer, on steps that fetch data | On fetching steps only |
| Checks | The expectations for the step, each passing or failing with a hint | After every run, and when you think you are done |

The status pill at the top of the result pane says where a run is: **Not run yet**, **Compiling**, **Running**, **Ready**, or **Did not compile**.
Wait for **Ready** before you read the console or the checks.

## The buttons under the editor

**Run** compiles every file in the editor and runs the result from scratch.
**Run checks** runs the checks again without running the code again, which is useful after you click around in the result.
**Show solution** opens your files beside the finished ones so you can compare them, and you load the solution only if you choose to.
**Reset to starter** puts back the files the step started with, after asking first.
**Download this workspace** saves the step's files to your computer, which the last step of this topic explains.

## How an edit step reads

The explanation gives you small edits, one at a time, each in a card that names the file and says exactly where the code goes.
You type each edit into the editor rather than pasting it, because typing is how the shape of the code gets into your hands, and because a typo you fix yourself teaches more than one you never made.
After each edit you run the code and compare what you see with what the explanation says you should see.

Every step ends the same way.
A **Check:** paragraph says what a correct result looks like, and the checks pane confirms it.
An **If it breaks:** paragraph names the mistakes students in our class make most often and where to look for each.
A collapsed panel at the very end holds the whole file as it should be after the step, for when you want to compare.

Predict before you continue: on an edit step, which pane do you read first after pressing **Run**, the editor, the result, or the console?
The explanation tells you, every time; when it says nothing, read the result and then the console.

**Check:** You can name, without looking back, the pane that shows what your code printed and the pane that says whether the step is done.
They are the console and the checks pane, and you will use both in every edit step of this topic.

**If it breaks:** If the panes look squeezed, widen the window or turn a tablet sideways; below 900 pixels the panes stack, and you scroll down to reach the console and the checks.
If a step page shows an error instead of the step, reload the page; the lab keeps your work in this browser, so nothing is lost.
