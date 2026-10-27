const queue = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

console.log("queue:", queue);

const firstThree = queue.slice(0, 3);
console.log("First three:", firstThree);
console.log("Last two:", queue.slice(-2));
console.log("queue after slice:", queue);

const helped = queue.splice(1, 2);
console.log("Helped:", helped);
console.log("queue after splice:", queue);

queue.splice(1, 0, "Frank");
console.log("Frank joins:", queue);

const afterAlice = queue.toSpliced(0, 1);
console.log("Next up:", afterAlice);
console.log("queue unchanged:", queue);
