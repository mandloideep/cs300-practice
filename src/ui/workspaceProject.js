import { strToU8, zipSync } from "fflate";
import { dependencies, devDependencies } from "../../package.json";

// Builds the plain Vite project a student downloads from an edit step, laid out as in
// docs/CONTRACTS.md section 5.2: npm React at the runtime's pinned versions, never the vendored
// runtime, the wrappers, the checks, the fixtures, or the solution.

const ROUTER_IMPORT = /(?:from\s*|import\s*\(\s*|import\s+)["']react-router["']/;

export function workspaceProjectName(topicId, n) {
  return `${topicId}-${n}`;
}

function usesRouter(files) {
  return Object.entries(files).some(
    ([path, source]) => /\.(jsx?|mjs)$/.test(path) && ROUTER_IMPORT.test(source),
  );
}

function packageJson(name, files) {
  const packageDependencies = { react: dependencies.react, "react-dom": dependencies["react-dom"] };
  if (usesRouter(files)) packageDependencies["react-router"] = dependencies["react-router"];
  return JSON.stringify(
    {
      name,
      private: true,
      type: "module",
      scripts: { dev: "vite", build: "vite build", preview: "vite preview" },
      dependencies: packageDependencies,
      devDependencies: {
        "@vitejs/plugin-react": devDependencies["@vitejs/plugin-react"],
        vite: devDependencies.vite,
      },
    },
    null,
    2,
  );
}

const VITE_CONFIG = `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({ plugins: [react()] });
`;

function minimalIndexHtml(title, entry) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/${entry}"></script>
  </body>
</html>
`;
}

function readme(topic, step) {
  return `# ${topic.title}: step ${step.n}, ${step.title}

This folder is your workspace from CS300 Lab, as a Vite project you can run on your own computer.
It uses React from npm, the same version the lab runs in the browser.

Open a terminal in this folder and run these three commands.

\`\`\`sh
npm install
npm run dev
npm run build
\`\`\`

\`npm run dev\` prints a local address to open in your browser.
\`npm run build\` writes a production build into \`dist/\`.
`;
}

// Returns { path: source } for the project, with the workspace files at their own paths.
export function workspaceProjectFiles({ topic, step, files }) {
  const name = workspaceProjectName(topic.id, step.n);
  const project = {
    "package.json": `${packageJson(name, files)}\n`,
    "vite.config.js": VITE_CONFIG,
    "README.md": readme(topic, step),
  };
  if (!("index.html" in files)) {
    project["index.html"] = minimalIndexHtml(`${topic.title}: ${step.title}`, step.entry);
  }
  return { ...project, ...files };
}

export function zipFiles(files, folder) {
  const entries = Object.fromEntries(
    Object.entries(files).map(([path, source]) => [`${folder}/${path}`, strToU8(source)]),
  );
  return zipSync(entries);
}

export function saveZip(bytes, fileName) {
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
