---
title: A form with labels
mode: edit
entry: index.html
required: [labels-connected, email-is-required, select-and-submit]
---

Forms are how a page collects something from the reader: a search, a login, a sign-up.
The page now has a **Join the group** section with an empty `<form>`, and this step fills it with three fields and a button.
The lesson's one rule for forms comes first: every field has a label, and the label is **connected** to its field.

Add the first field inside the form.

```html file="index.html" action="insert-after" anchor="        <form>"
          <label>Name</label>
          <input id="name" name="name" type="text" />
```

Run the page and click the word **Name**.
Nothing happens: the text field does not get focus, and a screen reader arriving at the field would announce "edit text" with no name.
The label is next to the field, but the browser has no idea they belong together.
Connect them: the label's `for` attribute names the `id` of its field.

```html file="index.html" action="replace" anchor="          <label>Name</label>"
          <label for="name">Name</label>
```

Click the word **Name** again.
The cursor lands in the field, because the label now belongs to it, and the same connection is what a screen reader reads out.
The `id` is for the label; the `name` attribute is different: it is the name the field's value travels under when the form is sent, and it is the one JavaScript and servers look for.

Add an email field.

```html file="index.html" action="insert-after" anchor='          <input id="name" name="name" type="text" />'
          <label for="email">NEIU email</label>
          <input id="email" name="email" type="email" required />
```

`type="email"` makes the browser check the value looks like an address and gives a phone the keyboard with the `@` key.
`required` is a **boolean attribute**: its presence is the whole value, so it has no `="..."` part.
Press **Join** with the email empty, and the browser refuses to send the form and points at the field, with no JavaScript at all.

Finish with a choice and a button.

```html file="index.html" action="insert-after" anchor='          <input id="email" name="email" type="email" required />'
          <label for="day">Preferred day</label>
          <select id="day" name="day">
            <option value="tuesday">Tuesday</option>
            <option value="thursday">Thursday</option>
            <option value="saturday">Saturday</option>
          </select>
          <button type="submit">Join</button>
```

`<select>` is a drop-down, and each `<option>` is one choice; the `value` is what gets sent, and the text is what the reader sees.
Radio buttons would do for three choices too; a drop-down earns its place at five or more.
`<button type="submit">` sends the form.
This page has no server to send it to, so pressing it with the fields filled in reloads the result; the DOM topic in Week 6 shows how JavaScript takes over that moment.

**Check:** Run the page.
Clicking each label focuses its field, the email field refuses to submit while empty, and the drop-down lists three days.
Press **Run checks** to confirm.

**If it breaks:** If clicking a label does nothing, its `for` value and the field's `id` differ, even by one letter.
If two fields focus from one label, two elements share an `id`; an `id` is unique on the page.
If the check cannot find the submit button, it is outside the `</form>` line.

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
        <a href="#meetings">Meeting times</a>
        <a href="#join">Join</a>
      </nav>
    </header>
    <main>
      <section id="about">
        <h2>About the group</h2>
        <p>We meet twice a week to work through the CS300 labs together, and <strong>everyone</strong> is welcome.</p>
        <p>Bring your questions and the <a href="https://developer.mozilla.org/en-US/docs/Learn_web_development">MDN learning pages</a>.</p>
      </section>
      <section id="meetings">
        <h2>When we meet</h2>
        <ul>
          <li>Tuesday, 4 pm, in the library</li>
          <li>Thursday, 4 pm, online</li>
          <li>Saturday, 10 am, in the lab</li>
        </ul>
      </section>
      <section id="join">
        <h2>Join the group</h2>
        <form>
          <label for="name">Name</label>
          <input id="name" name="name" type="text" />
          <label for="email">NEIU email</label>
          <input id="email" name="email" type="email" required />
          <label for="day">Preferred day</label>
          <select id="day" name="day">
            <option value="tuesday">Tuesday</option>
            <option value="thursday">Thursday</option>
            <option value="saturday">Saturday</option>
          </select>
          <button type="submit">Join</button>
        </form>
      </section>
    </main>
    <footer>
      <p>Run by students, for students.</p>
    </footer>
  </body>
</html>
```

</details>
