// Routing tests: the react-router wrapper runs BrowserRouter and createBrowserRouter on a memory
// history inside the result iframe, posts `location` messages, and takes `navigate` messages
// (docs/CONTRACTS.md sections 4.3 and 4.4); the result pane draws the address bar from them; and
// the downloaded workspace keeps the real router from npm.

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { strFromU8, unzipSync } from "fflate";
import repository from "../package.json" with { type: "json" };
import { openHarness, resultFrame, run } from "./support/harness.js";

const fixtureDir = path.join(import.meta.dirname, "fixtures", "routing");
const PROGRESS_KEY = "cs300-lab:progress";
// A React step whose workspace has src/main.jsx and src/App.jsx, so the fixture loads into it
// the way a student's saved edits do.
const STEP = { topic: "components-and-props", n: 1 };

function readWorkspace(directory, prefix = "") {
  const files = {};
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory()) {
      Object.assign(files, readWorkspace(path.join(directory, entry.name), `${relative}/`));
    } else {
      files[relative] = readFileSync(path.join(directory, entry.name), "utf8");
    }
  }
  return files;
}

const files = readWorkspace(fixtureDir);

async function messages(page) {
  return page.evaluate(() => globalThis.__harness.messages());
}

const locations = (list) =>
  list
    .filter((message) => message.type === "location")
    .map(({ pathname, search, hash, index, length }) => ({
      pathname,
      search,
      hash,
      index,
      length,
    }));

const problems = (list) =>
  list
    .filter(
      (message) =>
        message.type === "error" ||
        message.type === "rejection" ||
        (message.type === "console" && message.level === "error"),
    )
    .map((message) => message.text ?? message.message);

// Waits until a location beyond the first `known` ones arrives and returns the newest one.
async function nextLocation(page, known) {
  await expect.poll(async () => locations(await messages(page)).length).toBeGreaterThan(known);
  return locations(await messages(page)).at(-1);
}

function navigate(page, fields) {
  return page.evaluate(
    (message) => globalThis.__harness.send({ type: "navigate", ...message }),
    fields,
  );
}

// The overlay draws each boundary label just above its component, where it would catch a click
// meant for the link on the line above, so the tests that click links turn the boxes off.
function hideOverlay(page) {
  return page.evaluate(() =>
    globalThis.__harness.send({ type: "inspector-config", views: ["tree"] }),
  );
}

const at = (pathname, index, length, search = "") => ({
  pathname,
  search,
  hash: "",
  index,
  length,
});

test.describe("BrowserRouter on a memory history", () => {
  test.beforeEach(async ({ page }) => openHarness(page));

  test("mounts without a URL to push and posts one location, even under Strict Mode", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    expect(result.diagnostics).toEqual([]);
    expect(problems(result.messages)).toEqual([]);
    expect(locations(result.messages)).toEqual([at("/", 0, 1)]);
    await expect(resultFrame(page).locator("h1")).toHaveText("Home");
    expect(result.srcdoc).toContain("/runtime/wrap/react-router.js");
  });

  test("a Link, useNavigate, useParams, and useSearchParams work on the memory history", async ({
    page,
  }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    await hideOverlay(page);
    const frame = resultFrame(page);
    let known = locations(result.messages).length;

    await frame.locator("#see-products").click();
    expect(await nextLocation(page, known++)).toEqual(at("/products", 1, 2));
    await expect(frame.locator("h1")).toHaveText("Products");

    await frame.getByRole("link", { name: "Notebook" }).click();
    expect(await nextLocation(page, known++)).toEqual(at("/products/1", 2, 3));
    await expect(frame.locator("#detail")).toHaveText("Notebook");

    await frame.getByRole("link", { name: "Search" }).click();
    expect(await nextLocation(page, known++)).toEqual(at("/search", 3, 4));
    await frame.locator("#query").fill("pen");
    await expect(frame.locator("#query-echo")).toHaveText("Searching for pen");
    await expect
      .poll(async () => locations(await messages(page)).at(-1))
      .toEqual(at("/search", 4, 5, "?q=pen"));
    expect(problems(await messages(page))).toEqual([]);
  });

  test("navigate messages move the history by delta or to a path", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    await hideOverlay(page);
    const frame = resultFrame(page);
    let known = locations(result.messages).length;

    await frame.getByRole("link", { name: "Products" }).click();
    await nextLocation(page, known++);
    await frame.getByRole("link", { name: "Pencil" }).click();
    expect(await nextLocation(page, known++)).toEqual(at("/products/2", 2, 3));

    await navigate(page, { delta: -1 });
    expect(await nextLocation(page, known++)).toEqual(at("/products", 1, 3));
    await expect(frame.locator("h1")).toHaveText("Products");

    await navigate(page, { delta: 1 });
    expect(await nextLocation(page, known++)).toEqual(at("/products/2", 2, 3));
    await expect(frame.locator("#detail")).toHaveText("Pencil");

    await navigate(page, { delta: -1 });
    await nextLocation(page, known++);
    await navigate(page, { to: "/search" });
    expect(await nextLocation(page, known++)).toEqual(at("/search", 2, 3));
    await expect(frame.locator("h1")).toHaveText("Search");

    await navigate(page, { delta: -1 });
    expect(await nextLocation(page, known++)).toEqual(at("/products", 1, 3));
    await navigate(page, { delta: 1 });
    expect(await nextLocation(page, known++)).toEqual(at("/search", 2, 3));

    await navigate(page, { to: "/nowhere" });
    expect(await nextLocation(page, known++)).toEqual(at("/nowhere", 3, 4));
    await expect(frame.locator("h1")).toHaveText("Not found");
    expect(problems(await messages(page))).toEqual([]);
  });

  test("a delta past either end of the history does not move", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: true });
    const frame = resultFrame(page);
    const known = locations(result.messages).length;
    await navigate(page, { delta: -1 });
    await navigate(page, { delta: 1 });
    await frame.getByRole("link", { name: "Products" }).click();
    expect(await nextLocation(page, known)).toEqual(at("/products", 1, 2));
    expect(locations(await messages(page))).toEqual([at("/", 0, 1), at("/products", 1, 2)]);
  });

  test("the router runs on the memory history without the inspector too", async ({ page }) => {
    const result = await run(page, { files, entry: "src/main.jsx", inspector: false });
    expect(problems(result.messages)).toEqual([]);
    expect(locations(result.messages)).toEqual([at("/", 0, 1)]);
    const frame = resultFrame(page);
    await frame.getByRole("link", { name: "Products" }).click();
    expect(await nextLocation(page, 1)).toEqual(at("/products", 1, 2));
  });

  test("createBrowserRouter with RouterProvider reports and takes navigation the same way", async ({
    page,
  }) => {
    const result = await run(page, {
      entry: "src/main.jsx",
      inspector: true,
      files: {
        "index.html": files["index.html"],
        "src/main.jsx": `import { createRoot } from "react-dom/client";
import { Link, RouterProvider, createBrowserRouter, useParams } from "react-router";

function Home() {
  return (
    <p>
      <Link to="/notes/7">Note 7</Link>
    </p>
  );
}

function Note() {
  const { id } = useParams();
  return <h1 id="note">Note {id}</h1>;
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/notes/:id", element: <Note /> },
]);

createRoot(document.getElementById("root")).render(<RouterProvider router={router} />);
`,
      },
    });
    expect(result.diagnostics).toEqual([]);
    expect(problems(result.messages)).toEqual([]);
    expect(locations(result.messages)).toEqual([at("/", 0, 1)]);
    const frame = resultFrame(page);
    await frame.getByRole("link", { name: "Note 7" }).click();
    expect(await nextLocation(page, 1)).toEqual(at("/notes/7", 1, 2));
    await expect(frame.locator("#note")).toHaveText("Note 7");
    await navigate(page, { delta: -1 });
    expect(await nextLocation(page, 2)).toEqual(at("/", 0, 2));
    await navigate(page, { to: "/notes/9" });
    expect(await nextLocation(page, 3)).toEqual(at("/notes/9", 1, 2));
    await expect(frame.locator("#note")).toHaveText("Note 9");
  });

  test("a workspace without a router posts no location", async ({ page }) => {
    const result = await run(page, {
      entry: "src/main.jsx",
      inspector: true,
      files: {
        "index.html": files["index.html"],
        "src/main.jsx": `import { createRoot } from "react-dom/client";
createRoot(document.getElementById("root")).render(<h1>Plain</h1>);
`,
      },
    });
    expect(locations(result.messages)).toEqual([]);
  });
});

function seedFiles(page) {
  return page.addInitScript(
    ([key, value]) => {
      if (!sessionStorage.getItem("cs300-test:seeded")) {
        localStorage.setItem(key, JSON.stringify(value));
        sessionStorage.setItem("cs300-test:seeded", "1");
      }
    },
    [
      PROGRESS_KEY,
      {
        version: 1,
        completed: {},
        files: {
          [`${STEP.topic}/${STEP.n}`]: {
            "src/main.jsx": files["src/main.jsx"],
            "src/App.jsx": files["src/App.jsx"],
          },
        },
      },
    ],
  );
}

// The step opens with the boundaries on, and the labels for the router and its links sit over the
// nav at the top of the result, where a click meant for a link lands on a label instead on Linux
// fonts, so the step is opened with the boxes off.
async function openRoutingStep(page) {
  await seedFiles(page);
  await page.goto(`#/topic/${STEP.topic}/${STEP.n}`);
  await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
    timeout: 15_000,
  });
  const boundaries = page.locator(".pane--inspector").getByRole("button", { name: "Boundaries" });
  await expect(boundaries).toHaveAttribute("aria-pressed", "true");
  await boundaries.click();
  await expect(boundaries).toHaveAttribute("aria-pressed", "false");
}

test.describe("address bar on the step page", () => {
  test("shows the path, moves with Back and Forward, and takes a typed path", async ({ page }) => {
    await openRoutingStep(page);
    const bar = page.getByRole("form", { name: "Address bar of the result" });
    const field = bar.getByRole("textbox", { name: "Path" });
    const back = bar.getByRole("button", { name: "Back" });
    const forward = bar.getByRole("button", { name: "Forward" });
    const result = page.frameLocator("iframe.result-frame");
    const status = page.locator('[role="status"]');

    await expect(field).toHaveValue("/");
    await expect(back).toBeDisabled();
    await expect(forward).toBeDisabled();

    await result.getByRole("link", { name: "Products" }).click();
    await expect(field).toHaveValue("/products");
    await expect(back).toBeEnabled();
    await expect(forward).toBeDisabled();
    await expect(status).toContainText("The result is now at /products.");

    await back.focus();
    await page.keyboard.press("Enter");
    await expect(field).toHaveValue("/");
    await expect(result.locator("h1")).toHaveText("Home");
    await expect(back).toBeDisabled();
    await expect(forward).toBeEnabled();

    await forward.click();
    await expect(field).toHaveValue("/products");
    await expect(forward).toBeDisabled();

    await field.fill("/products/2");
    await page.keyboard.press("Enter");
    await expect(result.locator("#detail")).toHaveText("Pencil");
    await expect(field).toHaveValue("/products/2");
    await expect(status).toContainText("The result is now at /products/2.");

    await field.fill("search?q=ink");
    await page.keyboard.press("Enter");
    await expect(field).toHaveValue("/search?q=ink");
    await expect(result.locator("#query")).toHaveValue("ink");
    await expect(result.locator("#query-echo")).toHaveText("Searching for ink");
  });

  test("the address bar is absent until a run posts a location", async ({ page }) => {
    await page.goto(`#/topic/${STEP.topic}/${STEP.n}`);
    await expect(page.locator(".pane--result .status-pill")).toHaveText("Ready", {
      timeout: 15_000,
    });
    await expect(page.getByRole("form", { name: "Address bar of the result" })).toHaveCount(0);
  });

  test("the downloaded workspace keeps the real router from npm", async ({ page }) => {
    await openRoutingStep(page);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download this workspace" }).click(),
    ]);
    const zip = unzipSync(new Uint8Array(readFileSync(await download.path())));
    const entries = Object.fromEntries(
      Object.entries(zip).map(([entryPath, bytes]) => [entryPath, strFromU8(bytes)]),
    );
    const folder = `${STEP.topic}-${STEP.n}`;
    const manifest = JSON.parse(entries[`${folder}/package.json`]);
    expect(manifest.dependencies).toEqual({
      react: repository.dependencies.react,
      "react-dom": repository.dependencies["react-dom"],
      "react-router": repository.dependencies["react-router"],
    });
    expect(Object.keys(entries).filter((entryPath) => /runtime|wrap/.test(entryPath))).toEqual([]);
    expect(entries[`${folder}/src/App.jsx`]).toBe(files["src/App.jsx"]);
    expect(entries[`${folder}/src/App.jsx`]).toContain('from "react-router"');
    expect(entries[`${folder}/src/App.jsx`]).toContain("<BrowserRouter>");
    expect(Object.values(entries).some((source) => /wrap\/|MemoryRouter/.test(source))).toBe(false);
  });
});

const VISITS_APP = `const visits = Number(localStorage.getItem("visits") ?? 0) + 1;
localStorage.setItem("visits", String(visits));

export default function App() {
  return <p id="visits">Visit {visits}</p>;
}
`;

test.describe("workspace storage", () => {
  test("a run starts from empty storage unless the previous run's data is kept", async ({
    page,
  }) => {
    await page.addInitScript(
      ([key, value]) => {
        if (!sessionStorage.getItem("cs300-test:seeded")) {
          localStorage.setItem(key, JSON.stringify(value));
          sessionStorage.setItem("cs300-test:seeded", "1");
        }
      },
      [
        PROGRESS_KEY,
        {
          version: 1,
          completed: {},
          files: { [`${STEP.topic}/${STEP.n}`]: { "src/App.jsx": VISITS_APP } },
        },
      ],
    );
    await page.goto(`#/topic/${STEP.topic}/${STEP.n}`);
    const result = page.frameLocator("iframe.result-frame");
    await expect(result.locator("#visits")).toHaveText("Visit 1");
    expect(await page.evaluate(() => localStorage.getItem("cs300-lab:sandbox:visits"))).toBe("1");

    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(result.locator("#visits")).toHaveText("Visit 1");

    await page.evaluate(() => localStorage.setItem("cs300-lab:sandbox:visits", "4"));
    await page.getByRole("button", { name: "Run", exact: true }).click();
    await expect(result.locator("#visits")).toHaveText("Visit 1");
    expect(await page.evaluate(() => localStorage.getItem("cs300-lab:progress"))).toContain(
      "visits",
    );
  });

  test("the workspace sees only its own keys and cannot touch the site's", async ({ page }) => {
    await openHarness(page);
    await page.evaluate(() => localStorage.setItem("cs300-lab:progress", '{"version":1}'));
    await run(page, {
      entry: "src/main.js",
      files: {
        "index.html": files["index.html"],
        "src/main.js": `localStorage.setItem("theme", "dark");
localStorage.color = "teal";
sessionStorage.setItem("visit", "1");
document.getElementById("root").textContent = [
  localStorage.length,
  localStorage.getItem("theme"),
  localStorage.color,
  "theme" in localStorage,
  Object.keys(localStorage).sort().join("+"),
  localStorage.key(0),
  String(localStorage.getItem("cs300-lab:progress")),
  sessionStorage.getItem("visit"),
].join("|");
localStorage.removeItem("color");
localStorage.clear();
`,
      },
    });
    await expect(resultFrame(page).locator("#root")).toHaveText(
      "2|dark|teal|true|color+theme|color|null|1",
    );
    const parent = await page.evaluate(() => ({
      progress: localStorage.getItem("cs300-lab:progress"),
      sandbox: Object.keys(localStorage).filter((key) => key.startsWith("cs300-lab:sandbox:")),
      session: sessionStorage.getItem("cs300-lab:sandbox:visit"),
    }));
    expect(parent).toEqual({ progress: '{"version":1}', sandbox: [], session: "1" });
  });
});
