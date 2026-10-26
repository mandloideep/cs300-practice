function storedIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("saved-for-later"));
    return Array.isArray(ids) ? ids : null;
  } catch {
    return null;
  }
}

export default async function check({ document, inspector, wait }) {
  const app = inspector.components.find((component) => component.name === "App");
  const pressed = () => document.querySelectorAll('.save[aria-pressed="true"]').length;
  const leadCount = () => Number.parseInt(document.querySelector(".lead")?.textContent ?? "", 10);
  const button = document.querySelector(".save");

  const idsAtStart = storedIds();
  const pressedAtStart = pressed();
  const initial = app?.state[0]?.value;
  button?.click();
  await wait(50);
  const idsAfterToggle = storedIds();
  const pressedAfterToggle = pressed();
  const leadAfterToggle = leadCount();
  button?.click();
  await wait(50);

  return [
    {
      id: "screen-matches-storage-on-load",
      title: "On load, the marked products are the stored ids",
      pass: Array.isArray(initial) && idsAtStart !== null && idsAtStart.length === pressedAtStart && initial.length === pressedAtStart,
      hint:
        !Array.isArray(initial)
          ? `App started with ${JSON.stringify(initial)} instead of an array. The initializer should return the parsed array, or [] when nothing is stored.`
          : idsAtStart === null
            ? "The saved-for-later key is missing or not a JSON array; keep the write effect from Step 1."
            : `Storage holds ${idsAtStart.length} ids and ${pressedAtStart} products are marked on load. Start the state from the stored ids with useState(() => ...).`
    },
    {
      id: "screen-matches-storage-after-toggle",
      title: "After a toggle, storage and the screen still agree",
      pass: idsAfterToggle !== null && idsAfterToggle.length === pressedAfterToggle && leadAfterToggle === pressedAfterToggle && pressedAfterToggle !== pressedAtStart,
      hint: `After toggling a product, ${pressedAfterToggle} are marked, the lead says ${leadAfterToggle}, and storage holds ${idsAfterToggle?.length ?? "no"} ids. The write effect and the initializer must use the same key and the same JSON shape.`
    }
  ];
}
