function shown(document) {
  const match = /Apples in the cart: (\d+)/.exec(document.querySelector(".lead")?.textContent ?? "");
  return match ? Number(match[1]) : null;
}

function button(document, label) {
  return [...document.querySelectorAll("button")].find((candidate) => candidate.textContent.trim() === label);
}

export default async function check({ document, console, wait }) {
  const reports = () =>
    console.filter((entry) => entry.level === "log" && entry.text.startsWith("Quantity a moment later:"));

  const start = shown(document);
  button(document, "Add three")?.click();
  await wait(50);
  const afterThree = shown(document);

  const reportsBefore = reports().length;
  button(document, "Add one and report")?.click();
  for (let i = 0; i < 40 && reports().length === reportsBefore; i++) await wait(50);
  const afterOne = shown(document);
  const report = reports()[reportsBefore]?.text ?? null;

  return [
    {
      id: "add-three-adds-three",
      title: "Add three raises the quantity by three",
      pass: start !== null && afterThree === start + 3,
      hint:
        start === null
          ? "The page should show Apples in the cart: followed by a number."
          : `The quantity went from ${start} to ${afterThree}. Each of the three calls should be setQuantity((current) => current + 1), so each starts from the one before.`
    },
    {
      id: "add-one-adds-one",
      title: "Add one and report raises the quantity by one",
      pass: afterThree !== null && afterOne === afterThree + 1,
      hint: "addOneAndReport should call setQuantity once, with quantity + 1."
    },
    {
      id: "report-is-current",
      title: "The timer reports the quantity the page now shows",
      pass: report === `Quantity a moment later: ${afterOne}`,
      hint:
        report === null
          ? "No Quantity a moment later: line arrived within two seconds of the click."
          : `The timer printed "${report}" while the page shows ${afterOne}. Compute const next = quantity + 1 first, pass next to setQuantity, and log next in the timer.`
    }
  ];
}
