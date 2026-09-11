# Mullet Review Buffet Map

A mobile-first, fan-created discovery map for buffets reviewed by the YouTube channel **Mullet Review**.

This independent fan project is not affiliated with, endorsed by, or sponsored by Mullet Review, YouTube, Yelp, Barstool Sports, or One Bite. Product and company names belong to their respective owners.

## Architecture

- **React + TypeScript + Vite** provide a small, strict, static client application.
- **React Leaflet + Leaflet** render an interactive map using OpenStreetMap tiles and attribution. No map API key is used.
- **`src/data/buffets.json` is the canonical dataset.** The small `src/data/buffets.ts` wrapper provides its typed application interface; search, map markers, cards, links, and deep links are generated from that collection.
- YouTube previews use thumbnail images; the privacy-enhanced `youtube-nocookie.com` iframe is created only after a visitor presses play.
- Yelp information is stored in each static record. There is no Yelp API integration.
- Query strings such as `?buffet=nv-china-buffet-north-vernon-in` provide GitHub Pages-safe deep links without a client router.
- GitHub Actions builds and deploys the static `dist` directory to GitHub Pages.

There are no GitHub credentials, API keys, or secrets in the public browser application. Owner-approved additions are processed in GitHub Actions using the workflow's short-lived repository token.

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
npm run validate:data
npm run build
npm run preview
```

## Installing Mullet Review

The buffet map can be added to a device as **Mullet Review**, with the crab-rangoon app icon and a standalone app window. Installation adds a convenient launcher; this project intentionally does not include a service worker or offline caching.

### Android / Chrome

1. Open the buffet map in Chrome.
2. Use the in-app **Add to Home Screen** prompt.
3. Confirm the browser's native installation prompt.

Chrome's browser menu may also offer **Install app** or **Add to Home screen**. On supported desktop Chromium browsers, the in-app action opens the same native installation flow.

### iPhone / iPad

1. Open the site in Safari.
2. Tap **Share**.
3. Choose **Add to Home Screen**.
4. Confirm.

Because iOS does not expose a programmable installation prompt, the in-app card provides these manual instructions instead. The card is hidden when the app is already running from the Home Screen, and dismissing it suppresses it for approximately 14 days.

### App icon maintenance

`src/assets/goon.png` is the canonical source artwork. The install-ready standard, maskable Android, and Apple touch icons in `public/icons/` are generated derivatives; do not edit them independently. Regenerate the complete set after changing the source with:

```bash
npm run generate:icons
npm run validate:pwa
```

After regeneration, add the generated files to the repository so GitHub Pages builds remain deterministic. The generator preserves the standard artwork and transparency, while maskable variants place a safely padded version over the site's existing orange brand color.

## Owner: Add a Buffet

The normal owner workflow is:

1. Open [`https://gatheredapp.github.io/ForTwoPeople/?admin=1`](https://gatheredapp.github.io/ForTwoPeople/?admin=1).
2. Fill out the form and review the normalized record and JSON preview.
3. Click **Submit to GitHub**. This opens GitHub's normal new-issue screen; it does not call an API or give the site write access.
4. Review the pre-filled issue and submit it while signed in to the **`GatheredApp`** GitHub account.
5. GitHub Actions verifies both the exact account login and the issue's `OWNER` association, independently validates the record, checks for duplicates, and appends it to the dataset.
6. After lint, tests, data validation, and the production build pass, the Action commits the JSON change, comments on and closes the issue, and invokes the existing Pages deployment workflow.

Draft form values stay in local storage until **Clear Form** is selected. No secret is stored. Automatic ingestion is owner-only: issues from collaborators, organization members, contributors, and all other public users cannot run the write job, even if they contain valid-looking payload markers.

Directly editing the canonical `src/data/buffets.json` array remains available as a fallback. Preserve its two-space JSON formatting and omit unused optional properties, then run `npm run validate:data` before committing. The validator checks the schema, values, and dataset-wide duplicates.

## Public: Suggest a Buffet

Anyone with a GitHub account can propose a location at [`?submit=1`](https://gatheredapp.github.io/ForTwoPeople/?submit=1):

1. Fill in the **Suggest a Buffet** form and check its normalized preview.
2. Click **Submit Buffet**, then submit the pre-filled issue on GitHub.
3. The safe triage workflow recognizes the distinct `BUFFET_PUBLIC_SUBMISSION_V1` payload and applies `buffet-submission` (creating both required labels when necessary).
4. GatheredApp manually verifies the readable details and payload.
5. GatheredApp applies the `approved-buffet` label.
6. GitHub Actions independently authorizes the label event, validates the event's issue-body snapshot and duplicate rules, appends the record, runs all checks, and commits it.
7. The normal push-triggered Pages workflow redeploys the site; the issue receives a success comment and closes.

Public submissions **do not modify the repository when opened**. Ingestion is authorized only when the exact `approved-buffet` label is applied by the exact `GatheredApp` account. The Node script repeats those checks and reads `event.issue.body` from `GITHUB_EVENT_PATH` rather than fetching an editable live issue after approval. Public payloads have an explicit field allowlist and cannot contain `rangoonRating`; owner ratings remain owner-managed.

The triage workflow has only `contents: read` and `issues: write`. The approval workflow uses only the normal short-lived `GITHUB_TOKEN` with `contents: write` and `issues: write`; no PAT or browser credential is used. It creates these labels automatically if they do not exist:

- `buffet-submission` — Public buffet submission awaiting review
- `approved-buffet` — Approved by GatheredApp for ingestion

As with owner ingestion, repository **Actions → General → Workflow permissions** must allow read/write access, and branch rules must permit the Actions token to push. Do not weaken branch protection or add a PAT; if policy blocks the push, the workflow comments on the issue and leaves it open.

### Record schema

Records in `src/data/buffets.json` satisfy the `Buffet` interface in `src/types/Buffet.ts`. Use verified information and omit optional fields instead of adding placeholder URLs or values.

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
| `youtubeVideoId` | Yes | YouTube ID only (the part after `v=`), used for the preview and lazy embed. |
| `youtubeUrl` | Yes | Normalized, verified outbound URL for the review. |
| `reviewDate` | No | Review date in `YYYY-MM-DD` form. Malformed text is displayed as supplied rather than crashing. |
| `yelpUrl` | No | Complete verified Yelp listing URL. |
| `yelpRating` | No | Static Yelp rating captured for display; no live API lookup occurs. |
| `yelpReviewCount` | No | Static Yelp review count captured for display. |
| `reviewerRating` | No | Mullet Review's numeric rating. |
| `rangoonRating` | No | Site owner's integer crab-rangoon rating from 1–5. |
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
`https://GatheredApp.github.io/ForTwoPeople/?buffet=nv-china-buffet-north-vernon-in`
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

### Required GitHub Actions setting

For issue ingestion to push its validated commit, go to **Repository → Settings → Actions → General → Workflow permissions**, select **Read and write permissions**, and save. Keep branch protection enabled; if it disallows direct GitHub Actions pushes, the issue workflow fails safely and leaves the issue open. Configure an approved GitHub Actions bypass only if that matches the repository's branch-protection policy—do not disable protection.

## Intentionally deferred

- Researching or verifying the real Mullet Review buffet catalog.
- Live Yelp or YouTube API data (deliberately unnecessary for this static version).
- User accounts, submissions, ratings, and other backend features.
