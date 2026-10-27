const names = ["Alice", "Bob", "Charlie", "Diana"];

console.log("First:", names[0]);
console.log("Count:", names.length);

console.log("Last:", names[names.length - 1]);
console.log("Past the end:", names[names.length]);

for (let i = 0; i < names.length; i++) {
  console.log(`${i + 1}. ${names[i]}`);
}

for (const name of names) {
  console.log(`Hello, ${name}!`);
}

names.push("Eve");
console.log("Count now:", names.length);
console.log("Has Eve:", names.includes("Eve"));
