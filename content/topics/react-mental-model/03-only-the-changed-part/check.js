function countIn(element) {
  const match = element ? element.textContent.match(/Reviewed (\d+)/) : null;
  return match ? Number(match[1]) : null;
}

export default async function check({ document, inspector, wait }) {
  const names = inspector.components.map((component) => component.name);
  const heading = document.querySelector("h1");
  const countLine = document.querySelector("section p");
  const button = document.querySelector("section button");
  const before = countIn(countLine);
  const wasDisabled = Boolean(button?.disabled);
  button?.click();
  await wait(50);
  const after = countIn(document.querySelector("section p"));
  const changed = wasDisabled ? after === 3 : before !== null && after === before + 1;

  return [
    {
      id: "components-present",
      title: "The inspector shows Header and ReviewPanel inside App",
      pass: ["App", "Header", "ReviewPanel"].every((name) => names.includes(name)),
      hint: "Keep the three function components named App, Header, and ReviewPanel, each starting with a capital letter."
    },
    {
      id: "panel-updates",
      title: "A click moves the count up by one",
      pass: changed,
      hint: "Store reviewed with useState and call setReviewed(reviewed + 1) from the button's onClick."
    },
    {
      id: "only-text-changed",
      title: "React kept the heading and the paragraph and changed only the text",
      pass: changed && document.querySelector("h1") === heading && document.querySelector("section p") === countLine,
      hint: "The count must change for this check to mean anything. Once it does, React should reuse the same h1 and p elements; if this fails, make sure the panel is not rebuilt with innerHTML."
    }
  ];
}
