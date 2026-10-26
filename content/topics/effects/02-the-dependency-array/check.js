const runaway = /Maximum update depth exceeded/;

function type(element, text) {
  const isSelect = element instanceof HTMLSelectElement;
  const proto = isSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(element, text);
  element.dispatchEvent(new Event(isSelect ? "change" : "input", { bubbles: true }));
}

async function addProduct(document, title, wait) {
  const form = document.querySelector(".add-form");
  if (!form) return;
  type(form.querySelector('[name="title"]'), title);
  type(form.querySelector('[name="price"]'), "2.49");
  await wait(50);
  form.requestSubmit();
  await wait(100);
}

export default async function check({ document, console, wait }) {
  const notice = () => document.querySelector(".notice")?.textContent.trim() ?? null;
  const filterButton = (label) =>
    [...document.querySelectorAll(".filter button")].find((button) => button.textContent.trim() === label);

  const atStart = notice();
  await wait(1100);
  await addProduct(document, `Kiwi ${Date.now() % 1000}`, wait);
  const afterAdd = notice();
  await wait(1100);
  filterButton("Beauty")?.click();
  await wait(100);
  const afterFilter = notice();
  filterButton("All")?.click();
  await wait(100);
  const looped = console.some((entry) => runaway.test(entry.text));

  return [
    {
      id: "notice-updates-on-add",
      title: "Adding a product updates the time in the notice",
      pass: atStart !== null && afterAdd !== null && afterAdd !== atStart,
      hint:
        atStart === null
          ? "No notice paragraph is on the page. Render it from savedAt under the lead sentence."
          : `The notice read "${atStart}" before the check added a product and "${afterAdd}" after. The effect should depend on [items], so that it runs again when the list changes.`
    },
    {
      id: "notice-ignores-filter",
      title: "Pressing a category leaves the notice alone",
      pass: afterFilter === afterAdd,
      hint: `Pressing Beauty changed the notice from "${afterAdd}" to "${afterFilter}". The dependency array should name items only, so that a category render does not run the effect.`
    },
    {
      id: "no-runaway-loop",
      title: "The effect does not re-render without end",
      pass: !looped,
      hint: "The console reports Maximum update depth exceeded: the effect sets state after every render. Give useEffect the dependency array [items]."
    }
  ];
}
