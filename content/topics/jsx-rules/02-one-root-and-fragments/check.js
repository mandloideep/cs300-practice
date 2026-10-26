export default async function check({ document, inspector }) {
  const list = document.querySelector("dl");
  const children = list ? [...list.children].map((child) => child.tagName.toLowerCase()) : [];

  return [
    {
      id: "terms-in-the-list",
      title: "The terms and definitions are direct children of the dl",
      pass: children.join(",") === "dt,dd,dt,dd",
      hint: "The dl should hold dt, dd, dt, dd with nothing between. Replace <div> and </div> in RootFacts with <> and </>."
    },
    {
      id: "root-facts-component",
      title: "The inspector shows the RootFacts component",
      pass: inspector.components.some((component) => component.name === "RootFacts"),
      hint: "Keep the RootFacts function and the <RootFacts /> line inside the dl in App."
    }
  ];
}
