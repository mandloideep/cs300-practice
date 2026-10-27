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

console.log("Room:", course.instructor.office.room);

console.log("TA:", course.ta?.name ?? "no TA this term");

students.forEach((student) => {
  console.log(`${student.name}'s advisor: ${student.advisor?.name ?? "not assigned"}`);
});

const extraCredit = 0;
console.log("with ||:", extraCredit || 5);
console.log("with ??:", extraCredit ?? 5);
