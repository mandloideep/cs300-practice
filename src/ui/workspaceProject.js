import { strToU8, zipSync } from "fflate";
import { dependencies, devDependencies } from "../../package.json";
import { isReactWorkspace } from "../runner/useRunSession.js";
import { FALLBACK_ROLE, fileRole } from "../editor/fileRoles.js";
import deployWorkflow from "./deploy-workflow.yml?raw";

// The project a student downloads from an edit step, per docs/CONTRACTS.md sections 5.2, 8.2,
// and 8.5. projectLayout lists every entry of it, the editor's file tree draws that list, and
// workspaceProjectFiles writes exactly the files it lists, so the tree and the zip cannot differ.
// A React workspace becomes a plain Vite project with npm React at the runtime's pinned versions,
// base "./", a .gitignore, and the GitHub Pages workflow; a vanilla workspace (entry index.html,
// no React import) is its files and a README. Never the vendored runtime, the wrappers, the
// checks, the fixtures, or the solution.

const ROUTER_IMPORT = /(?:from\s*|import\s*\(\s*|import\s+)["']react-router["']/;
const API_BASE_READ = /import\.meta\.env\.API_BASE\b/;

export function workspaceProjectName(topicId, n) {
  return `${topicId}-${n}`;
}

export function isVanillaWorkspace(step, files) {
  return step.entry === "index.html" && !isReactWorkspace(files);
}

function readsModules(files, pattern) {
  return Object.entries(files).some(
    ([path, source]) => /\.(jsx?|mjs)$/.test(path) && pattern.test(source),
  );
}

function usesRouter(files) {
  return readsModules(files, ROUTER_IMPORT);
}

function writesEnv(files, api) {
  return Boolean(api) && readsModules(files, API_BASE_READ);
}

// The entries only the download has, before the tree orders them: { path, kind, createdBy }.
// One whose path the workspace already uses is left out, since the workspace's own file wins.
function downloadItems(step, files, api) {
  const items = isVanillaWorkspace(step, files)
    ? [{ path: "README.md", kind: "file", createdBy: null }]
    : [
        { path: "package.json", kind: "file", createdBy: null },
        { path: "package-lock.json", kind: "file", createdBy: "npm install" },
        { path: "vite.config.js", kind: "file", createdBy: null },
        { path: ".gitignore", kind: "file", createdBy: null },
        { path: ".github/workflows/deploy.yml", kind: "file", createdBy: null },
        { path: "README.md", kind: "file", createdBy: null },
        ...(writesEnv(files, api) ? [{ path: ".env", kind: "file", createdBy: null }] : []),
        ...("index.html" in files ? [] : [{ path: "index.html", kind: "file", createdBy: null }]),
        { path: "node_modules", kind: "folder", createdBy: "npm install" },
        { path: "dist", kind: "folder", createdBy: "npm run build" },
      ];
  const taken = Object.keys(files);
  return items.filter(
    ({ path }) => !taken.some((used) => used === path || used.startsWith(`${path}/`)),
  );
}

const byName = (a, b) => a.localeCompare(b, "en", { sensitivity: "base", numeric: true });

// Orders { path, kind, createdBy } items as a tree: at each level folders first, then files, each
// by name, with the folders their paths imply added. Returns { path, name, depth, kind, createdBy }.
function treeOrder(items) {
  const root = { children: new Map() };
  for (const item of items) {
    const parts = item.path.split("/");
    let node = root;
    parts.forEach((name, index) => {
      const path = parts.slice(0, index + 1).join("/");
      const last = index === parts.length - 1;
      if (!node.children.has(name)) {
        node.children.set(name, {
          path,
          name,
          kind: last ? item.kind : "folder",
          createdBy: last ? item.createdBy : null,
          children: new Map(),
        });
      }
      node = node.children.get(name);
    });
  }
  const entries = [];
  const visit = (node, depth) => {
    const children = [...node.children.values()].sort((a, b) =>
      a.kind === b.kind ? byName(a.name, b.name) : a.kind === "folder" ? -1 : 1,
    );
    for (const child of children) {
      entries.push({
        path: child.path,
        name: child.name,
        depth,
        kind: child.kind,
        createdBy: child.createdBy,
      });
      visit(child, depth + 1);
    }
  };
  visit(root, 0);
  return entries;
}

// Every entry of the project the step's download writes, in tree order, as docs/CONTRACTS.md
// section 8.2 pins: the workspace's files and folders, then the entries only the download has.
// `api` is the one workspaceProjectFiles receives.
export function projectLayout(step, files, api = null) {
  const vanilla = isVanillaWorkspace(step, files);
  const notes = step.fileNotes ?? {};
  const describe = (entry) => {
    const folder = entry.kind === "folder";
    const note = folder ? null : notes[entry.path];
    return note ?? fileRole(entry.path, { folder, vanilla }) ?? (folder ? null : FALLBACK_ROLE);
  };
  const workspace = treeOrder(
    Object.keys(files).map((path) => ({ path, kind: "file", createdBy: null })),
  ).map((entry) => ({ ...entry, source: "workspace" }));
  const download = treeOrder(downloadItems(step, files, api)).map((entry) => ({
    ...entry,
    source: "download",
  }));
  return [...workspace, ...download].map(({ path, name, depth, kind, source, createdBy }) => ({
    path,
    name,
    depth,
    kind,
    source,
    description: describe({ path, kind }),
    createdBy,
  }));
}

// The entries of a layout that the zip writes: every file nothing on the student's computer
// creates. package-lock.json, node_modules, and dist are listed and never written.
export function writtenEntries(layout) {
  return layout.filter((entry) => entry.kind === "file" && entry.createdBy === null);
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

function viteConfig(withApiBase) {
  const options = withApiBase
    ? `{ base: "./", plugins: [react()], envPrefix: ["VITE_", "API_"] }`
    : `{ base: "./", plugins: [react()] }`;
  return `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(${options});
`;
}

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

function deploySection({ router, env }) {
  const routerNote = router
    ? `
This project uses React Router, and a refresh on a \`BrowserRouter\` route at GitHub Pages asks the host for a file that does not exist, so it returns 404.
Use \`HashRouter\` in place of \`BrowserRouter\`, which keeps the route after a \`#\` that the host never sees.
Or keep \`BrowserRouter\` and add a \`404.html\` that copies \`index.html\`: add \`- run: cp dist/index.html dist/404.html\` after the build in the workflow, set \`base\` in \`vite.config.js\` to \`"/<repo>/"\`, and give the router \`basename="/<repo>"\`, because the relative \`"./"\` base cannot find the assets from a nested route.
`
    : "";
  return `## Deploy to GitHub Pages

\`.github/workflows/deploy.yml\` builds this project and publishes \`dist/\` to GitHub Pages on every push to \`main\`.

1. \`base: "./"\` in \`vite.config.js\`, so that the built page finds its assets at any address; this project already has it.
2. The Pages source in the repository's Settings, under Pages: choose "GitHub Actions".
3. \`HashRouter\` in place of \`BrowserRouter\`, or a \`404.html\` that copies \`index.html\`, in a project that uses React Router.
4. \`.gitignore\` with \`node_modules\` and \`dist\`, which this project already has, so that the built files are never committed.
5. Nothing secret in the project, since every file of a public repository and every built file is public${env ? "; the `.env` file holds only a public API address" : ""}.

Push the project to a new repository on GitHub, set the Pages source, and watch the run under the Actions tab.
When it is green, the site is at \`https://<user>.github.io/<repo>/\`.
${routerNote}`;
}

function readme(topic, step, { api, router }) {
  const apiNote = api
    ? `
The code reads the API address from \`import.meta.env.API_BASE\`, which comes from the \`.env\` file in this folder.
${
  api.fromFixtures
    ? `In CS300 Practice you were using Fixtures, which exist only inside the site, so \`.env\` points at ${api.title} instead; change it to any API you like.`
    : `It holds the API you had selected in CS300 Practice, ${api.title}; change it to any API you like.`
}
`
    : "";
  return `# ${topic.title}: step ${step.n}, ${step.title}

This folder is your workspace from CS300 Practice, as a Vite project you can run on your own computer.
It uses React from npm, the same version CS300 Practice runs in the browser.

Open a terminal in this folder and run these three commands.

\`\`\`sh
npm install
npm run dev
npm run build
\`\`\`

\`npm run dev\` prints a local address to open in your browser.
\`npm run build\` writes a production build into \`dist/\`.
${apiNote}
${deploySection({ router, env: Boolean(api) })}`;
}

function vanillaReadme(topic, step) {
  return `# ${topic.title}: step ${step.n}, ${step.title}

This folder is your workspace from CS300 Practice: plain HTML, CSS, and JavaScript, with nothing to install.

Open \`index.html\` in your browser to see the page.
To run it from a local address instead, which is what a browser needs for \`fetch\` and modules, serve the folder from a terminal opened in it and open the address it prints.

\`\`\`sh
npx serve .
\`\`\`

To publish it, push the folder to a repository on GitHub and set the Pages source in the repository's Settings, under Pages, to "Deploy from a branch" with \`main\` and \`/ (root)\`; the page is then at \`https://<user>.github.io/<repo>/\`.
`;
}

// The source of every download file nothing on the student's computer creates.
function downloadSources({ topic, step, files, api }) {
  if (isVanillaWorkspace(step, files)) return { "README.md": vanillaReadme(topic, step) };
  const withApiBase = writesEnv(files, api);
  return {
    "package.json": `${packageJson(workspaceProjectName(topic.id, step.n), files)}\n`,
    "vite.config.js": viteConfig(withApiBase),
    ".gitignore": "node_modules\ndist\n",
    ".github/workflows/deploy.yml": deployWorkflow,
    "README.md": readme(topic, step, {
      api: withApiBase ? api : null,
      router: usesRouter(files),
    }),
    ".env": withApiBase ? `API_BASE=${api.baseUrl}\n` : null,
    "index.html": minimalIndexHtml(`${topic.title}: ${step.title}`, step.entry),
  };
}

// Returns { path: source } for every file the zip writes, in tree order: exactly the written
// entries of projectLayout. `api` is { baseUrl, title, fromFixtures } for the API source to write
// into .env when a workspace file reads import.meta.env.API_BASE, else null.
export function workspaceProjectFiles({ topic, step, files, api = null }) {
  const sources = downloadSources({ topic, step, files, api });
  return Object.fromEntries(
    writtenEntries(projectLayout(step, files, api)).map((entry) => {
      const source = entry.source === "workspace" ? files[entry.path] : sources[entry.path];
      if (typeof source !== "string") throw new Error(`No source for ${entry.path}`);
      return [entry.path, source];
    }),
  );
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
