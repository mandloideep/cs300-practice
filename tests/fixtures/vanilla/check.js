export default async function check({ document, console, wait }) {
  const list = document.querySelector("#books");
  const items = list ? [...list.querySelectorAll("li")] : [];
  const listStyle = list ? getComputedStyle(list).listStyleType : null;
  const firstBorder = items[0] ? getComputedStyle(items[0]).borderTopWidth : null;
  const before = items.length;
  document.querySelector("#add")?.click();
  await wait(50);
  const after = list ? list.querySelectorAll("li").length : 0;

  return [
    {
      id: "three-books",
      title: "Three books are listed from the markup",
      pass: before === 3 && items.every((item) => item.classList.contains("book")),
      hint: "Add a third li with the class book inside the ul with the id books.",
    },
    {
      id: "list-styled",
      title: "The stylesheet reaches the list",
      pass: listStyle === "none" && firstBorder === "1px",
      hint: "index.html should link styles.css, which removes the bullets and draws a border around each book.",
    },
    {
      id: "button-adds",
      title: "The button adds a book",
      pass: after === before + 1,
      hint: "The click handler on the Add a book button should append one li to the list.",
    },
    {
      id: "ready-logged",
      title: "The script logs that it is ready",
      pass: console.some((entry) => entry.level === "log" && entry.text === "reading list ready"),
      hint: 'main.js ends with console.log("reading list ready").',
    },
  ];
}
