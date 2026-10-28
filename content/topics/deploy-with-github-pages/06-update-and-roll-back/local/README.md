# Study plan

A React page that lists the topics I plan to study, with the finished ones crossed out.

## Run it

```bash
npm install
npm run dev
```

## Deploy to GitHub Pages

1. Push this project to a repository on GitHub.
2. In the repository's **Settings > Pages**, set **Source** to **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml`, which builds the project and publishes `dist` at `https://<your name>.github.io/<repository>/`.

`vite.config.js` sets `base: "./"`, so the built page finds its files at any address, and `.gitignore` keeps `node_modules` and `dist` out of the repository.
