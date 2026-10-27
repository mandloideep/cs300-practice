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
  const firstOfRun = requestsTo(start)[0];

  const beautyBefore = requestsTo("beauty").length;
  choose("furniture");
  await settle("furniture", 8000);
  choose("beauty");
  choose("groceries");
  await wait(3500);
  const beautyRequest = requestsTo("beauty")[beautyBefore];
  const groceriesShown = showing("groceries");
  const shownInstead = metas()[0] ?? "nothing";

  choose(start);
  await settle(start, 8000);

  return [
    {
      id: "old-request-aborted",
      title: "Changing the category aborts the request that is still pending",
      pass: beautyRequest?.state === "aborted" && groceriesShown,
      hint: !beautyRequest
        ? "Choosing Beauty sent no request. Keep category in the effect's dependency array."
        : beautyRequest.state !== "aborted"
          ? `The beauty request ended ${beautyRequest.state} instead of aborted. The cleanup should call controller.abort(), and loadProducts should pass the signal to fetch.`
          : `The beauty request was aborted but the list shows ${shownInstead}. The success branch should store the products the newest request returned.`
    },
    {
      id: "first-run-aborted",
      title: "Strict Mode's first effect run is cleaned up with an abort",
      pass: firstOfRun?.state === "aborted",
      hint: firstOfRun
        ? `The first request of the run ended ${firstOfRun.state}. In development React runs the effect, its cleanup, and the effect again; the cleanup should abort the first request.`
        : "No request was sent when the page loaded. The effect should call loadProducts with the category and the controller's signal."
    }
  ];
}
