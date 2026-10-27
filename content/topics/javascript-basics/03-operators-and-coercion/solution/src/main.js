const price = 10;
const quantity = 3;

console.log("Total:", price * quantity);
console.log("Remainder of 10 / 3:", 10 % 3);
console.log("2 to the 10th:", 2 ** 10);

console.log("quantity > 2:", quantity > 2);
console.log("5 === 5:", 5 === 5);
console.log('5 === "5":', 5 === "5");
console.log('5 == "5":', 5 == "5");

console.log('"5" + 3:', "5" + 3);
console.log('"5" - 3:', "5" - 3);
console.log('"b" + "a" + +"a" + "a":', "b" + "a" + +"a" + "a");

const typed = "42";
console.log("typed + 1:", typed + 1);
console.log("Number(typed) + 1:", Number(typed) + 1);
console.log('Number(""):', Number(""));
console.log(`Number("abc"): ${Number("abc")}`);
console.log("0.1 + 0.2:", 0.1 + 0.2);
console.log("Rounded for display:", (0.1 + 0.2).toFixed(2));
