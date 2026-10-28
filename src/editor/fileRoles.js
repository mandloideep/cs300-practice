// What each file of a step's project is for, in one sentence, per docs/CONTRACTS.md section 8.2:
// well-known paths and patterns, the first match winning, with a sentence for a React and for a
// vanilla workspace where the two differ. A step's own `files` field replaces these for its paths,
// and a path that matches nothing gets FALLBACK_ROLE, so the line under the tree is never empty.

export const FALLBACK_ROLE = "A file of this step's project.";

export const DOWNLOAD_NOTE =
  "This file is not in CS300 Practice; it is in the project you download.";

const ROLES = [
  {
    match: "index.html",
    react: "The page the browser opens; React draws everything inside its root div.",
    vanilla:
      "The page the browser opens: its elements, the stylesheet it links, and the script it loads.",
  },
  {
    match: /^(src\/)?(styles|index|App)\.css$/,
    any: "The page's styles: colors, spacing, and layout for the elements.",
  },
  { match: /^src\/.+\.css$/, any: "Styles for one part of the page." },
  { match: "src/main.jsx", any: "Finds the root div in index.html and renders App into it." },
  { match: "src/App.jsx", any: "The top component: what appears inside the root div." },
  {
    match: /^src\/(components\/)?[A-Z][\w-]*\.jsx$/,
    any: "A component that App or another component imports and renders.",
  },
  {
    match: /^src\/(hooks\/)?use[A-Z][\w-]*\.jsx?$/,
    any: "A custom hook: state and effects that a component reuses by calling it.",
  },
  {
    match: "src/api.js",
    any: "The functions that talk to the API, so that components never build a request themselves.",
  },
  { match: /^src\/(data\/)?[\w-]+\.json$/, any: "Data the code imports, written as plain JSON." },
  {
    match: /^(src\/)?(main|app|script)\.js$/,
    vanilla: "The script index.html loads: it finds elements on the page and makes them respond.",
  },
  {
    match: /^src\/[\w-]+\.js$/,
    react: "Plain JavaScript the components import, such as data or helper functions.",
    vanilla: "A module the page's script imports.",
  },
  { match: "src", folder: true, any: "The source files you edit." },
  {
    match: "package.json",
    any: "The project's name, the commands npm run knows, and the packages it needs.",
  },
  { match: "package-lock.json", any: "The exact version npm chose for every package; commit it." },
  {
    match: "vite.config.js",
    any: 'Vite\'s settings: the React plugin, and base "./" so that the built site works at any address.',
  },
  { match: ".gitignore", any: "Tells Git to leave node_modules and dist out of every commit." },
  { match: ".env", any: "The API address the code reads as import.meta.env.API_BASE." },
  {
    match: "README.md",
    react: "How to run the project on your computer and deploy it to GitHub Pages.",
    vanilla: "How to open the page, serve the folder, and publish it on GitHub Pages.",
  },
  {
    match: ".github",
    folder: true,
    any: "Settings GitHub reads from the repository.",
  },
  {
    match: ".github/workflows",
    folder: true,
    any: "The workflows GitHub Actions runs.",
  },
  {
    match: ".github/workflows/deploy.yml",
    any: "The workflow that builds the site and publishes it to GitHub Pages on every push to main.",
  },
  {
    match: "node_modules",
    folder: true,
    any: "Every installed package; never edited, never committed.",
  },
  {
    match: "dist",
    folder: true,
    any: "The built site a host serves; rebuilt from src, never edited, never committed.",
  },
];

function matches(role, path) {
  return typeof role.match === "string" ? role.match === path : role.match.test(path);
}

// The sentence for `path`, or null when nothing names it. A folder is named only by a rule that
// says `folder`, and a file only by one that does not.
export function fileRole(path, { folder = false, vanilla = false } = {}) {
  for (const role of ROLES) {
    if (Boolean(role.folder) !== folder || !matches(role, path)) continue;
    const sentence = role.any ?? (vanilla ? role.vanilla : role.react);
    if (sentence) return sentence;
  }
  return null;
}
