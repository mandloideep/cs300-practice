function countIn(element) {
  const match = element ? element.textContent.match(/Reviewed (\d+)/) : null;
  return match ? Number(match[1]) : null;
}

export default async function check({ document, wait }) {
  const panel = document.querySelector("#panel");
  const button = document.querySelector("#review");
  const before = countIn(panel);
  button?.click();
  await wait(50);
  const after = countIn(panel);
  const expected = before === null ? null : Math.min(before + 1, 3);

  for (let i = 0; i < 3; i++) {
    button?.click();
  }
  await wait(50);
  const finalText = panel ? panel.textContent : "";

  return [
    {
      id: "panel-from-value",
      title: "The panel is described again after each click",
      pass: after !== null && after === expected && after > 0,
      hint: "The count should go up by one per click. Call panel.innerHTML = renderPanel(reviewed); inside the click handler, after reviewed changes."
    },
    {
      id: "message-at-total",
      title: "The panel says all concepts are reviewed at three",
      pass: finalText.includes("Reviewed 3 of 3 concepts.") && finalText.includes("All concepts reviewed."),
      hint: "After three clicks renderPanel(3) should return both paragraphs. Check that the message line compares count === total and that the template uses backticks."
    }
  ];
}
