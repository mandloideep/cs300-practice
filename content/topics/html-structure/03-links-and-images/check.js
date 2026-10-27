export default async function check({ document }) {
  const external = [...document.querySelectorAll("body a[href]")].find((link) =>
    link.getAttribute("href").startsWith("https://")
  );
  const image = document.querySelector("body img");
  const alt = image?.getAttribute("alt")?.trim() ?? "";
  const jump = document.querySelector('body a[href="#meetings"]');
  const target = document.getElementById("meetings");

  return [
    {
      id: "external-link",
      title: "A link to another site with readable text",
      pass: Boolean(external) && external.textContent.trim().length > 0,
      hint: external
        ? "The link has no text between <a> and </a>; the address belongs in href and the words belong between the tags."
        : "Add an <a> whose href starts with https:// inside a paragraph."
    },
    {
      id: "image-with-alt",
      title: "An image with a src and a meaningful alt",
      pass: Boolean(image?.getAttribute("src")) && alt.length > 10 && !/^image$/i.test(alt),
      hint: image
        ? `The image's alt is "${alt}". Describe what the picture shows in a short phrase.`
        : "Add an <img> under the h1 with both src and alt."
    },
    {
      id: "page-anchor",
      title: "A jump link that points at the meetings heading",
      pass: Boolean(jump) && target?.tagName === "H2",
      hint: target
        ? 'Add <a href="#meetings">Jump to the meeting times</a> inside a paragraph under the image.'
        : 'Give the meetings heading id="meetings"; the link can only jump to an element with that id.'
    }
  ];
}
