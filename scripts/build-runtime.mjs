// Bundles the pinned React, React DOM, and React Router packages into ES module development
// builds under public/runtime/, which the result iframe loads through an import map.
//
// Every entry is built in one esbuild run with code splitting, so the module code of each package
// lands in shared chunk-*.js files and a page that imports several entries gets one React.
// The CommonJS packages (react, react-dom) are wrapped in entries that re-export every named
// export explicitly, because ES module consumers need static names.
//
// Usage: npm run build:runtime

import { readFile, readdir, rm, writeFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

process.env.NODE_ENV = "development";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outdir = path.join(root, "public", "runtime");
const require = createRequire(path.join(root, "package.json"));

// Output file name (without .js) to the specifier it exposes.
// Keep in sync with the import map table in docs/CONTRACTS.md section 4.2.
const entries = {
  react: "react",
  "react-dom": "react-dom",
  "react-dom-client": "react-dom/client",
  "react-jsx-runtime": "react/jsx-runtime",
  "react-jsx-dev-runtime": "react/jsx-dev-runtime",
  "react-router": "react-router",
};

const packages = ["react", "react-dom", "react-router"];

const identifier = /^[A-Za-z_$][\w$]*$/;

function commonJsEntry(specifier) {
  const names = Object.keys(require(specifier))
    .filter((name) => identifier.test(name) && name !== "default" && name !== "__esModule")
    .sort();
  return [
    `import * as namespace from ${JSON.stringify(specifier)};`,
    `const module = namespace.default ?? namespace;`,
    `export default module;`,
    `export const { ${names.join(", ")} } = module;`,
    "",
  ].join("\n");
}

function esModuleEntry(specifier) {
  return `export * from ${JSON.stringify(specifier)};\n`;
}

async function isEsModule(specifier) {
  const name = specifier.split("/")[0];
  const manifest = JSON.parse(await readFile(require.resolve(`${name}/package.json`), "utf8"));
  return manifest.type === "module";
}

async function entrySource(specifier) {
  return (await isEsModule(specifier)) ? esModuleEntry(specifier) : commonJsEntry(specifier);
}

const entryPlugin = {
  name: "runtime-entries",
  setup(build) {
    build.onResolve({ filter: /^runtime-entry:/ }, (args) => ({
      path: args.path.slice("runtime-entry:".length),
      namespace: "runtime-entry",
    }));
    build.onLoad({ filter: /.*/, namespace: "runtime-entry" }, async (args) => ({
      contents: await entrySource(entries[args.path]),
      resolveDir: root,
      loader: "js",
    }));
  },
};

async function cleanOutdir() {
  await mkdir(outdir, { recursive: true });
  const generated = new Set([...Object.keys(entries).map((name) => `${name}.js`), "manifest.json"]);
  for (const file of await readdir(outdir)) {
    if (generated.has(file) || /^chunk-[\w-]+\.js$/.test(file)) {
      await rm(path.join(outdir, file));
    }
  }
}

async function packageVersion(name) {
  const manifest = JSON.parse(await readFile(require.resolve(`${name}/package.json`), "utf8"));
  return manifest.version;
}

await cleanOutdir();

const result = await esbuild.build({
  entryPoints: Object.keys(entries).map((name) => ({ in: `runtime-entry:${name}`, out: name })),
  plugins: [entryPlugin],
  outdir,
  bundle: true,
  splitting: true,
  format: "esm",
  platform: "browser",
  target: "es2022",
  conditions: ["development"],
  define: { "process.env.NODE_ENV": '"development"' },
  chunkNames: "chunk-[hash]",
  minify: false,
  legalComments: "inline",
  metafile: true,
  logLevel: "warning",
});

const files = Object.keys(result.metafile.outputs)
  .map((file) => path.relative(outdir, path.resolve(root, file)))
  .sort();

const manifest = {
  builtAt: new Date().toISOString(),
  nodeEnv: "development",
  packages: Object.fromEntries(
    await Promise.all(packages.map(async (name) => [name, await packageVersion(name)])),
  ),
  bundler: { esbuild: esbuild.version },
  importMap: Object.fromEntries(
    Object.entries(entries).map(([name, specifier]) => [specifier, `${name}.js`]),
  ),
  files,
};

await writeFile(path.join(outdir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

console.log(`build:runtime: wrote ${files.length} files to public/runtime/`);
for (const [name, version] of Object.entries(manifest.packages)) {
  console.log(`  ${name}@${version}`);
}
