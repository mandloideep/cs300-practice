export default async function check({ document, wait }) {
  const button = [...document.querySelectorAll("main button")].find((element) =>
    element.textContent.includes("build evidence")
  );
  const status = () => document.querySelector('main [role="status"]');

  if (button && button.getAttribute("aria-expanded") === "true") {
    button.click();
    await wait(50);
  }
  const closedLabel = button ? button.textContent.trim() : "";
  const closedStatus = status();
  const closedExpanded = button ? button.getAttribute("aria-expanded") : null;
  button?.click();
  await wait(50);
  const openLabel = button ? button.textContent.trim() : "";
  const openStatus = status();
  const openExpanded = button ? button.getAttribute("aria-expanded") : null;
  button?.click();
  await wait(50);

  return [
    {
      id: "label-follows-state",
      title: "The button label switches between Show and Hide",
      pass: closedLabel === "Show build evidence" && openLabel === "Hide build evidence",
      hint: "Replace the fixed label with {showEnvironment ? \"Hide\" : \"Show\"} build evidence, with Hide first."
    },
    {
      id: "status-only-when-open",
      title: "The Vite mode appears only while the evidence is shown",
      pass: !closedStatus && Boolean(openStatus) && openStatus.textContent.trim() === "Vite mode: development",
      hint: "Add {showEnvironment && <p role=\"status\">Vite mode: {import.meta.env.MODE}</p>} on the line after </button>."
    },
    {
      id: "expanded-follows-state",
      title: "aria-expanded matches what is shown",
      pass: closedExpanded === "false" && openExpanded === "true",
      hint: "Keep aria-expanded={showEnvironment} on the button so assistive technology knows whether the evidence is open."
    }
  ];
}
