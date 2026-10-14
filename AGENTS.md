# Project Guidelines

## Project Overview
- **Framework**: TanStack Start 1.169 + React 19 + Vite, Tailwind, shadcn/ui
- **Backend**: Convex (`app/convex/`). Blog posts live in the `posts` table (`app/convex/posts.ts`) and render at `/blog` and `/blog/<slug>`.
- **Location**: `app/` folder
- **UI Components**: shadcn/ui
- **Site**: [glennsvanberg.se](https://glennsvanberg.se) — personal site for side projects and the blog
- **Default branch**: `master`

## Project Structure
- Each side project has a card with:
  - Link to the project
  - Short description
  - Preview image/visual
- Pages: `/` (portfolio), `/about`, `/blog`, `/blog/<slug>`, `/admin` (token-gated studio; leave it in place)

## Development Workflow
- Run commands from `app/`.
- Local dev: `npm run dev` (runs `npx convex dev` plus Vite). Do not start a second dev server if one is already running.
- **After bigger changes**: `npm run lint` in `app/` (TypeScript check + ESLint).
- **Act, don't ask**: When a routine follow-through step is needed (lint, typecheck), do it directly instead of asking for confirmation.
- Never commit secrets. `.env*` is gitignored. `VITE_CONVEX_URL` is a public client endpoint.

## Deployment

Production is **Vercel**, project `glennsvanberg` (team `glennsvanbergs-projects`). Custom domains: `glennsvanberg.se` and `www.glennsvanberg.se`. The latest production deployment is a Git deployment of `master` from `GlennSvanberg/glennsvanbergportfolio`.

### Site (frontend + SSR)

1. Merge or push to `master`.
2. Vercel builds that commit and aliases it to `glennsvanberg.se`.
3. Other branches get preview deployments. Env vars below are set for production, preview, and development.

There is no `vercel.json` in the repo. Dashboard framework is unset (Other). Node is 24.x. The app and its `package.json` live in `app/`, so the Vercel project root has to be `app` (or the build command has to run there). Build script:

```powershell
cd app
npm run build   # vite build && tsc --noEmit
```

`vite.config.ts` uses the Nitro Vite plugin (`nitro()`). On Vercel, Nitro emits the Build Output API (`.vercel/output`). That is what production serves. `npm start` (`node .output/server/index.mjs`) is only the local Node server output from a non-Vercel build. Do not restart a VPS after a change.

Vercel project env vars (do not print their values):

- `VITE_CONVEX_URL` — required. Vite bakes it into the client bundle at build time. A build without it 500s with `missing envar CONVEX_URL` / `VITE_CONVEX_URL is required`.
- `VITE_CONVEX_SITE_URL`
- `CONVEX_DEPLOYMENT` — Convex deployment name selector. It does not, by itself, push functions.

Local builds need the same `VITE_CONVEX_URL` in `app/.env.local`. If it is missing, ask for the URL from the Convex dashboard (Settings). Do not commit it.

### Convex functions

`npm run build` does **not** deploy Convex functions. The Vercel project has no `CONVEX_DEPLOY_KEY` in its env list, and nothing in `package.json` calls `npx convex deploy`. Shipping a change under `app/convex/` takes a separate production deploy from a machine logged into Convex:

```powershell
cd app
npx convex dev       # development deployment, while coding
npx convex deploy    # production only, when the backend change should go live
```

Use `npx convex dev` for development. Use `npx convex deploy` only for a deliberate production backend release.

Admin credentials and API keys (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `OPENAI_API_KEY`, X API secrets) are set in the Convex dashboard, not in Vercel. See `app/convex/README.md`.

### Obsolete: VPS

An older workflow served the site from a user systemd unit `glennsvanbergportfolio.service` on port 3200 (`glennsvanbergportfolio.vps`). Nothing in this repo, and nothing on the current Vercel project, still points at that host. Do not build, restart, or curl that service. Production is the Vercel project above.

## Publish a blog post (Notion → site)

The public site reads `posts` from Convex. `/admin` can still create and edit posts with the admin token. This path is for the site owner, without that token.

1. Write the post in Notion, in Swedish.
2. Export it as Markdown.
3. Save a JSON file (for example `post.json`, gitignored if you keep it next to `.env`). `body` is the markdown. `publishedAt` is optional unix epoch milliseconds; omit it to keep the existing date on update, or to use “now” on create.

```json
{
  "title": "Rubrik",
  "slug": "rubrik-i-kebab-case",
  "excerpt": "En mening som syns i listor och delningar.",
  "body": "## Ingress\n\nBrödtext i markdown.",
  "tags": ["AI", "Byggande"],
  "publishedAt": 1711929600000
}
```

`slug` must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. The same slug updates the existing post. `featuredOrder` and `relatedProjectId` are left as they are.

4. From `app/`, with the Convex CLI logged in (`npx convex dev` once if it is not):

```powershell
cd app
npx convex run posts:upsertFromImport "$(Get-Content -Raw post.json)" --prod
```

Bash:

```bash
cd app
npx convex run posts:upsertFromImport "$(cat post.json)" --prod
```

`--prod` writes to the production deployment that the live site reads. Omit `--prod` to write to the dev deployment selected by `CONVEX_DEPLOYMENT` in `.env.local`.

The function has to exist on that deployment first. `npx convex dev` pushes it to dev. `npx convex deploy` pushes it to production. Do not pass `--push` together with `--prod` just to publish a post; that deploys every local Convex function to production.

The function is `internalMutation` `posts.upsertFromImport`. It is not in the public client API. `npx convex run` and the Convex MCP can call it because they use the deployment admin key. Re-running with the same slug updates title, excerpt (when provided), body, tags, and `publishedAt` (when provided).

5. The post shows up on `/blog` and `/blog/<slug>` as soon as Convex has it. No Vercel rebuild is required for content-only changes. A new route or layout change still needs a push to `master`.

## Commands

All commands should be run from the `app/` directory:

```powershell
cd app
npm run lint    # Type check + lint
npm run format  # Format code
npm run build   # Production build of the site (does not deploy Convex)
```

## Component Guidelines
- Use shadcn/ui components for UI elements
- Project cards should include preview visuals
- Follow TanStack Start patterns for routing and server functions
