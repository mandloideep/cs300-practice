function type(element, text) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, text);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

export default async function check({ document, inspector, wait }) {
  const form = inspector.components.find((component) => component.name === "AddProductForm");
  const formElement = document.querySelector(".add-form");
  const title = document.querySelector('input[name="title"]');
  let focusedAtStart = false;
  for (let attempt = 0; attempt < 20 && !focusedAtStart; attempt += 1) {
    focusedAtStart = title !== null && document.activeElement === title;
    if (!focusedAtStart) await wait(50);
  }

  if (formElement && title) {
    type(title, "Kiwi");
    type(formElement.querySelector('[name="price"]'), "2.49");
    await wait(50);
    formElement.querySelector('button[type="submit"]')?.focus();
    formElement.requestSubmit();
    await wait(50);
  }
  const focusedAfterSubmit = title !== null && document.activeElement === title;

  return [
    {
      id: "title-focused-on-load",
      title: "The Title field has the focus after the page loads",
      pass: focusedAtStart,
      hint: "The Title field did not have the focus when the checks ran. Call titleRef.current.focus() in an effect with an empty dependency array, give the input ref={titleRef}, and run the checks right after Run, before clicking inside the result."
    },
    {
      id: "title-focused-after-submit",
      title: "The focus returns to the Title field after a submit",
      pass: focusedAfterSubmit,
      hint: "After the check submitted the form, the focus stayed on the button. End handleSubmit with titleRef.current.focus()."
    },
    {
      id: "ref-is-not-state",
      title: "The ref adds no state to AddProductForm",
      pass: form?.state.length === 1,
      hint: `The inspector sees ${form?.state.length ?? 0} state value(s) on AddProductForm; the fields object should be the only one. Hold the element in useRef(null), not in useState.`
    }
  ];
}
