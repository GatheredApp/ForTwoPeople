# Mullet Review Buffet Map

A mobile-first, fan-created discovery map for buffets reviewed by the YouTube channel **Mullet Review**. The current version is a complete static application shell whose initial restaurants are **sample/mock records only**.

> [!CAUTION]
> Every restaurant, score, date, note, and video association currently in `src/data/buffets.ts` is sample data used only to exercise the interface. It is **not asserted to be a real Mullet Review location or review**. Replace these records with independently verified catalog data before presenting the map as factual.

This independent fan project is not affiliated with, endorsed by, or sponsored by Mullet Review, YouTube, Yelp, Barstool Sports, or One Bite. Product and company names belong to their respective owners.

## Architecture

- **React + TypeScript + Vite** provide a small, strict, static client application.
- **React Leaflet + Leaflet** render an interactive map using OpenStreetMap tiles and attribution. No map API key is used.
- **`src/data/buffets.ts` is the database.** Search, map markers, cards, links, and deep links are all generated from this one typed collection.
- YouTube previews use thumbnail images; the privacy-enhanced `youtube-nocookie.com` iframe is created only after a visitor presses play.
- Yelp information is stored in each static record. There is no Yelp API integration.
- Query strings such as `?buffet=desert-spoon-phoenix-az` provide GitHub Pages-safe deep links without a client router.
- GitHub Actions builds and deploys the static `dist` directory to GitHub Pages.

There is no backend, authentication, server-side database, user-generated content, API key, or secret.

## Local development

Node.js 22 is recommended (and used by the deployment workflow).

```bash
npm install
npm run dev
```

Vite prints the local URL. Additional checks:

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Adding or replacing a buffet

Edit only `src/data/buffets.ts` in the usual case. Add an object to the exported `buffets` array that satisfies the `Buffet` interface in `src/types/Buffet.ts`, then run lint, tests, and the production build. Use verified information and replace placeholder video IDs and broad Yelp search links with the correct URLs.

Each record supports:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | Yes | Stable, unique, human-readable, URL-safe slug, e.g. `restaurant-city-az`. Never recycle it because links depend on it. |
| `name` | Yes | Display name of the buffet. |
| `address` | Yes | Street address, also used to generate the directions link. |
| `city` | Yes | City; included in search and directions. |
| `state` | Yes | State abbreviation or name; included in search and directions. |
| `postalCode` | No | ZIP/postal code. |
| `latitude` | Yes | Valid decimal latitude used for the marker. |
| `longitude` | Yes | Valid decimal longitude used for the marker. |
| `youtubeVideoId` | No | YouTube ID only (the part after `v=`), used for the preview and lazy embed. |
| `youtubeUrl` | No | Complete verified outbound URL for the review. |
| `reviewDate` | No | Review date in `YYYY-MM-DD` form. Malformed text is displayed as supplied rather than crashing. |
| `yelpUrl` | No | Complete verified Yelp listing URL. |
| `yelpRating` | No | Static Yelp rating captured for display; no live API lookup occurs. |
| `yelpReviewCount` | No | Static Yelp review count captured for display. |
| `reviewerRating` | No | Mullet Review's numeric rating. |
| `buffetType` | No | Searchable cuisine or buffet category. |
| `price` | No | Short price indicator such as `$`, `$$`, or a fixed price. |
| `isOpen` | No | Set to `false` to show a reported-closed label; omit when unknown. |
| `notes` | No | Concise editorial notes shown in the detail card. |

Optional video and Yelp sections disappear or show a useful unavailable state when their values are absent. Records with non-finite coordinates are excluded from the map rather than crashing marker rendering.

## Deployment

This repository is a GitHub Pages **project site**. Its expected URL is
`https://GatheredApp.github.io/ForTwoPeople/` (replace the owner or repository
portion if the repository is renamed or transferred).

1. In the GitHub repository, open **Settings → Pages → Build and deployment** and set **Source** to **GitHub Actions**.
2. Push to `main` or run the **Deploy to GitHub Pages** workflow manually.
3. The workflow checks out the repository, installs dependencies, configures Pages, runs lint/tests/build, uploads only the compiled `./dist` directory, and deploys that artifact.

Vite uses relative asset paths (`base: './'`), so generated script and stylesheet
references look like `./assets/index-HASH.js` rather than `/assets/index-HASH.js`.
The same build therefore works at both a root domain and a project URL such as
`https://USERNAME.github.io/REPOSITORY/`, without hard-coding an account name.
Query-string deep links such as
`https://GatheredApp.github.io/ForTwoPeople/?buffet=desert-spoon-phoenix-az`
do not require a server rewrite or a custom `404.html`.

### Blank-page troubleshooting

Run `npm run build` and inspect `dist/index.html`: its local JavaScript and CSS
URLs should begin with `./assets/`, and the corresponding files should exist in
`dist/assets/`. In the deployed site, use the browser developer tools **Console**
and **Network** panels. A `404` for `/assets/...` (without the repository prefix)
usually identifies an incorrect Vite base or an old Pages artifact; rerun the
workflow after confirming `base: './'`. Also check the workflow log to confirm
that the build completed and that `./dist`, rather than the repository source,
was uploaded. Runtime failures are logged in the Console and display a basic
in-page fallback rather than leaving an entirely white screen.

## Intentionally deferred

- Researching or verifying the real Mullet Review buffet catalog.
- Live Yelp or YouTube API data (deliberately unnecessary for this static version).
- User accounts, submissions, ratings, and other backend features.
