let sharedCount = 0;

function addToCart() {
  sharedCount = sharedCount + 1;
  return sharedCount;
}

console.log("Alice's cart:", addToCart());
console.log("Bob's cart:", addToCart());

function makeCartCounter() {
  let count = 0;
  return () => {
    count = count + 1;
    return count;
  };
}

const aliceAdds = makeCartCounter();
const bobAdds = makeCartCounter();
console.log("Alice adds:", aliceAdds());
console.log("Alice adds:", aliceAdds());
console.log("Bob adds:", bobAdds());
console.log("Alice adds:", aliceAdds());

console.log("aliceAdds.count is", aliceAdds.count);
