const rawEmail = "  Alice.Mandel@NEIU.edu  ";

console.log("Raw:", rawEmail);
console.log("Length:", rawEmail.length);

console.log("Trimmed:", rawEmail.trim());
console.log("Lowercase:", rawEmail.toLowerCase());
console.log("Still raw:", rawEmail);

const email = rawEmail.trim().toLowerCase();
console.log("Clean:", email);
console.log("Clean length:", email.length);

console.log("Is an NEIU address:", email.includes("@neiu.edu"));
console.log("Position of @:", email.indexOf("@"));
console.log("First name:", email.slice(0, email.indexOf(".")));
