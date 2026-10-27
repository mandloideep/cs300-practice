export default async function check({ document, console, wait }) {
  const button = document.querySelector("#filter-button");
  const status = () => document.querySelector("#status")?.textContent.trim();
  const toggleLogs = () => console.filter((entry) => entry.text.startsWith("doneOnly is now")).length;
  const items = () => document.querySelectorAll("#project-list li").length;

  const logsBeforeClick = toggleLogs();
  const statusBeforeClick = status();
  button?.click();
  await wait(50);
  const logsAfterClick = toggleLogs();
  const statusAfterClick = status();
  const itemsAfterClick = items();
  const pressedAfterClick = button?.getAttribute("aria-pressed");
  button?.click();
  await wait(50);
  const statusAfterSecondClick = status();
  const pressedAfterSecondClick = button?.getAttribute("aria-pressed");

  return [
    {
      id: "handler-waits-for-click",
      title: "The handler does not run while the script loads",
      pass: logsBeforeClick === 0 && statusBeforeClick === "3 of 3 projects shown.",
      hint:
        logsBeforeClick > 0
          ? "The console shows doneOnly is now before any click, so toggleDoneOnly() is still being called with parentheses in addEventListener."
          : `The status reads "${statusBeforeClick}" before any click; it should read "3 of 3 projects shown.".`
    },
    {
      id: "click-filters",
      title: "A click runs the handler and shows the finished projects only",
      pass: logsAfterClick === logsBeforeClick + 1 && itemsAfterClick === 1 && statusAfterClick === "1 of 3 projects shown." && pressedAfterClick === "true",
      hint:
        logsAfterClick === logsBeforeClick
          ? "Clicking the button did not run toggleDoneOnly. Pass the function itself, without parentheses, to addEventListener."
          : `After one click the list shows ${itemsAfterClick} item(s), the status reads "${statusAfterClick}", and aria-pressed is ${pressedAfterClick}. Set aria-pressed inside toggleDoneOnly after flipping doneOnly.`
    },
    {
      id: "second-click-restores",
      title: "A second click shows every project again",
      pass: statusAfterSecondClick === "3 of 3 projects shown." && pressedAfterSecondClick === "false",
      hint: `After a second click the status reads "${statusAfterSecondClick}" and aria-pressed is ${pressedAfterSecondClick}. toggleDoneOnly should flip doneOnly with the ! operator so every click reverses the last one.`
    }
  ];
}
