const course = {
  code: "CS300",
  title: "Web Development",
  students: ["Alice", "Bob", "Charlie"]
};
const maxSeats = 30;

function seatsLeft(enrolled) {
  return maxSeats - enrolled;
}

console.log("Course:", course.title);
console.log("Enrolled:", couse.students.length);
console.log("Seats left:", seatsLeft(course.students.length()));

const first = course.student[0];
console.log("First student:", first.toUpperCase());

const waitlist = 0;
waitlist = waitlist + 2;
console.log("Waitlist:", waitlist);
