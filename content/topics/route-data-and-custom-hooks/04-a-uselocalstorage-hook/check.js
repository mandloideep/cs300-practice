export default async function check({ document, wait }) {
  const storage = document.defaultView.localStorage;
  const key = "shop-saved-products";
  const stored = () => {
    try {
      const value = JSON.parse(storage.getItem(key) ?? "null");
      return Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  };
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const isLoading = () => /Loading product/.test(document.body.textContent);
  const settle = async () => {
    await wait(50);
    for (let elapsed = 0; elapsed < 8000 && isLoading(); elapsed += 100) {
      await wait(100);
    }
  };
  const saveButton = () => [...document.querySelectorAll("main button")].find((button) => /saved|save for later/i.test(button.textContent));

  navLink("/products")?.click();
  await settle();
  document.querySelector('.product-list a[href="/products/1"]')?.click();
  await settle();
  const before = stored();
  const wasSaved = before?.includes(1) ?? false;
  saveButton()?.click();
  await wait(100);
  const afterToggle = stored();
  const toggled = afterToggle !== null && afterToggle.includes(1) === !wasSaved;
  const pressed = saveButton()?.getAttribute("aria-pressed") === String(!wasSaved);
  saveButton()?.click();
  await wait(100);
  const restored = stored();
  const restoredRight = restored !== null && restored.includes(1) === wasSaved;

  navLink("/")?.click();
  await wait(50);

  return [
    {
      id: "save-writes-local-storage",
      title: "Pressing the save button writes the saved ids to localStorage",
      pass: toggled && pressed,
      hint:
        afterToggle === null
          ? `Nothing is stored under ${key}. The hook's effect should write JSON.stringify(value) under the key whenever the value changes, and App should call useLocalStorage with that key.`
          : "The stored array did not change with the press. App should read saved from useLocalStorage and the hook should return [value, setValue]."
    },
    {
      id: "saved-survives-a-rerun",
      title: "The hook starts from what localStorage holds and keeps it in step",
      pass: toggled && restoredRight && before !== null,
      hint:
        before === null
          ? "The key was not in storage when the page loaded. The hook's initial state should read localStorage.getItem(key) and the effect should write the initial value on the first render."
          : "After pressing the button twice the stored array differs from where it started. Each change should be written to storage."
    }
  ];
}
