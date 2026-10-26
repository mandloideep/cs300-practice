export default async function check({ document, wait }) {
  const view = document.defaultView;
  const select = document.querySelector(".controls select");
  const checkbox = document.querySelector('.controls input[type="checkbox"]');
  const chooseCategory = async (value) => {
    Object.getOwnPropertyDescriptor(view.HTMLSelectElement.prototype, "value").set.call(select, value);
    select.dispatchEvent(new view.Event("change", { bubbles: true }));
    await wait(50);
  };
  const setFailed = async (wanted) => {
    if (checkbox.checked !== wanted) {
      checkbox.click();
      await wait(50);
    }
  };
  const snapshot = () => ({
    items: document.querySelectorAll(".product-list > li").length,
    status: document.querySelector('[role="status"]')?.textContent.trim() ?? null,
    alert: document.querySelector('[role="alert"]')?.textContent.trim() ?? null
  });

  if (!select || !checkbox) {
    return [
      { id: "list-renders", title: "The product list renders", pass: false, hint: "The category menu or the checkbox is missing; keep the controls from the starter." },
      { id: "empty-state", title: "An empty category shows its own message", pass: false, hint: "Restore the controls first." },
      { id: "error-state", title: "A failed load shows an error instead", pass: false, hint: "Restore the controls first." }
    ];
  }

  await setFailed(false);
  await chooseCategory("all");
  const all = snapshot();
  await chooseCategory("furniture");
  const empty = snapshot();
  await setFailed(true);
  const failed = snapshot();
  await setFailed(false);
  await chooseCategory("all");

  return [
    {
      id: "list-renders",
      title: "The product list renders",
      pass: all.items === 6 && !all.status && !all.alert,
      hint: `With All selected the list shows ${all.items} products. The empty message should appear only when items is an empty array.`
    },
    {
      id: "empty-state",
      title: "An empty category shows its own message",
      pass: empty.items === 0 && empty.status === "No products match this category." && !empty.alert,
      hint: "Choosing Furniture should show a role=\"status\" paragraph reading No products match this category. Add the items.length === 0 guard clause at the top of ProductList."
    },
    {
      id: "error-state",
      title: "A failed load shows an error instead",
      pass: failed.items === 0 && Boolean(failed.alert) && !failed.status,
      hint: failed.status
        ? "The page says no products match when the load failed. Check error in App before rendering ProductList."
        : "With the checkbox on, the page should show a role=\"alert\" paragraph with the error message. Replace <ProductList ... /> in App with error ? (...) : (...)."
    }
  ];
}
