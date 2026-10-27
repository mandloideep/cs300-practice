function prepare(order) {
  return new Promise((resolve) => {
    setTimeout(() => {
      order.status = "prepared";
      resolve(order);
    }, 100);
  });
}

function ship(order) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (order.address === undefined) {
        reject(new Error(`Order ${order.id} has no address`));
        return;
      }
      order.status = "shipped";
      resolve(order);
    }, 100);
  });
}

const first = { id: 101, item: "Notebook", address: "5500 N St Louis Ave" };
const second = { id: 102, item: "Calculator" };

function track(order) {
  return prepare(order)
    .then((prepared) => {
      console.log("Order", prepared.id, prepared.status);
      return ship(prepared);
    })
    .then((shipped) => {
      console.log("Order", shipped.id, shipped.status);
    })
    .catch((error) => {
      console.warn("Problem:", error.message);
    })
    .finally(() => {
      console.log("Order", order.id, "done");
    });
}

async function trackWithAwait(order) {
  try {
    const prepared = await prepare(order);
    console.log("Order", prepared.id, prepared.status);
    const shipped = await ship(prepared);
    console.log("Order", shipped.id, shipped.status);
  } catch (error) {
    console.warn("Problem:", error.message);
  } finally {
    console.log("Order", order.id, "done");
  }
}

trackWithAwait(first);
trackWithAwait(second);
console.log("Tracking started");
