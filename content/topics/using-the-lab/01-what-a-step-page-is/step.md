---
title: What a step page is
mode: read
---

Every lesson in this lab is a topic, and every topic is a short row of steps that you take in order.
This step is a map of the step page: what each pane is for and when to look at it.
Select each pane in the picture below and read what it does, then read the table under it.

```demo name="page-tour"
```

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

## How a step reads

Every step opens with a few sentences that say what it builds and what to watch for, and then, before any code, one of two things.
An **explainer** is a small moving picture, like the one above, with **Play**, **Step**, and **Reset** buttons; step through it once before you type.
A **predict** question asks what the console or the page will show before you run the code.
Pick an answer, then run: on an edit step the lab reveals the right answer after your next run, so the console, not the page, tells you whether you were right.

Then come the edits, one small card at a time, each naming the file and saying exactly where the code goes.
You type each edit rather than pasting it, because typing is how the shape of the code gets into your hands, and a typo you fix yourself teaches more than one you never made.

The longer explanation sits under a **Read more** control, closed until you open it.
Open it when you want the background or when something broke; if you prefer to read everything first, tick **Keep explanations open** under the step title, and every Read more on every step opens for you.

Every step then ends the same way.
A **Check:** paragraph says what a correct result looks like, and the checks pane confirms it.
A **quiz** question or two follows, whose answer and explanation appear as soon as you pick; the topic page keeps your score.
A collapsed panel at the very end of an edit step holds the whole file as it should be after the step, for when you want to compare.

Try the predict question here: on a read step there is nothing to run, so it reveals its answer as soon as you pick.

```predict
On an edit step, which pane do you read first after pressing Run, when the step says nothing else?
- The editor, to check what you typed
= The result, and then the console
- The checks, to see whether the step is done
```

The explanation usually says what to look at; when it does not, read the page your code drew and then what it printed, because a page that looks right can still have a red line in the console.

## Read more

### The buttons under the editor

**Run** compiles every file in the editor and runs the result from scratch.
**Run checks** runs the checks again without running the code again, which is useful after you click around in the result.
**Show solution** opens your files beside the finished ones so you can compare them, and you load the solution only if you choose to.
**Reset to starter** puts back the files the step started with, after asking first.
**Download this workspace** saves the step's files to your computer, which the last step of this topic explains.

**If it breaks:** If the panes look squeezed, widen the window or turn a tablet sideways; below 900 pixels the panes stack, and you scroll down to reach the console and the checks.
If a step page shows an error instead of the step, reload the page; the lab keeps your work in this browser, so nothing is lost.

**Check:** You can name, without looking back, the pane that shows what your code printed and the pane that says whether the step is done.
They are the console and the checks pane, and you will use both in every edit step of this topic.
Then press **Mark this step as read**.

```quiz
Which pane shows every error your code caused, in red?
- The result
- The checks
= The console
> The result shows only what the page draws, and the checks show only the step's expectations; errors go to the console, at the top.
```
