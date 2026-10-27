export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const stopped = "If the console pane shows a red line at the top, the script stopped there; fix that line first.";

  return [
    {
      id: "course-and-count",
      title: "The course title and the number enrolled print",
      pass: has("Course: Web Development") && has("Enrolled: 3"),
      hint: has("Course: Web Development")
        ? `The Enrolled line is missing. ${stopped} couse is not defined means the name is misspelled.`
        : "Nothing printed, so the file may not compile; check that line 12 ends with course.title);"
    },
    {
      id: "seats-left",
      title: "The seats left print as 27",
      pass: has("Seats left: 27"),
      hint: `${stopped} length is a property, not a method, so it takes no parentheses.`
    },
    {
      id: "first-student",
      title: "The first student prints in capitals",
      pass: has("First student: ALICE"),
      hint: `${stopped} reading '0' means the value before [0] is undefined; the key is students, with an s.`
    },
    {
      id: "waitlist",
      title: "The waitlist prints as 2",
      pass: has("Waitlist: 2"),
      hint: `${stopped} Assignment to constant variable means waitlist must be declared with let.`
    }
  ];
}
