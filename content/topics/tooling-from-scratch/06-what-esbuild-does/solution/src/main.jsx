const courses = ["CS200", "CS300", "CS315"];

function Badge({ course }) {
  return <p className="badge">Now studying {course}</p>;
}

function CourseList() {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course}>{course}</li>
      ))}
    </ul>
  );
}

console.log(String(Badge));
console.log(String(CourseList));

const badge = Badge({ course: "CS300" });
console.log("type:", badge.type);
console.log("props:", badge.props);
