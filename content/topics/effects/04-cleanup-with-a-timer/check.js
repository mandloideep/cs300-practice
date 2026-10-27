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
  await wait(50);
}

export default async function check({ document, wait }) {
  const noticeShown = () => document.querySelector(".notice") !== null;
  const stamp = Date.now() % 1000;

  await addProduct(document, `Kiwi ${stamp}`, wait);
  const shownAfterFirst = noticeShown();
  await wait(900);
  await addProduct(document, `Plum ${stamp}`, wait);
  const shownAfterSecond = noticeShown();
  await wait(1400);
  const shownBetween = noticeShown();
  await wait(1000);
  const shownAtEnd = noticeShown();

  return [
    {
      id: "notice-clears",
      title: "The notice disappears two seconds after a save",
      pass: shownAfterFirst && shownAfterSecond && !shownAtEnd,
      hint: !shownAfterFirst
        ? "The notice did not appear after adding a product. Keep the first effect as it was in Step 3."
        : "The notice was still on the page more than two seconds after the last save. The timer effect should call setSavedAt(null) after 2000 milliseconds."
    },
    {
      id: "timer-cleaned-up",
      title: "A second save within two seconds keeps its full two seconds",
      pass: shownAfterSecond && shownBetween,
      hint: "After two saves a second apart, the notice was gone 1.4 seconds after the second one, so the first timer cleared it. Return () => clearTimeout(timer) from the effect so that React stops the old timer before starting the new one."
    }
  ];
}
