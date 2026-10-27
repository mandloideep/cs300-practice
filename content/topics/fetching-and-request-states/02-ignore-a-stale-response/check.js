export default async function check({ document, network, wait }) {
  const select = document.querySelector("select");
  const choose = (value) => {
    select.value = value;
    select.dispatchEvent(new Event("change", { bubbles: true }));
  };
  const metas = () => [...document.querySelectorAll(".product-meta")].map((meta) => meta.textContent.split(",")[0].trim());
  const showing = (category) => {
    const list = metas();
    return list.length > 0 && list.every((meta) => meta === category);
  };
  const settle = async (category, limit) => {
    for (let elapsed = 0; elapsed < limit && !showing(category); elapsed += 100) {
      await wait(100);
    }
  };
  const requestsTo = (category) =>
    network.filter((request) => {
      try {
        return new URL(request.url).pathname.endsWith("/products/category/" + category);
      } catch {
        return false;
      }
    });

  const start = select?.value ?? "beauty";
  await settle(start, 8000);
  const before = requestsTo("furniture").length;
  choose("furniture");
  await settle("furniture", 8000);
  const furnitureRequested = requestsTo("furniture").length > before;
  const furnitureShown = showing("furniture");

  choose("beauty");
  choose("groceries");
  await wait(3500);
  const groceriesShown = showing("groceries");
  const shownInstead = metas()[0] ?? "nothing";
  const selected = select?.value;

  choose(start);
  await settle(start, 8000);

  return [
    {
      id: "effect-depends-on-category",
      title: "Changing the category sends a new request and shows that category",
      pass: furnitureRequested && furnitureShown,
      hint: furnitureRequested
        ? "A furniture request was sent but the list did not show the furniture products. The success branch should store the products the request returned."
        : "Choosing Furniture sent no request. Put category in the effect's dependency array so the effect runs again when it changes."
    },
    {
      id: "stale-response-ignored",
      title: "A slow response for an earlier category no longer replaces the newer one",
      pass: groceriesShown && selected === "groceries",
      hint: `After choosing Beauty and then Groceries, the list shows ${shownInstead} while the select says ${selected}. Each setter call should run only when the effect's cancelled flag is still false, and the cleanup should set it to true.`
    }
  ];
}
