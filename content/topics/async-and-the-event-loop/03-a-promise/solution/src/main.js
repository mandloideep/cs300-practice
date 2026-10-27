const catalog = ["CS200", "CS300", "CS315"];

console.log("Catalog has", catalog.length, "courses");

function loadCourses() {
  return new Promise((resolve) => {
    console.log("Request sent");
    setTimeout(() => resolve(catalog), 150);
  });
}

const request = loadCourses();
console.log("Right away:", request);

request.then((courses) => {
  console.log("Loaded:", courses);
});
console.log("Waiting for the course list...");

setTimeout(() => {
  request.then((courses) => {
    console.log("Still there later:", courses.length, "courses");
  });
}, 300);
