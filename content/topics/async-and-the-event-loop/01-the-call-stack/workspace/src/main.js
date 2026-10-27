function pack() {
  console.log("start pack");
  console.log("end pack");
}

function prepare() {
  console.log("start prepare");
  pack();
  console.log("end prepare");
}

function placeOrder() {
  console.log("start placeOrder");
  prepare();
  console.log("end placeOrder");
}

placeOrder();
