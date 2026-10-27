export default async function check({ console }) {
  const texts = console.map((entry) => entry.text);
  const statusLogged = texts.some((text) => text.startsWith("status is <p#status"));
  const countLogged = texts.includes("3 projects on the page");
  const nullLogged = texts.some((text) => /misspelled selector gives null$/.test(text));
  return [
    {
      id: "status-selected",
      title: "The status paragraph is selected and logged",
      pass: statusLogged,
      hint: 'The console should show "status is <p#status>". Select it with document.querySelector("#status") and log the result.'
    },
    {
      id: "three-items-counted",
      title: "querySelectorAll counts the three list items",
      pass: countLogged,
      hint: 'The console should show "3 projects on the page". Select the items with document.querySelectorAll("#project-list li") and log projects.length.'
    },
    {
      id: "missing-is-null",
      title: "A selector that matches nothing logs null",
      pass: nullLogged,
      hint: 'The console should show "misspelled selector gives null". Keep the misspelled #project-lsit selector for this step so you can see what querySelector returns when nothing matches.'
    }
  ];
}
