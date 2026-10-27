export default async function check({ document }) {
  const lang = document.documentElement.getAttribute("lang");
  const charset = document.querySelector("meta[charset]");
  const viewport = document.querySelector('meta[name="viewport"]');
  const heading = document.querySelector("body h1");
  const paragraph = document.querySelector("body p");

  return [
    {
      id: "lang-on-html",
      title: "The root element says the page is in English",
      pass: lang === "en",
      hint: `The html element has ${lang ? `lang="${lang}"` : "no lang attribute"}. Write <html lang="en"> on the second line.`
    },
    {
      id: "head-describes-the-page",
      title: "The head has the title and both meta lines",
      pass: document.title === "CS300 Study Group" && Boolean(charset) && Boolean(viewport),
      hint:
        document.title !== "CS300 Study Group"
          ? `The title reads "${document.title}". Put <title>CS300 Study Group</title> inside <head>.`
          : "One of the two <meta> lines is missing from <head>: charset and viewport."
    },
    {
      id: "body-has-a-heading",
      title: "The body has a main heading and a paragraph",
      pass: heading?.textContent.trim() === "CS300 Study Group" && Boolean(paragraph),
      hint: "Replace the bare text in <body> with an <h1> and a <p>."
    }
  ];
}
