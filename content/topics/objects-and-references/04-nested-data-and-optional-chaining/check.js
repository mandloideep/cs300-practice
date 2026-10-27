export default async function check({ console }) {
  const lines = console.filter((entry) => entry.level === "log").map((entry) => entry.text);
  const has = (text) => lines.includes(text);
  const advisorLines = lines.filter((line) => line.includes("'s advisor: "));

  return [
    {
      id: "deep-path-reads",
      title: "A path three levels deep reads the instructor's room",
      pass: has("Room: 204"),
      hint: "Log course.instructor.office.room with the label \"Room:\"."
    },
    {
      id: "chain-stops-and-falls-back",
      title: "?. stops at the missing TA and ?? supplies the fallback",
      pass: has("TA: no TA this term"),
      hint: "The TA line should read course.ta?.name ?? \"no TA this term\", with ?. right after ta."
    },
    {
      id: "each-student-gets-a-line",
      title: "Every student gets an advisor line, and Bob gets the fallback",
      pass:
        advisorLines.length === 3 &&
        has("Alice's advisor: Lee") &&
        has("Bob's advisor: not assigned") &&
        has("Charlie's advisor: Patel"),
      hint: `${advisorLines.length} advisor line(s) found. Inside forEach, log student.advisor?.name ?? "not assigned" in the template literal.`
    },
    {
      id: "nullish-keeps-zero",
      title: "|| replaces a score of 0 and ?? keeps it",
      pass: has("with ||: 5") && has("with ??: 0"),
      hint: "Set extraCredit to 0, then log extraCredit || 5 and extraCredit ?? 5 with their labels."
    }
  ];
}
