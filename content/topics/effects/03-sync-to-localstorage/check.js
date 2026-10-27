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

function stored() {
  const raw = localStorage.getItem("products");
  if (raw === null) return { raw, list: null };
  try {
    const list = JSON.parse(raw);
    return { raw, list: Array.isArray(list) ? list : null };
  } catch {
    return { raw, list: null };
  }
}

export default async function check({ document, wait }) {
  const leadCount = () => Number.parseInt(document.querySelector(".lead")?.textContent ?? "", 10);
  const notice = () => document.querySelector(".notice")?.textContent.trim() ?? "";

  const atStart = stored();
  const countAtStart = leadCount();
  const title = `Kiwi ${Date.now() % 1000}`;
  await addProduct(document, title, wait);
  const afterAdd = stored();
  const countAfterAdd = leadCount();
  const lastTitle = afterAdd.list?.at(-1)?.title ?? null;

  return [
    {
      id: "storage-holds-the-list",
      title: "The products key holds the list as JSON",
      pass: atStart.list !== null && atStart.list.length === countAtStart,
      hint:
        atStart.raw === null
          ? "localStorage has no products key. Call localStorage.setItem(\"products\", JSON.stringify(items)) inside the effect."
          : atStart.list === null
            ? `The products key holds "${atStart.raw.slice(0, 40)}", which is not a JSON array. Store JSON.stringify(items), not items.`
            : `The stored list has ${atStart.list.length} products and the page shows ${countAtStart}. The effect should write items, the same array the page renders.`
    },
    {
      id: "storage-follows-add",
      title: "Adding a product writes the new list",
      pass: afterAdd.list !== null && afterAdd.list.length === countAfterAdd && lastTitle === title,
      hint:
        afterAdd.list === null
          ? "After adding a product the products key is missing or not JSON."
          : `After adding ${title} the page shows ${countAfterAdd} products and storage holds ${afterAdd.list.length}, ending with "${lastTitle}". The effect should depend on [items] so that it writes after every change.`
    },
    {
      id: "notice-says-saved",
      title: "The notice reads Saved at",
      pass: /^Saved at /.test(notice()),
      hint: `The notice reads "${notice()}". Change its text to Saved at, because the effect now saves the list.`
    }
  ];
}
