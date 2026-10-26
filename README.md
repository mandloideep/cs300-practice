# cs300-react-lab

CS300 Lab is a static, client-side learning site for CS300 at Northeastern Illinois University.
Students read a short explanation, edit code in the browser, run it, see the rendered result and the console, and check their work against stated expectations.
Content is organized by topic, with a semester path layered on top, so topics are reused across semesters.

The site is deployed to GitHub Pages at <https://mandloideep.github.io/cs300-react-lab/>.
Everything runs in the visitor's browser: there is no server, no account, no database, and no analytics.

The design of record is [docs/DESIGN.md](docs/DESIGN.md).
The Phase 1 scope is in [docs/KICKOFF.md](docs/KICKOFF.md), and the interfaces shared by every part of the code are in [docs/CONTRACTS.md](docs/CONTRACTS.md).

## Local setup

You need Node 24 or newer and npm.
The repository pins Node 24 in `.nvmrc`, which is what CI uses.

```sh
nvm use
npm ci
npm run dev
```

`npm run dev` compiles `content/` into `public/content/` and then starts the Vite dev server.
Open the URL it prints, which ends in `/cs300-react-lab/`.

To check a production build locally:

```sh
npm run build
npm run preview
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Compiles the content, then starts the Vite dev server |
| `npm run build` | Compiles the content, then builds the site into `dist/` |
| `npm run preview` | Serves `dist/` locally |
| `npm run build:content` | Compiles `content/` into `public/content/` with `scripts/build-content.mjs` |
| `npm run build:runtime` | Rebuilds the vendored React runtime in `public/runtime/` with `scripts/build-runtime.mjs` |
| `npm run validate` | Validates `content/` without writing anything, with `scripts/validate-content.mjs` |
| `npm run lint` | Runs ESLint over `src`, `scripts`, and `tests` |
| `npm run format` | Formats the code with Prettier |
| `npm run format:check` | Checks the formatting with Prettier |
| `npm test` | Runs the Playwright tests against a production build |
| `npm run export:d2l` | Writes Brightspace page fragments for a path into `dist-d2l/` |

Prettier does not touch Markdown or `content/`.
Markdown keeps one sentence per physical line, and the edit blocks in each `step.md` must match their workspace files byte for byte.

## How the site is organized

- `src/app/` holds the routes, the site header, and the pages.
- `src/styles/tokens.css` holds the design tokens, and `src/styles/global.css` holds the base styles.
- `content/` holds the topics, paths, areas, and API presets as plain files.
- `public/runtime/` holds the vendored React runtime that the result iframe loads through an import map.
- `scripts/` holds the content, runtime, and export build scripts.

Routes use hash routing so that deep links work on GitHub Pages: `#/`, `#/topics`, `#/topic/<id>`, `#/topic/<id>/<n>`, `#/path/<pathId>`, and `#/path/<pathId>/<unit>`.

## Deployment

The workflow in `.github/workflows/deploy.yml` runs on every pull request and on every push to `main`.
It installs with `npm ci`, then runs lint, the format check, content validation, the build, and the Playwright tests.
On `main` it also publishes `dist/` to GitHub Pages.

## Adding a topic

## Adding a path

## Adding an API preset

## Upgrading the runtime
