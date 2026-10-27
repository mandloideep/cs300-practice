const course = {
  code: "CS101",
  title: "Introduction to Programming",
  instructor: { name: "Ana Rivera", office: { building: "Science", room: "204" } },
  ta: null
};

const students = [
  { name: "Alice", advisor: { name: "Lee" } },
  { name: "Bob" },
  { name: "Charlie", advisor: { name: "Patel" } }
];

console.log("Course:", course.code, course.title);
console.log("Instructor:", course.instructor.name);
