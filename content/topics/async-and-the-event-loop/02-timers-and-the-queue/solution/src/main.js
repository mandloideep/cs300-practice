const start = Date.now();

function stamp(label) {
  console.log(`${label} after ${Date.now() - start} ms`);
}

stamp("Study timer started");

const breakTimer = setTimeout(() => stamp("Break over"), 300);
setTimeout(() => stamp("Reading done"), 100);
setTimeout(() => stamp("Flashcards done"), 200);
stamp("Timers set");

const busyUntil = Date.now() + 250;
while (Date.now() < busyUntil) {}
stamp("Long calculation finished");

clearTimeout(breakTimer);
stamp("Break skipped");
