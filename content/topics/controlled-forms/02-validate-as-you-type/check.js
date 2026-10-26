function type(input, text) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export default async function check({ document, inspector, wait }) {
  const form = inspector.components.find((component) => component.name === "AddProductForm");
  const input = document.querySelector('input[name="title"]');
  const button = document.querySelector('.add-form button[type="submit"]');
  const error = () => document.querySelector(".form-error")?.textContent.trim() ?? null;
  const snapshot = async (text) => {
    if (input) type(input, text);
    await wait(50);
    return { error: error(), disabled: Boolean(button?.disabled) };
  };

  const empty = await snapshot("");
  const short = await snapshot("Ki");
  const valid = await snapshot("Kiwi");
  await snapshot("");

  return [
    {
      id: "error-while-typing",
      title: "A too-short title shows the message, a valid one hides it",
      pass: empty.error === null && short.error !== null && valid.error === null,
      hint:
        short.error === null
          ? "After typing Ki there is no form-error paragraph. Render it when the title is not empty and titleTooShort is true."
          : empty.error !== null
            ? "The message shows while the field is still empty. Guard the condition with title !== \"\"."
            : "The message is still there after typing Kiwi. titleTooShort should compare title.trim().length with 3."
    },
    {
      id: "button-disabled-until-valid",
      title: "The button is disabled until the title is long enough",
      pass: empty.disabled && short.disabled && !valid.disabled,
      hint:
        !short.disabled
          ? "The button is enabled while the title is too short. Give it disabled={titleTooShort}."
          : "The button is still disabled after typing Kiwi. titleTooShort should be false for a title of 3 or more characters."
    },
    {
      id: "validation-is-derived",
      title: "The rule is computed, not stored in state",
      pass: form?.state.length === 1,
      hint: `The inspector sees ${form?.state.length ?? 0} state value(s) on AddProductForm; the title is the only one it should hold. Compute titleTooShort with a plain const instead of a second useState.`
    }
  ];
}
