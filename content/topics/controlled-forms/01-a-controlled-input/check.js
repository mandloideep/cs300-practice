const readOnlyWarning = /without an `onChange` handler/;

function type(input, text) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  setter.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export default async function check({ document, console, inspector, wait }) {
  const form = inspector.components.find((component) => component.name === "AddProductForm");
  const input = document.querySelector('input[name="title"]');
  const note = () => document.querySelector(".form-note")?.textContent.trim() ?? null;
  const warned = console.some((entry) => readOnlyWarning.test(entry.text));

  if (input) type(input, "Kiwi");
  await wait(50);
  const shown = input?.value ?? null;
  const noteAfter = note();
  if (input) type(input, "");
  await wait(50);

  return [
    {
      id: "title-is-state",
      title: "AddProductForm keeps the title in state",
      pass: form?.state.length === 1 && typeof form.state[0].value === "string",
      hint: `The inspector sees ${form?.state.length ?? 0} state value(s) on AddProductForm. Call useState("") at the top of the component and unpack it as const [title, setTitle].`
    },
    {
      id: "typing-updates-note",
      title: "Typing Kiwi shows it in the field and in the note",
      pass: shown === "Kiwi" && noteAfter === "Adding Kiwi",
      hint:
        shown !== "Kiwi"
          ? `After typing Kiwi the field reads "${shown ?? ""}". Pair value={title} with onChange={(event) => setTitle(event.target.value)}.`
          : `The note reads "${noteAfter}" instead of "Adding Kiwi". Render the title from state in the form-note paragraph.`
    },
    {
      id: "no-readonly-warning",
      title: "React did not warn about a read-only field",
      pass: !warned,
      hint: "The console has React's warning about a value prop without an onChange handler. A controlled input needs both attributes."
    }
  ];
}
