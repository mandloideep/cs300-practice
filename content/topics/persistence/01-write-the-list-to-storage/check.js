function stored() {
  const raw = localStorage.getItem("saved-for-later");
  if (raw === null) return { raw, ids: null };
  try {
    const ids = JSON.parse(raw);
    return { raw, ids: Array.isArray(ids) ? ids : null };
  } catch {
    return { raw, ids: null };
  }
}

export default async function check({ document, wait }) {
  const pressed = () => document.querySelectorAll('.save[aria-pressed="true"]').length;
  const button = document.querySelector(".save");

  const atStart = stored();
  const pressedAtStart = pressed();
  button?.click();
  await wait(50);
  const afterToggle = stored();
  const pressedAfterToggle = pressed();
  button?.click();
  await wait(50);

  const describe = (value) =>
    value.raw === null
      ? "localStorage has no saved-for-later key. Call localStorage.setItem(\"saved-for-later\", JSON.stringify(savedIds)) inside an effect."
      : value.ids === null
        ? `The saved-for-later key holds "${value.raw.slice(0, 40)}", which is not a JSON array. Store JSON.stringify(savedIds), not savedIds.`
        : null;

  return [
    {
      id: "storage-written-on-load",
      title: "The saved-for-later key holds the saved ids as JSON",
      pass: atStart.ids !== null && atStart.ids.length === pressedAtStart,
      hint: describe(atStart) ?? `Storage holds ${atStart.ids.length} ids while ${pressedAtStart} products are marked. The effect should write savedIds, the same array the page renders.`
    },
    {
      id: "storage-follows-toggle",
      title: "Toggling a product writes the new list",
      pass: afterToggle.ids !== null && afterToggle.ids.length === pressedAfterToggle && pressedAfterToggle !== pressedAtStart,
      hint: describe(afterToggle) ?? `After toggling a product the page marks ${pressedAfterToggle} and storage holds ${afterToggle.ids.length}. The effect should depend on [savedIds] so that it writes after every change.`
    }
  ];
}
