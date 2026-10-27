function pack() {
  console.log("start pack");
  console.log(new Error("Stack inside pack").stack);
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
  setTimeout(function ship() {
    console.log("start ship");
    console.log(new Error("Stack inside ship").stack);
  }, 0);
  console.log("end placeOrder");
}

placeOrder();
console.log("script done");
