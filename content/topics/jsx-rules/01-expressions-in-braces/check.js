export default async function check({ document }) {
  const main = document.querySelector("main");
  const paragraphs = main ? [...main.querySelectorAll("p")].map((p) => p.textContent.trim()) : [];
  const text = main ? main.textContent : "";

  return [
    {
      id: "count-from-data",
      title: "The count sentence comes from course and topics",
      pass: paragraphs.includes("CS300 renders 2 concepts from data."),
      hint: "Replace the hard-coded paragraph with <p>{course} renders {topics.length} concepts from data.</p> and add the topics array under course."
    },
    {
      id: "joined-list",
      title: "The week sentence joins both concept names",
      pass: paragraphs.includes("Week 10 covers JSX expressions and Root rendering."),
      hint: "Add <p>Week {9 + 1} covers {topics.join(\" and \")}.</p> and check the spelling of both names in the topics array."
    },
    {
      id: "no-names-as-text",
      title: "Variable names do not show as text",
      pass: !/\b(course|topics)\b/.test(text),
      hint: "The page shows a variable name instead of its value. Wrap each expression in braces, as in {course} and {topics.length}."
    }
  ];
}
