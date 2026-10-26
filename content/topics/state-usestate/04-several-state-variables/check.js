function countIn(card) {
  const match = /In cart: (\d+)/.exec(card?.textContent ?? "");
  return match ? Number(match[1]) : null;
}

export default async function check({ document, inspector, wait }) {
  const cards = inspector.components.filter((component) => component.name === "ProductCard");
  const card = document.querySelector(".product");
  const save = card?.querySelector(".save");
  const label = () => save?.textContent.trim() ?? null;
  const pressed = () => save?.getAttribute("aria-pressed") ?? null;

  const quantityBefore = countIn(card);
  const start = { label: label(), pressed: pressed() };
  save?.click();
  await wait(50);
  const once = { label: label(), pressed: pressed(), quantity: countIn(card) };
  save?.click();
  await wait(50);
  const twice = { label: label(), pressed: pressed(), quantity: countIn(card) };

  const toggled =
    start.pressed === "false" && once.pressed === "true" && twice.pressed === "false"
      ? start.label === "Save for later" && once.label === "Saved" && twice.label === "Save for later"
      : start.pressed === "true" && once.pressed === "false" && twice.pressed === "true"
        ? start.label === "Saved" && once.label === "Save for later" && twice.label === "Saved"
        : false;

  return [
    {
      id: "two-state-values",
      title: "Each ProductCard holds a number and a boolean",
      pass:
        cards.length === 6 &&
        cards.every((item) => item.state.length === 2 && typeof item.state[0].value === "number" && typeof item.state[1].value === "boolean"),
      hint: `The inspector sees ${cards[0]?.state.length ?? 0} state value(s) on the first ProductCard. Add const [saved, setSaved] = useState(false); under the quantity line.`
    },
    {
      id: "save-toggles",
      title: "Save for later toggles its label and aria-pressed",
      pass: toggled,
      hint: !save
        ? 'No button with className="save" is on the card. Add it after Add to cart inside the controls.'
        : `Two clicks took the button through "${start.label}" (${start.pressed}), "${once.label}" (${once.pressed}), "${twice.label}" (${twice.pressed}). handleSave should call setSaved(!saved), the label should read saved ? "Saved" : "Save for later", and aria-pressed should be {saved}.`
    },
    {
      id: "values-independent",
      title: "Saving leaves the quantity alone",
      pass: quantityBefore !== null && once.quantity === quantityBefore && twice.quantity === quantityBefore,
      hint: `In cart read ${quantityBefore} before saving and ${once.quantity} after. Keep quantity and saved as two separate useState calls so that one setter never touches the other value.`
    }
  ];
}
