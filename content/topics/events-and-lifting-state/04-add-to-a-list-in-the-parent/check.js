export default async function check({ document, inspector, wait }) {
  const byName = (name) => inspector.components.find((component) => component.name === name);
  const app = byName("App");
  const form = byName("AddProductForm");
  const cards = () => [...document.querySelectorAll(".product")];
  const leadCount = () => Number.parseInt(document.querySelector(".lead")?.textContent ?? "", 10);
  const all = [...document.querySelectorAll(".filter button")].find((button) => button.textContent.trim() === "All");
  const formElement = document.querySelector(".add-form");

  all?.click();
  await wait(50);
  const before = cards().length;
  const leadBefore = leadCount();
  if (formElement) {
    formElement.elements.title.value = "Kiwi";
    formElement.elements.price.value = "2.49";
    formElement.elements.category.value = "groceries";
    formElement.requestSubmit();
    await wait(50);
  }
  const after = cards();
  const last = after.at(-1);
  const lastTitle = last?.querySelector("h3")?.textContent.trim();
  const lastPrice = last?.querySelector(".product-price")?.textContent.trim();

  const onAdd = form?.props.onAdd;
  return [
    {
      id: "items-are-state-in-app",
      title: "App keeps the products in state",
      pass: app?.state.length === 2,
      hint: `The inspector sees ${app?.state.length ?? 0} state value(s) on App. Add const [items, setItems] = useState(products); under the category state.`
    },
    {
      id: "form-receives-onadd",
      title: "AddProductForm receives onAdd from App",
      pass: typeof onAdd === "string" && onAdd.startsWith("[Function"),
      hint: "Write handleAdd in App and pass it with <AddProductForm onAdd={handleAdd} />, then destructure { onAdd } in the form."
    },
    {
      id: "submit-adds-a-product",
      title: "Submitting the form adds a card to the list",
      pass: after.length === before + 1 && lastTitle === "Kiwi" && lastPrice === "$2.49" && leadCount() === leadBefore + 1,
      hint:
        after.length !== before + 1
          ? `The check submitted Kiwi and the list went from ${before} to ${after.length} cards. handleSubmit should call onAdd(product), and handleAdd should call setItems([...items, product]).`
          : `The last card reads "${lastTitle}" at ${lastPrice} and the lead says ${leadCount()}. Render the list and the lead from items, not from products.`
    }
  ];
}
