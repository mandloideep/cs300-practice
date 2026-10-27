export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const call = (tag) => new RegExp(`jsx(?:DEV)?\\(\\s*['"]${tag}['"]`);
  const badge = lines.find((line) => line.startsWith("function Badge"));
  const list = lines.find((line) => line.startsWith("function CourseList"));

  return [
    {
      id: "badge-compiled",
      title: "The printed Badge function calls a function for its p element",
      pass: badge !== undefined && call("p").test(badge) && !badge.includes("<p"),
      hint: "Keep console.log(String(Badge)) from the starter; it prints the function as the transformer rewrote it."
    },
    {
      id: "list-compiled",
      title: "The printed CourseList has one call for the ul and one inside map for each li",
      pass: list !== undefined && call("ul").test(list) && call("li").test(list) && list.includes("courses.map("),
      hint: "Declare CourseList, which returns a ul with courses.map((course) => <li key={course}>{course}</li>), and log String(CourseList)."
    },
    {
      id: "element-is-an-object",
      title: "Calling Badge returns an object with a type and props",
      pass: has("type: p") && has('props: {"className":"badge","children":["Now studying ","CS300"]}'),
      hint: 'Call Badge({ course: "CS300" }), keep the result in badge, and log badge.type and badge.props.'
    }
  ];
}
