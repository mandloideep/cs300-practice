function type(element, text) {
  const isSelect = element instanceof HTMLSelectElement;
  const proto = isSelect ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(element, text);
  element.dispatchEvent(new Event(isSelect ? "change" : "input", { bubbles: true }));
}

export default async function check({ document, inspector, wait }) {
  const form = inspector.components.find((component) => component.name === "AddProductForm");
  const field = (name) => document.querySelector(`.add-form [name="${name}"]`);
  const title = field("title");
  const price = field("price");
  const category = field("category");
  const note = () => document.querySelector(".form-note")?.textContent.trim() ?? null;
  const value = form?.state[0]?.value;
  const isObject = value !== null && typeof value === "object" && !Array.isArray(value);
  const keys = isObject ? Object.keys(value) : [];

  if (title) type(title, "Kiwi");
  await wait(50);
  if (price) type(price, "2.49");
  await wait(50);
  const afterPrice = { title: title?.value, price: price?.value, note: note() };
  if (category) type(category, "groceries");
  await wait(50);
  const afterSelect = { title: title?.value, price: price?.value, category: category?.value, note: note() };

  if (title) type(title, "");
  if (price) type(price, "");
  if (category) type(category, "beauty");
  await wait(50);

  return [
    {
      id: "one-object-state",
      title: "AddProductForm keeps one object with title, price, and category",
      pass: form?.state.length === 1 && ["title", "price", "category"].every((key) => keys.includes(key)),
      hint:
        form?.state.length !== 1
          ? `The inspector sees ${form?.state.length ?? 0} state value(s) on AddProductForm. Replace the title state with one useState holding { title: "", price: "", category: "beauty" }.`
          : `The state object has the keys ${keys.join(", ") || "none"}. It needs title, price, and category.`
    },
    {
      id: "fields-keep-each-other",
      title: "Typing a price keeps the title",
      pass: afterPrice.title === "Kiwi" && afterPrice.price === "2.49" && afterPrice.note === "Adding Kiwi",
      hint:
        afterPrice.price !== "2.49"
          ? `After typing 2.49 the price field reads "${afterPrice.price ?? ""}". Give the price input value={fields.price} and onChange={handleChange}, and keep name="price" on it.`
          : `After typing a price the note reads "${afterPrice.note}" and the title field "${afterPrice.title ?? ""}". handleChange should spread ...fields before setting the changed key.`
    },
    {
      id: "select-is-controlled",
      title: "Choosing a category changes only that key",
      pass: afterSelect.category === "groceries" && afterSelect.title === "Kiwi" && afterSelect.price === "2.49" && afterSelect.note === "Adding Kiwi",
      hint:
        afterSelect.category !== "groceries"
          ? "Choosing Groceries did not stick. Give the select value={fields.category} and onChange={handleChange}."
          : "Choosing a category changed another field. The computed key [event.target.name] should touch only the category."
    }
  ];
}
