export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);

  return [
    {
      id: "section-line",
      title: "describeSection finds its own room and the file's course",
      pass: has("CS300 section 2 meets in Room 201."),
      hint: "Keep const room = \"Room 201\"; inside describeSection and call describeSection(2)."
    },
    {
      id: "seat-line",
      title: "The inner function finds a name at every level of the chain",
      pass: has("Seat 14: CS300, section 2, Room 201."),
      hint: has("Seat 14: CS300, section 2, Main hall.")
        ? "The seat line reached the file's room, so describeSection has no room of its own. Keep const room = \"Room 201\"; inside it."
        : "Declare describeSeat(seat) inside describeSection, before its closing brace, and call describeSeat(14) there."
    },
    {
      id: "top-level-room",
      title: "The file's own room is Main hall",
      pass: has("At the top level, room is Main hall"),
      hint: "Declare const room = \"Main hall\"; under const course and log it on the last line of the file."
    }
  ];
}
