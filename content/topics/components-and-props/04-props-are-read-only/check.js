const titles = ["Programming II", "Client-Side Web Development", "Database Systems", "Web Accessibility Workshop"];

export default async function check({ document, console, inspector }) {
  const headings = [...document.querySelectorAll("article.card h2")].map((heading) => heading.textContent.trim());
  const readOnlyMessages = console.filter((entry) => /read[- ]?only|An error occurred in the <CourseCard>/i.test(entry.text));
  return [
    {
      id: "cards-render",
      title: "The four cards render again",
      pass: headings.length === 4 && inspector.components.filter((component) => component.name === "CourseCard").length === 4,
      hint: "The result is empty because CourseCard threw an error while rendering. Read the console, then stop assigning to props.title."
    },
    {
      id: "no-read-only-error",
      title: "No read-only error in the console",
      pass: readOnlyMessages.length === 0,
      hint: `The console reports: ${(readOnlyMessages[0]?.text.split("\n")[0] ?? "a read-only error").replace(/\.$/, "")}. React freezes the props object, so props.title = ... fails. Store the changed value in a new variable instead.`
    },
    {
      id: "headings-uppercase",
      title: "Card headings are shown in capitals",
      pass: headings.join("|") === titles.map((title) => title.toUpperCase()).join("|"),
      hint: "Compute const heading = title.toUpperCase(); inside CourseCard and render {heading} in the h2."
    }
  ];
}
