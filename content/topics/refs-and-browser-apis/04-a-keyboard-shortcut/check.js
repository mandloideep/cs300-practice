function pressSlash(target) {
  target.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, cancelable: true }));
}

export default async function check({ document, wait }) {
  const title = document.querySelector('input[name="title"]');
  const price = document.querySelector('input[name="price"]');
  const heading = document.querySelector("h1");

  price?.focus();
  heading?.focus();
  document.activeElement?.blur();
  pressSlash(document.body);
  await wait(50);
  const afterBody = document.activeElement === title;

  price?.focus();
  pressSlash(price ?? document.body);
  await wait(50);
  const afterPrice = document.activeElement === price;

  return [
    {
      id: "slash-focuses-title",
      title: "Pressing / outside a field focuses the Title field",
      pass: afterBody,
      hint: "A / key pressed on the page did not move the focus to the Title field. Add a keydown listener on window in an effect inside AddProductForm, and call titleRef.current.focus() when event.key is \"/\"."
    },
    {
      id: "slash-ignored-in-fields",
      title: "Pressing / inside the Price field leaves the focus there",
      pass: afterPrice,
      hint: "A / key pressed inside the Price field moved the focus. Return early when event.target.tagName is \"INPUT\", so that the shopper can type a slash."
    }
  ];
}
