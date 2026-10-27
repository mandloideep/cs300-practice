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

async function together() {
  const started = Date.now();
  const results = await Promise.all([
    load("3 courses", 200),
    load("2 classes today", 150),
    load("1 announcement", 100)
  ]);
  console.log("Together:", Date.now() - started, "ms", results);
}

async function oneFails() {
  try {
    const results = await Promise.all([load("3 courses", 200), fail("News is down", 100)]);
    console.log("All:", results);
  } catch (error) {
    console.warn("Promise.all rejected:", error.message);
  }
}

async function settleEach() {
  const results = await Promise.allSettled([load("3 courses", 200), fail("News is down", 100)]);
  for (const result of results) {
    if (result.status === "fulfilled") {
      console.log("fulfilled:", result.value);
    } else {
      console.log("rejected:", result.reason.message);
    }
  }
}

async function main() {
  await oneByOne();
  await together();
  await oneFails();
  await settleEach();
}

main();
