# Arcane Odyssey Loadout Studio

A community-made character loadout designer with a rotatable 3D preview. Built with React, TypeScript, Vite, and React Three Fiber.

## Run locally

```sh
npm install
npm run dev
```

## Data pipeline

The checked-in catalog is built from the [Arcane Odyssey Fandom Wiki](https://roblox-arcane-odyssey.fandom.com/). Refresh locally with:

```sh
npm run refresh:data
```

The wiki scraper reads item names, page text, categories, and source URLs into `src/data/wiki-items.json`. Reddit searches are secondary, optional references; matched discussions are linked as unverified sources, never used as authority for item metadata. The normalizer combines these into the compact `src/data/catalog-items.json` used by the app. To use another MediaWiki endpoint, set `WIKI_API_URL`; set `REDDIT_USER_AGENT` to identify the Reddit client.

Wiki text and category metadata are scanned for `unfinished`, `work in progress`, `WIP`, `not finished`, `incomplete`, `placeholder`, `prototype`, `unreleased`, and `still in development`. Matching items receive an unfinished badge and a warning with its source. Exact-name Reddit mentions can add unverified references and unfinished signals. Check the linked sources for context. All 3D item appearances currently use stylized placeholder geometry.

## Build

```sh
npm run build
npm run preview
```

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` builds and deploys on pushes to `main`, manual dispatch, and a daily schedule. Scheduled/manual runs refresh wiki data, attempt optional Reddit enrichment, normalize and commit catalog updates, then deploy the refreshed build. Reddit rate limits or API outages do not block deployment. In repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**. Vite uses a relative base path for Pages compatibility.

## Attribution

This independent fan tool is not affiliated with Roblox or the Arcane Odyssey team. Wiki content and item metadata belong to their respective contributors and are linked to their Arcane Odyssey Fandom Wiki source pages in the app. See the wiki for its content licensing and attribution requirements.
