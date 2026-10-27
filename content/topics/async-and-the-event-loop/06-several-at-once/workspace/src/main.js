function load(value, ms) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function fail(message, ms) {
  return new Promise((resolve, reject) => setTimeout(() => reject(new Error(message)), ms));
}

async function oneByOne() {
  const started = Date.now();
  const courses = await load("3 courses", 200);
  const schedule = await load("2 classes today", 150);
  const news = await load("1 announcement", 100);
  console.log("One by one:", Date.now() - started, "ms", [courses, schedule, news]);
}

async function main() {
  await oneByOne();
}

main();
