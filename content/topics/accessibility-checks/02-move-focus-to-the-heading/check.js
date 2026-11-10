export default async function check({ document, wait }) {
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const heading = () => document.querySelector("main h1");
  const focusedHeading = () => {
    const active = document.activeElement;
    return active && active === heading() ? active.textContent.trim() : null;
  };

  navLink("/products")?.click();
  await wait(150);
  const onProducts = focusedHeading();
  const productsTabIndex = heading()?.getAttribute("tabindex");

  document.querySelector('main a[href^="/products/"]')?.click();
  await wait(150);
  const onProduct = focusedHeading();
  const productHeading = heading()?.textContent.trim() ?? "";

  navLink("/products")?.click();
  await wait(150);
  const search = document.querySelector('main input[type="search"]');
  let typingKept = false;
  if (search) {
    search.focus();
    const setValue = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(search), "value").set;
    setValue.call(search, "red");
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(100);
    typingKept = document.activeElement === search;
    setValue.call(search, "");
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(50);
  }

  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "focus-moves-to-the-heading",
      title: "After a route change, focus is on the new page's h1",
      pass: onProducts === "Products" && onProduct !== null && onProduct === productHeading,
      hint:
        onProducts === null
          ? "After pressing Products, the focus is not on the Products heading. Render <RouteFocus /> inside <BrowserRouter>, and give every h1 tabIndex={-1} so that it can take focus."
          : "Focus moved on the Products page but not on the product page. Give the product page's h1 tabIndex={-1} as well."
    },
    {
      id: "heading-is-not-a-tab-stop",
      title: "The headings take focus from code but are not in the Tab order",
      pass: productsTabIndex === "-1",
      hint:
        productsTabIndex === null
          ? "The Products h1 has no tabIndex, so focus() cannot reach it. Add tabIndex={-1}."
          : `The Products h1 has tabIndex ${productsTabIndex}. Use -1, so code can focus it and Tab skips it.`
    },
    {
      id: "typing-keeps-focus",
      title: "Typing in the search box leaves the focus in the box",
      pass: Boolean(search) && typingKept,
      hint: !search
        ? "The Products page has no search box. Keep the labeled search input from Step 1."
        : "Typing moved the focus out of the search box. Key the effect on pathname, so that only a change of page moves the focus."
    }
  ];
}
