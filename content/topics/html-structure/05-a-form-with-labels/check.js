export default async function check({ document, wait }) {
  const form = document.querySelector("body form");
  const fields = form ? [...form.querySelectorAll("input, select")] : [];
  const unlabeled = fields.filter((field) => field.labels.length !== 1);
  const nameField = form?.querySelector("#name");
  const nameLabel = nameField?.labels[0] ?? null;

  let focusedFromLabel = false;
  if (nameLabel && nameField) {
    const active = document.activeElement;
    nameLabel.click();
    await wait(50);
    focusedFromLabel = document.activeElement === nameField;
    nameField.blur();
    if (active && active !== document.body) active.focus();
  }

  const email = form?.querySelector('input[type="email"]');
  const select = form?.querySelector("select");
  const options = select ? select.querySelectorAll("option").length : 0;
  const submit = form?.querySelector('button[type="submit"]');

  return [
    {
      id: "labels-connected",
      title: "Every field has one label, and clicking the Name label focuses its field",
      pass: fields.length >= 3 && unlabeled.length === 0 && focusedFromLabel,
      hint:
        unlabeled.length > 0
          ? `${unlabeled.length} field(s) have no connected label. Give each <label> a for attribute equal to its field's id.`
          : fields.length < 3
            ? `The form has ${fields.length} field(s); it should have the name, the email, and the day.`
            : "Clicking the Name label did not focus the name field; check that for and id match exactly."
    },
    {
      id: "email-is-required",
      title: "The email field uses type email and is required",
      pass: Boolean(email) && email.required && email.name === "email",
      hint: email
        ? "The email input needs both name=\"email\" and the required attribute."
        : 'Add <input id="email" name="email" type="email" required /> under its label.'
    },
    {
      id: "select-and-submit",
      title: "A drop-down with three days and a submit button inside the form",
      pass: options === 3 && Boolean(submit),
      hint: submit
        ? `The select has ${options} option(s); it should list Tuesday, Thursday, and Saturday.`
        : 'Add <button type="submit">Join</button> as the last line inside the form.'
    }
  ];
}
