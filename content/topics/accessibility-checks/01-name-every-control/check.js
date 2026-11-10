export default async function check({ document, wait }) {
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const labelText = (control) =>
    [...(control?.labels ?? [])].map((label) => label.textContent.trim()).join(" ");

  navLink("/products")?.click();
  await wait(150);
  const search = document.querySelector('main input[type="search"]');
  const select = document.querySelector("main select");
  const searchLabel = labelText(search);
  const selectLabel = labelText(select);

  let labelMovesFocus = false;
  const label = search?.labels?.[0];
  if (label) {
    search.blur();
    label.click();
    labelMovesFocus = document.activeElement === search;
    search.blur();
  }

  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "search-has-a-label",
      title: "The search box has a visible label",
      pass: searchLabel.length > 0,
      hint: !search
        ? "There is no search box on the Products page. Keep the input with type=\"search\" inside the field."
        : "The search box has no label. Put <label htmlFor=\"search\">Search</label> before it and give the input id=\"search\"."
    },
    {
      id: "category-has-a-label",
      title: "The category menu has a visible label",
      pass: selectLabel.length > 0,
      hint: !select
        ? "There is no select on the Products page. Keep the category select inside its field."
        : "The category select has no label. Put <label htmlFor=\"category\">Category</label> before it and give the select id=\"category\"."
    },
    {
      id: "label-moves-focus",
      title: "Clicking the Search label moves focus into the box",
      pass: labelMovesFocus,
      hint: !label
        ? "Label the search box first."
        : "Clicking the label did not focus the box. The label's htmlFor must equal the input's id, letter for letter."
    }
  ];
}
