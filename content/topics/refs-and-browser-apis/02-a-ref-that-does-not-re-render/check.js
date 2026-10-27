const pattern = /^Save (\d+) wrote (\d+) products$/;

function type(element, text) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(element, text);
  element.dispatchEvent(new Event("input", { bubbles: true }));
}

async function addProduct(document, title, wait) {
  const form = document.querySelector(".add-form");
  if (!form) return;
  type(form.querySelector('[name="title"]'), title);
  type(form.querySelector('[name="price"]'), "2.49");
  await wait(50);
  form.requestSubmit();
  await wait(100);
}

export default async function check({ document, console, inspector, wait }) {
  const app = inspector.components.find((component) => component.name === "App");
  const counts = () => console.filter((entry) => pattern.test(entry.text)).map((entry) => Number(pattern.exec(entry.text)[1]));

  const before = counts();
  const highest = before.length > 0 ? Math.max(...before) : 0;
  await addProduct(document, `Kiwi ${Date.now() % 1000}`, wait);
  const fresh = counts().slice(before.length);

  return [
    {
      id: "save-count-climbs",
      title: "Each save logs the next number",
      pass: before.length > 0 && fresh.length > 0 && fresh.every((count) => count > highest),
      hint:
        before.length === 0
          ? 'No Save line is in the console. Log "Save", the count, "wrote", items.length, "products" inside the save effect.'
          : fresh.length === 0
            ? "Adding a product logged no Save line; keep the log inside the effect that depends on [items]."
            : `The highest count before the add was ${highest} and the add logged ${fresh.join(", ")}. A let in the body of App starts over on every render; keep the count in useRef(0) and add to saves.current.`
    },
    {
      id: "no-extra-state",
      title: "The counter is a ref, not state",
      pass: app?.state.length === 3,
      hint: `The inspector sees ${app?.state.length ?? 0} state value(s) on App; category, items, and savedAt should be the only three. Keep the save count in useRef, which the tree does not list.`
    }
  ];
}
