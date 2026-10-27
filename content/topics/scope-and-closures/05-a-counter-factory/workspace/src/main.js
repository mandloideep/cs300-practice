let sharedCount = 0;

function addToCart() {
  sharedCount = sharedCount + 1;
  return sharedCount;
}

console.log("Alice's cart:", addToCart());
console.log("Bob's cart:", addToCart());
