import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Writes one Brightspace page per open unit of a path to dist-d2l/<path-id>/<unit-id>.html, plus
// the bare content block as <unit-id>.fragment.html for pasting into an existing D2L page. A unit
// the content build compiled as closed is skipped, and each topic lists its lecture links.
// Usage: npm run export:d2l -- <path-id>   (after npm run build:content)

const SITE_URL = "https://mandloideep.github.io/cs300-react-lab/";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = path.join(root, "public/content");
const outRoot = path.join(root, "dist-d2l");

// Copied from cs-300-content terms/fall-2026/operations/d2l-build-kit/templates/
// brightspace-page-template.html, with the footer text made a placeholder.
const TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{PAGE_TITLE}}</title>
  <link rel="stylesheet" href="https://s.brightspace.com/lib/fonts/0.6.1/fonts.css">
  <link rel="stylesheet" href="https://templates.lcs.brightspace.com/lib/assets/css/styles.min.css">
  <style>
    :root {
      --cs300-navy: #002f6c;
      --cs300-blue: #004b8d;
      --cs300-gold: #f2a900;
      --cs300-ink: #202122;
      --cs300-muted: #53606d;
      --cs300-line: #d8e0e8;
      --cs300-surface: #f4f7fa;
      --cs300-warm: #fff8df;
    }

    * {
      box-sizing: border-box;
    }

    body.cs300-page {
      color: var(--cs300-ink);
      background: var(--cs300-surface);
      font-family: Lato, sans-serif;
      font-size: 16px !important;
      line-height: 1.65;
      margin: 0;
      max-width: none;
      width: 100%;
    }

    .cs300-skip-link {
      background: #ffffff;
      border: 3px solid var(--cs300-gold);
      color: var(--cs300-navy) !important;
      font-weight: 700;
      left: 1rem;
      padding: 0.65rem 1rem;
      position: fixed;
      top: -6rem;
      z-index: 1000;
    }

    .cs300-skip-link:focus {
      top: 1rem;
    }

    .cs300-shell {
      margin: 0 auto;
      max-width: 1120px;
      padding: 1.5rem;
    }

    .cs300-banner {
      background: var(--cs300-navy);
      border-top: 0.5rem solid var(--cs300-gold);
      color: #ffffff;
      padding: 1.35rem clamp(1.25rem, 4vw, 3rem) 1.5rem;
    }

    .cs300-institution {
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      margin: 0 0 0.35rem;
      text-transform: uppercase;
    }

    .cs300-course {
      align-items: baseline;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem 0.9rem;
      margin: 0;
    }

    .cs300-course-code {
      color: var(--cs300-gold);
      font-size: clamp(1.55rem, 4vw, 2.2rem);
      font-weight: 900;
      letter-spacing: 0.025em;
      line-height: 1;
    }

    .cs300-course-name {
      color: #ffffff;
      font-size: clamp(1rem, 2.5vw, 1.25rem);
      font-weight: 700;
    }

    .cs300-content {
      background: #ffffff;
      border: 1px solid var(--cs300-line);
      border-top: 0;
      padding: clamp(1.5rem, 5vw, 3.5rem);
    }

    .cs300-content > :first-child {
      margin-top: 0;
    }

    .cs300-content > :last-child {
      margin-bottom: 0;
    }

    .cs300-content h1,
    .cs300-content h2,
    .cs300-content h3,
    .cs300-content h4 {
      color: var(--cs300-navy) !important;
      font-family: Lato, sans-serif !important;
      font-weight: 800 !important;
      line-height: 1.25;
    }

    .cs300-content h1 {
      border-bottom: 0.3rem solid var(--cs300-gold) !important;
      font-size: clamp(1.85rem, 5vw, 2.75rem);
      margin-bottom: 1.75rem !important;
      padding-bottom: 0.65rem !important;
    }

    .cs300-content h1::after {
      content: none !important;
      display: none !important;
    }

    .cs300-content h1 + * {
      margin-top: 0 !important;
    }

    .cs300-content h2 {
      border-left: 0.3rem solid var(--cs300-gold) !important;
      font-size: clamp(1.35rem, 3.5vw, 1.75rem);
      margin-top: 2.4rem;
      padding-left: 0.85rem !important;
    }

    .cs300-content h3 {
      color: var(--cs300-blue) !important;
      font-size: 1.2rem;
      margin-top: 2rem;
    }

    .cs300-content p,
    .cs300-content li {
      max-width: 78ch;
    }

    .cs300-content ul,
    .cs300-content ol {
      padding-left: 1.5rem;
    }

    .cs300-content li + li {
      margin-top: 0.45rem;
    }

    .cs300-content li::marker {
      color: var(--cs300-blue);
      font-weight: 800;
    }

    .cs300-content a {
      color: #003da5;
      font-weight: 700;
      text-decoration-thickness: 0.12em;
      text-underline-offset: 0.18em;
    }

    .cs300-content a:hover {
      color: var(--cs300-navy);
      text-decoration-thickness: 0.18em;
    }

    .cs300-content a:focus-visible,
    .cs300-skip-link:focus-visible {
      outline: 0.22rem solid var(--cs300-gold);
      outline-offset: 0.2rem;
    }

    .cs300-content blockquote,
    .cs300-content .notice {
      background: var(--cs300-warm);
      border-left: 0.4rem solid var(--cs300-gold);
      color: var(--cs300-ink);
      margin: 1.5rem 0;
      padding: 1rem 1.25rem;
    }

    .cs300-content .cs300-download p {
      margin: 0;
      max-width: none;
    }

    .cs300-content table {
      border: 2px solid #000000;
      border-collapse: collapse;
      display: block;
      margin: 1.5rem 0;
      max-width: 100%;
      overflow-x: auto;
      width: max-content;
    }

    .cs300-content th,
    .cs300-content td {
      border: 2px solid #000000;
      padding: 0.75rem 0.9rem;
      text-align: left;
      vertical-align: top;
    }

    .cs300-content th {
      background: #eaf1f8;
      color: var(--cs300-navy);
      font-weight: 800;
    }

    .cs300-content code {
      background: #edf1f5;
      border-radius: 0.2rem;
      color: #17212b;
      font-size: 0.92em;
      padding: 0.12rem 0.3rem;
    }

    .cs300-content pre {
      background: #111820;
      border-left: 0.35rem solid var(--cs300-gold);
      color: #f5f7fa;
      overflow-x: auto;
      padding: 1rem 1.15rem;
    }

    .cs300-content pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }

    .cs300-content img,
    .cs300-content video {
      height: auto;
      max-width: 100%;
    }

    .cs300-footer {
      color: var(--cs300-muted);
      font-size: 0.82rem;
      padding: 0.9rem 0.25rem 0;
      text-align: right;
    }

    .cs300-footer p {
      margin: 0;
    }

    @media (max-width: 42rem) {
      .cs300-shell {
        padding: 0;
      }

      .cs300-banner {
        border-top-width: 0.4rem;
      }

      .cs300-content {
        border-left: 0;
        border-right: 0;
      }

      .cs300-footer {
        padding: 0.9rem 1rem;
      }
    }

    @media print {
      body.cs300-page {
        background: #ffffff;
        color: #000000;
      }

      .cs300-shell {
        max-width: none;
        padding: 0;
      }

      .cs300-banner {
        background: #ffffff;
        border-bottom: 2px solid #000000;
        color: #000000;
        padding: 0 0 1rem;
      }

      .cs300-institution,
      .cs300-course-name,
      .cs300-course-code {
        color: #000000;
      }

      .cs300-content {
        border: 0;
        padding: 1.5rem 0 0;
      }

      .cs300-skip-link,
      .cs300-footer {
        display: none;
      }

      .cs300-content a {
        color: #000000;
      }
    }
  </style>
</head>
<body class="cs300-page" style="color: #202122; font-family: Lato, sans-serif; font-size: 16px; margin: 0;">
  <a class="cs300-skip-link" href="#main-content">Skip to main content</a>
  <div class="cs300-shell">
    <header class="cs300-banner">
      <p class="cs300-institution">Northeastern Illinois University</p>
      <p class="cs300-course">
        <span class="cs300-course-code">CS300</span>
        <span class="cs300-course-name">Client-Side Web Development</span>
      </p>
    </header>
    <main class="cs300-content" id="main-content">
{{PAGE_CONTENT}}
    </main>
    <footer class="cs300-footer">
      <p>{{FOOTER}}</p>
    </footer>
  </div>
</body>
</html>
`;

function fail(message) {
  console.error(`export:d2l: ${message}`);
  process.exit(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lectureList(topic) {
  const lectures = (topic?.links ?? []).filter((link) => link.kind === "lecture");
  if (lectures.length === 0) return "";
  const items = lectures.map(
    (link) =>
      `            <li>Lecture: <a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a></li>`,
  );
  return `\n          <ul>\n${items.join("\n")}\n          </ul>\n        `;
}

function topicList(entries, topics) {
  const items = entries.map((entry) => {
    const topic = topics.get(entry.id);
    const url = `${SITE_URL}#/topic/${encodeURIComponent(entry.id)}`;
    const details = topic
      ? `<br>${escapeHtml(topic.summary)} About ${escapeHtml(topic.minutes)} minutes, ${topic.steps.length} steps.`
      : "";
    return `        <li><a href="${url}">${escapeHtml(topic?.title ?? entry.id)}</a>${details}${lectureList(topic)}</li>`;
  });
  return `      <ol>\n${items.join("\n")}\n      </ol>`;
}

export function renderUnit(path, unit, topics) {
  const required = (unit.topics ?? []).filter((entry) => entry.required);
  const optional = (unit.topics ?? []).filter((entry) => !entry.required);
  const unitUrl = `${SITE_URL}#/path/${encodeURIComponent(path.id)}/${encodeURIComponent(unit.id)}`;
  const parts = [
    `      <h1>${escapeHtml(unit.title)}</h1>`,
    unit.intro ? `      <p>${escapeHtml(unit.intro)}</p>` : null,
    `      <div class="notice cs300-download">`,
    `        <p><a href="${unitUrl}">Open ${escapeHtml(unit.title)} in the CS300 Lab</a></p>`,
    `      </div>`,
  ];
  if (required.length > 0)
    parts.push(`      <h2>Required topics</h2>`, topicList(required, topics));
  if (optional.length > 0)
    parts.push(`      <h2>Optional topics</h2>`, topicList(optional, topics));
  if (unit.localNotes?.length > 0) {
    parts.push(
      `      <h2>On your own computer</h2>`,
      `      <ul>`,
      ...unit.localNotes.map((note) => `        <li>${escapeHtml(note)}</li>`),
      `      </ul>`,
    );
  }
  return parts.filter(Boolean).join("\n");
}

export class ExportError extends Error {}

// Returns { pages: [{ unit, page, fragment }], closed: [unit] } for the open and the closed units of
// the path in a compiled index, or throws ExportError. readTopic(id) returns the compiled topic file, whose links the index may not carry.
export function exportPath(index, pathId, readTopic) {
  const paths = index.paths ?? [];
  const known = `Paths: ${paths.map((p) => p.id).join(", ") || "none"}.`;
  if (!pathId) {
    throw new ExportError(
      `name a path id, for example npm run export:d2l -- ${paths[0]?.id ?? "fall-2026"}. ${known}`,
    );
  }
  const labPath = paths.find((candidate) => candidate.id === pathId);
  if (!labPath) {
    throw new ExportError(
      `no path "${pathId}". ${known} An inactive path is compiled only by npm run build:content -- --all.`,
    );
  }

  const units = (labPath.units ?? []).filter((unit) => !unit.closed);
  const topics = new Map();
  for (const unit of units) {
    for (const entry of unit.topics ?? []) {
      const listed = (index.topics ?? []).find((topic) => topic.id === entry.id);
      if (!listed) throw new ExportError(`unit ${unit.id} names unknown topic ${entry.id}.`);
      topics.set(entry.id, {
        ...listed,
        links: listed.links ?? readTopic(entry.id)?.links ?? null,
      });
    }
  }

  const pages = units.map((unit) => {
    const content = renderUnit(labPath, unit, topics);
    const page = TEMPLATE.replace("{{PAGE_TITLE}}", escapeHtml(`${unit.title} | CS300 Lab`))
      .replace("{{PAGE_CONTENT}}", () => content)
      .replace("{{FOOTER}}", escapeHtml(`CS300 ${labPath.title}`));
    return { unit, page, fragment: content.replace(/^ {6}/gm, "") + "\n" };
  });
  return { pages, closed: (labPath.units ?? []).filter((unit) => unit.closed) };
}

function readCompiled(file) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"));
}

function main() {
  const pathId = process.argv[2];
  if (!fs.existsSync(path.join(contentDir, "index.json"))) {
    fail("public/content/index.json is missing; run npm run build:content first.");
  }
  const index = readCompiled("index.json");
  let exported;
  try {
    exported = exportPath(index, pathId, (id) => readCompiled(`topics/${id}.json`));
  } catch (error) {
    if (error instanceof ExportError) fail(error.message);
    throw error;
  }

  const outDir = path.join(outRoot, pathId);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  for (const { unit, page, fragment } of exported.pages) {
    fs.writeFileSync(path.join(outDir, `${unit.id}.html`), page);
    fs.writeFileSync(path.join(outDir, `${unit.id}.fragment.html`), fragment);
    console.log(
      `export:d2l: wrote dist-d2l/${pathId}/${unit.id}.html and ${unit.id}.fragment.html`,
    );
  }
  for (const unit of exported.closed) {
    console.log(`export:d2l: skipped ${unit.id}, which opens on ${unit.opens}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
