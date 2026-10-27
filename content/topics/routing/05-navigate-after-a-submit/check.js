export default async function check({ document, wait }) {
  const heading = () => document.querySelector("main h1")?.textContent.trim() ?? "";
  const navLink = (path) => document.querySelector(`nav a[href="${path}"]`);
  const title = `Kiwi ${Date.now() % 1000}`;

  navLink("/products/new")?.click();
  await wait(100);
  const form = document.querySelector("form");
  const formShown = heading() === "Add a product" && Boolean(form);
  if (form) {
    form.elements.title.value = title;
    form.elements.price.value = "2.49";
    form.requestSubmit();
    await wait(150);
  }
  const afterHeading = heading();
  const afterPrice = document.querySelector("main .product-price")?.textContent.trim() ?? "";

  navLink("/products")?.click();
  await wait(100);
  const titles = [...document.querySelectorAll(".product-list .product-title")].map((link) => link.textContent.trim());
  navLink("/")?.click();
  await wait(100);

  return [
    {
      id: "submit-navigates-to-the-new-product",
      title: "Submitting the form opens the new product's page",
      pass: formShown && afterHeading === title && afterPrice === "$2.49",
      hint: !formShown
        ? "The Add a product link did not open the form page."
        : afterHeading === "Add a product"
          ? "After the submit the page is still the form. Call useNavigate at the top of NewProductPage and navigate to /products/ followed by the product's id in handleSubmit."
          : `After the submit the page shows "${afterHeading}". navigate should receive the path of the product that was just added.`
    },
    {
      id: "new-product-in-the-list",
      title: "The added product appears at the end of the products list",
      pass: titles.at(-1) === title,
      hint: `The products list ends with "${titles.at(-1) ?? "nothing"}". handleSubmit should still call onAdd(product) before navigating.`
    }
  ];
}
