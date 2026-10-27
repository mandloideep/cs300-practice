function puzzleOne() {
  setTimeout(() => console.log("1 timer"), 0);
  Promise.resolve().then(() => console.log("1 microtask"));
  console.log("1 sync");
}

function puzzleTwo() {
  setTimeout(() => console.log("2 timer"), 0);
  Promise.resolve()
    .then(() => console.log("2 first then"))
    .then(() => console.log("2 second then"));
  queueMicrotask(() => console.log("2 queueMicrotask"));
  console.log("2 sync");
}

function puzzleThree() {
  setTimeout(() => {
    console.log("3 first timer");
    Promise.resolve().then(() => console.log("3 microtask from the timer"));
  }, 0);
  setTimeout(() => console.log("3 second timer"), 0);
  Promise.resolve().then(() => {
    console.log("3 microtask");
    setTimeout(() => console.log("3 timer from the microtask"), 0);
  });
}

async function checkIn() {
  console.log("4 before await");
  await Promise.resolve();
  console.log("4 after await");
}

function puzzleFour() {
  setTimeout(() => console.log("4 timer"), 0);
  checkIn();
  console.log("4 sync after the call");
}

puzzleOne();
setTimeout(puzzleTwo, 100);
setTimeout(puzzleThree, 200);
setTimeout(puzzleFour, 300);
