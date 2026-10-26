// Checks that the vendored runtime in public/runtime/ behaves as one React instance.
//
// It serves the runtime next to a small page whose import map matches the one the runner uses,
// then loads that page in headless Chromium. The page imports every runtime entry and renders,
// through react-dom/client, a MemoryRouter tree built with jsxDEV and jsx whose components call
// useState and useLocation. If any entry carried its own copy of React, the hooks would throw
// "Invalid hook call" or the router context would be missing. The script clicks a button to prove
// state updates, and fails on any console warning, console error, or page error.
//
// Usage: npm run verify:runtime [-- <runtime directory>]

import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = path.resolve(process.argv[2] ?? path.join(root, "public", "runtime"));

const importMap = {
  imports: {
    react: "/runtime/react.js",
    "react-dom": "/runtime/react-dom.js",
    "react-dom/client": "/runtime/react-dom-client.js",
    "react/jsx-runtime": "/runtime/react-jsx-runtime.js",
    "react/jsx-dev-runtime": "/runtime/react-jsx-dev-runtime.js",
    "react-router": "/runtime/react-router.js",
  },
};

const pageModule = `
import React, { useState, version as reactVersion } from "react";
import { version as domVersion } from "react-dom";
import { createRoot } from "react-dom/client";
import { jsx } from "react/jsx-runtime";
import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

const source = (lineNumber) => ({ fileName: "src/App.jsx", lineNumber, columnNumber: 1 });

function Counter() {
  const [count, setCount] = useState(0);
  return jsxDEV("button", { id: "count", onClick: () => setCount(count + 1), children: "count " + count }, undefined, false, source(1), this);
}

function Where() {
  const location = useLocation();
  return jsx("p", { id: "where", children: location.pathname });
}

function Page() {
  return jsxDEV(Fragment, { children: [jsxDEV(Counter, {}, undefined, false, source(2), this), jsx(Where, {})] }, undefined, true, source(3), this);
}

function App() {
  return jsxDEV(MemoryRouter, {
    initialEntries: ["/lab"],
    children: jsxDEV(Routes, {
      children: jsxDEV(Route, { path: "/lab", element: jsxDEV(Page, {}, undefined, false, source(4), this) }, undefined, false, source(5), this),
    }, undefined, false, source(6), this),
  }, undefined, false, source(7), this);
}

window.__runtime = { reactVersion, domVersion, defaultHasUseState: React.useState === useState };
createRoot(document.getElementById("root")).render(jsxDEV(App, {}, undefined, false, source(8), this));
`;

const page = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <script type="importmap">${JSON.stringify(importMap)}</script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${pageModule}</script>
  </body>
</html>`;

const server = createServer(async (request, response) => {
  const url = new URL(request.url, "http://localhost");
  if (url.pathname === "/") {
    response.writeHead(200, { "content-type": "text/html" }).end(page);
    return;
  }
  if (url.pathname.startsWith("/runtime/")) {
    const file = path.join(runtimeDir, path.basename(url.pathname));
    try {
      const body = await readFile(file);
      response.writeHead(200, { "content-type": "text/javascript" }).end(body);
    } catch {
      response.writeHead(404).end();
    }
    return;
  }
  response.writeHead(404).end();
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const problems = [];
const browser = await chromium.launch();
try {
  const tab = await browser.newPage();
  tab.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      problems.push(`console.${message.type()}: ${message.text()}`);
    }
  });
  tab.on("pageerror", (error) => problems.push(`page error: ${error.message}`));

  await tab.goto(origin);
  const button = tab.locator("#count");
  await button.waitFor({ timeout: 10_000 }).catch(() => {});

  if ((await button.count()) === 1) {
    if ((await button.textContent()) !== "count 0") problems.push("the counter did not start at 0");
    await button.click();
    await tab
      .waitForFunction(
        () => globalThis.document.getElementById("count")?.textContent === "count 1",
        {
          timeout: 5_000,
        },
      )
      .catch(() => problems.push("clicking the counter did not update its state"));
    const where = await tab.locator("#where").textContent();
    if (where !== "/lab") problems.push(`useLocation returned ${where}, expected /lab`);
    const info = await tab.evaluate(() => globalThis.__runtime);
    if (info.reactVersion !== info.domVersion) {
      problems.push(`react ${info.reactVersion} and react-dom ${info.domVersion} differ`);
    }
    if (!info.defaultHasUseState) problems.push("the default export of react.js is not React");
    console.log(`verify:runtime: React ${info.reactVersion} rendered through react-dom/client`);
  } else {
    problems.push("the test component never rendered");
  }
} finally {
  await browser.close();
  server.close();
}

if (problems.length > 0) {
  console.error(`verify:runtime: FAILED for ${runtimeDir}`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(
  "verify:runtime: one React instance; hooks, router context, and state updates work; no warnings",
);
