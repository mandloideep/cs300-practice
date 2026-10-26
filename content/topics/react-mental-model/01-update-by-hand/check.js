function countIn(element) {
  const match = element ? element.textContent.match(/\d+/) : null;
  return match ? Number(match[0]) : null;
}

export default async function check({ document, wait }) {
  const status = document.querySelector("#status");
  const remaining = document.querySelector("#remaining");
  const button = document.querySelector("#review");
  const before = countIn(status);
  button?.click();
  await wait(50);
  const after = countIn(status);
  const left = countIn(remaining);
  const expected = before === null ? null : Math.min(before + 1, 3);

  return [
    {
      id: "status-updates",
      title: "The status line counts each click",
      pass: after !== null && after === expected && after > 0,
      hint: "After a click the status line should read the new value of reviewed. Set statusLine.textContent inside the click handler, after reviewed = reviewed + 1;."
    },
    {
      id: "remaining-updates",
      title: "The concepts-left line agrees with the status line",
      pass: after !== null && after > 0 && left === 3 - after,
      hint: "The second paragraph still shows its first text. Set remainingLine.textContent in the click handler too, using total - reviewed."
    }
  ];
}
