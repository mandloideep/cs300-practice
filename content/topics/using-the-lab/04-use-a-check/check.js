export default async function check({ document }) {
  const button = [...document.querySelectorAll("main button")].find(
    (candidate) => candidate.textContent.trim() === "Say hello to the console"
  );
  const heading = document.querySelector("main h2");
  const headingText = heading?.textContent.trim() ?? "";
  const paragraph = heading?.nextElementSibling;
  const items = document.querySelectorAll("main ul.plan li");

  return [
    {
      id: "button-kept",
      title: "The Say hello to the console button is still there",
      pass: button !== undefined,
      hint: "The button from the last step is missing. Add the new lines after the button line, not in place of it."
    },
    {
      id: "next-heading",
      title: "An h2 after the button reads Next up",
      pass: headingText === "Next up" && heading.previousElementSibling === button,
      hint: heading
        ? `The h2 reads "${headingText}", and it should read "Next up" exactly, right after the button.`
        : "There is no h2 on the page yet. Type the first card after the button line."
    },
    {
      id: "next-paragraph",
      title: "A sentence about the inspector follows the heading",
      pass: paragraph?.tagName === "P" && /inspector/i.test(paragraph.textContent),
      hint: "Put a p element right after the h2, and mention the inspector in it."
    },
    {
      id: "fourth-item",
      title: "Stretch goal: the plan has a fourth item, Read the checks",
      pass: items.length === 4 && items[3].textContent.trim() === "Read the checks",
      hint: `The plan has ${items.length} items. Add <li>Read the checks</li> after the Run and look item.`
    }
  ];
}
