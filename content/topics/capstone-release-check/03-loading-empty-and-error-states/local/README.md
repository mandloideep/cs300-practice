# Shop release candidate

A small React shop built like the CS300 Capstone starter: React Router with `BrowserRouter` in `src/main.jsx`, its data in `public/data/`, Vitest and Testing Library for tests, and a GitHub Pages workflow.
It is the project for the CS300 Practice topic **Capstone release check**.

## Run it

```bash
npm install
npm run dev
```

## Release check

```bash
npm run build
npm run preview
npm test
```

`npm run preview` serves the built site from `dist` at `http://localhost:4173/shop-release/`, because `vite.config.js` sets `base: "/shop-release/"`.
Record each check you make in `RELEASE-CHECK.md`.

## The data files

`src/api.js` names the file the app loads from `public/data/`:

- `products.json`: the eight products of the catalog
- `empty.json`: no products at all
- `incomplete.json`: one product with an id and a title and nothing else

Change `DATA_FILE` to load a different one, rebuild, and look at the page; change it back before you deploy.

## Deploy to GitHub Pages

1. Change `base` in `vite.config.js` to `"/<your repository name>/"`.
2. Push this project to a public repository on GitHub.
3. In the repository's **Settings > Pages**, set **Source** to **GitHub Actions**.
4. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the project, copies `dist/index.html` to `dist/404.html` so that a refreshed route still starts the app, and publishes `dist`.
