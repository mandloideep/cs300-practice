const scores = [72, 96, 88];

console.log("Hello from JavaScript");
console.log("Largest score:", Math.max(...scores));

console.log("typeof window:", typeof window);
console.log("typeof document:", typeof document);

console.log("typeof process:", typeof process);

const where = typeof window === "undefined" ? "Node" : "a browser";
console.log(`This file is running in ${where}.`);
