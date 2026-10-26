const expectedCards = { all: 6, beauty: 2, fragrances: 2, groceries: 2 };

export default async function check({ document, inspector }) {
  const byName = (name) => inspector.components.find((component) => component.name === name);
  const app = byName("App");
  const filter = byName("CategoryFilter");
  const list = byName("ProductList");
  const category = app?.state[0]?.value;
  const pressed = [...document.querySelectorAll(".filter button")].find((button) => button.getAttribute("aria-pressed") === "true")?.textContent.trim().toLowerCase() ?? null;
  const cards = document.querySelectorAll(".product").length;

  return [
    {
      id: "state-lives-in-app",
      title: "App owns the category and CategoryFilter has no state of its own",
      pass: app?.state.length === 1 && typeof category === "string" && filter?.state.length === 0,
      hint: `The inspector sees ${app?.state.length ?? 0} state value(s) on App and ${filter?.state.length ?? 0} on CategoryFilter. Delete the useState line in CategoryFilter and add it at the top of App.`
    },
    {
      id: "both-children-receive-it",
      title: "CategoryFilter and ProductList receive category as a prop",
      pass: typeof category === "string" && filter?.props.category === category && list?.props.category === category,
      hint: `CategoryFilter receives ${JSON.stringify(filter?.props.category)} and ProductList receives ${JSON.stringify(list?.props.category)}. Pass category={category} to both tags in App.`
    },
    {
      id: "page-agrees-with-app",
      title: "The pressed button and the list both follow the value in App",
      pass: typeof category === "string" && pressed === category && cards === expectedCards[category],
      hint: `App holds ${JSON.stringify(category)}, the pressed button is ${pressed ?? "none"}, and the list shows ${cards} products. CategoryFilter should compare its category prop with option.id, and ProductList should filter items by its category prop.`
    }
  ];
}
