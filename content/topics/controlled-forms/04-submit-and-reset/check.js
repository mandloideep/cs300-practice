const logged = /^New product: .*Kiwi/;

function type(element, text) {
  const isSelect = element instanceof HTMLSelectElement;
  const proto = isSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(element, text);
  element.dispatchEvent(new Event(isSelect ? "change" : "input", { bubbles: true }));
}

export default async function check({ document, console, wait }) {
  const form = document.querySelector(".add-form");
  const field = (name) => form?.querySelector(`[name="${name}"]`);
  const before = console.filter((entry) => logged.test(entry.text)).length;

  let submitted = false;
  let prevented = null;
  function onSubmit(event) {
    submitted = true;
    prevented = event.defaultPrevented;
    event.preventDefault();
  }
  window.addEventListener("submit", onSubmit);

  if (form) {
    type(field("title"), "Kiwi");
    type(field("price"), "2.49");
    type(field("category"), "groceries");
    await wait(50);
    form.requestSubmit();
    await wait(50);
  }
  window.removeEventListener("submit", onSubmit);

  const fresh = console.filter((entry) => logged.test(entry.text)).slice(before);
  const after = { title: field("title")?.value, price: field("price")?.value, category: field("category")?.value };

  return [
    {
      id: "submit-is-prevented",
      title: "Submitting does not reload the page",
      pass: submitted && prevented === true,
      hint: !submitted
        ? "The check filled in the form and submitted it, but no submit event reached the window. Keep the fields inside the form and the button as type=\"submit\"."
        : "The submit event was not prevented, so the browser would reload the page. Call event.preventDefault() first in handleSubmit, and attach it with onSubmit on the form."
    },
    {
      id: "submit-sends-product",
      title: "The submit hands the product to App through onAdd",
      pass: fresh.length === 1,
      hint:
        fresh.length === 0
          ? "After the submit, App logged no New product line with Kiwi. handleSubmit should call onAdd with an object built from fields."
          : `One submit logged ${fresh.length} products; call onAdd once per submit.`
    },
    {
      id: "form-resets",
      title: "The fields are empty after the submit",
      pass: after.title === "" && after.price === "" && after.category === "beauty",
      hint: `After the submit the fields read title "${after.title ?? ""}", price "${after.price ?? ""}", category "${after.category ?? ""}". End handleSubmit with setFields({ title: "", price: "", category: "beauty" }).`
    }
  ];
}
