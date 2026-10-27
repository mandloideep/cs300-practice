function stored() {
  const raw = localStorage.getItem("saved-for-later");
  if (raw === null) return { raw, data: null };
  try {
    return { raw, data: JSON.parse(raw) };
  } catch {
    return { raw, data: null };
  }
}

function isVersioned(data) {
  return data !== null && typeof data === "object" && !Array.isArray(data) && data.version === 1 && Array.isArray(data.ids);
}

export default async function check({ document, wait }) {
  const pressed = () => document.querySelectorAll('.save[aria-pressed="true"]').length;
  const button = document.querySelector(".save");

  button?.click();
  await wait(50);
  const afterToggle = stored();
  const pressedAfterToggle = pressed();
  button?.click();
  await wait(50);
  const afterSecondToggle = stored();
  const pressedAfterSecondToggle = pressed();

  return [
    {
      id: "stored-shape-is-versioned",
      title: "Storage holds an object with version 1 and an ids array",
      pass: isVersioned(afterToggle.data),
      hint:
        afterToggle.raw === null
          ? "The saved-for-later key is missing; keep the write effect."
          : `After a toggle the key holds ${afterToggle.raw.slice(0, 60)}. Write JSON.stringify({ version: 1, ids: savedIds }).`
    },
    {
      id: "ids-match-screen",
      title: "The stored ids match the marked products after each toggle",
      pass:
        isVersioned(afterToggle.data) &&
        isVersioned(afterSecondToggle.data) &&
        afterToggle.data.ids.length === pressedAfterToggle &&
        afterSecondToggle.data.ids.length === pressedAfterSecondToggle &&
        pressedAfterToggle !== pressedAfterSecondToggle,
      hint: `After two toggles the page marks ${pressedAfterSecondToggle} products and storage holds ${isVersioned(afterSecondToggle.data) ? afterSecondToggle.data.ids.length : "no"} ids. The effect should write the current savedIds inside the versioned object on every change.`
    }
  ];
}
