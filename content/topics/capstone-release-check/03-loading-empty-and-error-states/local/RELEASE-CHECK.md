# Release check

Project: shop-release
Commit checked:
Date:

Write what you did, what you expected, and what you saw.
A check that found a problem gets a second row after the fix.

| Check | What I did | What I expected | What I saw |
| --- | --- | --- | --- |
| Clean build | `npm run build` | The build ends with `built in`, and `dist` holds `index.html`, `assets`, and `data` | |
| Preview | `npm run preview`, opened `http://localhost:4173/shop-release/` | The home page with Home marked in the nav | |
| `/products` typed in a new tab | | | |
| `/products?q=red` typed in a new tab | | | |
| `/products/3` typed in a new tab | | | |
| Refresh on `/products/3` | | | |
| `/products/99` typed in a new tab | | | |
| `/deals` typed in a new tab | | | |
| Back and Forward | | | |
| Loading on Slow 4G | | | |
| Error when Offline, then Retry | | | |
| `empty.json` | | | |
| `incomplete.json` | | | |
| `npm test` after `npm ci` | | | |
