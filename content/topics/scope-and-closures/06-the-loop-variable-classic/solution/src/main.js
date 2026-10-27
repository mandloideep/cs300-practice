const roster = ["Alice", "Bob", "Charlie"];

for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log("var i is", i);
  }, 50);
}

for (let j = 0; j < 3; j++) {
  setTimeout(() => {
    console.log("let j is", j);
  }, 100);
}

for (let index = 0; index < roster.length; index++) {
  setTimeout(() => {
    console.log(`Reminder ${index + 1} goes to ${roster[index]}.`);
  }, 150);
}
