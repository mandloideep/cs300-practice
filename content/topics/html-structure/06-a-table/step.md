---
title: A table for data
mode: edit
entry: index.html
inspector:
  views: [dom]
required: [header-row, body-rows, cells-match-columns]
---

The meeting list from Step 2 held three facts per meeting in one sentence each.
Data with rows and columns, a schedule, a grade sheet, a comparison, belongs in a `<table>`, where each fact has its own cell and the browser lines the columns up.
The page has a new **This week's schedule** section, and this step builds the table inside it.
One warning from the lesson before we start: tables are for data, never for arranging a page; the CSS topic has layout tools for that.

Begin with the table and its header row.

```html file="index.html" action="insert-after" anchor="        <h2>This week's schedule</h2>"
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Topic</th>
            </tr>
          </thead>
        </table>
```

Run the page.
Three bold headings sit in a row, each in its own cell.
`<table>` holds everything, `<thead>` holds the rows that name the columns, `<tr>` is one row, and `<th>` is a header cell.
Open the DOM view and expand `table`: the tree is `table`, then `thead`, then `tr`, then three `th`, exactly the nesting in the file.

Now the first row of data, in a body section after the head.

```html file="index.html" action="insert-after" anchor="          </thead>"
          <tbody>
            <tr>
              <td>Tuesday</td>
              <td>4 pm</td>
              <td>HTML structure</td>
            </tr>
          </tbody>
```

`<tbody>` holds the data rows, and `<td>` is a data cell.
A row is a `<tr>` in both sections; what changes is the cell: `<th>` for a heading, `<td>` for a value.
Keeping the head and the body apart lets a screen reader say "Day: Tuesday" for each cell, lets CSS color the heading row on its own, and lets a printer repeat the heading on every page.

Add two more rows after the first one.

```html file="index.html" action="insert-after" anchor="              <td>HTML structure</td>\n            </tr>"
            <tr>
              <td>Thursday</td>
              <td>4 pm</td>
              <td>CSS layout</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>10 am</td>
              <td>JavaScript basics</td>
            </tr>
```

Every row has the same number of cells as there are headings.
Try deleting one `<td>` and running: the browser still draws the table, with a hole where the cell was, and the check tells you which row is short.
The browser never reports an HTML mistake; it does its best with what it is given, which is why we read the DOM view and the checks.

**Check:** Run the page.
The schedule has a shaded heading row with Day, Time, and Topic, and three rows of meetings under it, with borders around every cell.
Press **Run checks** to confirm the head, the body, and that every row has three cells.

**If it breaks:** If the headings appear as a column instead of a row, each `<th>` is inside its own `<tr>`; one row holds all three.
If a row's text runs together without cell borders, its cells are missing `<td>` tags.
If the table looks fine but a check fails, a `</tr>` or `</tbody>` is in the wrong place; compare the nesting with the panel below.

<details>
<summary>index.html after this step</summary>

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CS300 Study Group</title>
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <header>
      <h1>CS300 Study Group</h1>
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 6 4'%3E%3Crect width='6' height='4' rx='0.4' fill='%23dbe7f3'/%3E%3Ccircle cx='3' cy='2' r='1.2' fill='%23003da5'/%3E%3C/svg%3E" alt="The study group logo: a blue circle on a light blue square" width="120" height="80" />
      <nav>
        <a href="#about">About</a>
        <a href="#schedule">Schedule</a>
      </nav>
    </header>
    <main>
      <section id="about">
        <h2>About the group</h2>
        <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
        <p>Bring your questions and the <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">MDN learning pages</a>.</p>
      </section>
      <section id="schedule">
        <h2>This week's schedule</h2>
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Topic</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Tuesday</td>
              <td>4 pm</td>
              <td>HTML structure</td>
            </tr>
            <tr>
              <td>Thursday</td>
              <td>4 pm</td>
              <td>CSS layout</td>
            </tr>
            <tr>
              <td>Saturday</td>
              <td>10 am</td>
              <td>JavaScript basics</td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
    <footer>
      <p>Run by students, for students.</p>
    </footer>
  </body>
</html>
```

</details>
