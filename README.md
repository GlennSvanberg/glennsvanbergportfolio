# glennsvanberg.se

Personal site for Glenn Svanberg. The TanStack Start app lives in `app/` (React 19, Vite, Tailwind, shadcn/ui, Convex).

## Deploy

Production is the Vercel project `glennsvanberg`. A push to `master` builds `app/` and serves [glennsvanberg.se](https://glennsvanberg.se).

Convex functions are not part of that build. Deploy them separately from `app/` with `npx convex deploy` when a backend change should reach production. Day-to-day backend work uses `npx convex dev`.

Blog posts can be upserted by slug after a Notion markdown export:

```bash
cd app
npx convex run posts:upsertFromImport "$(cat post.json)" --prod
```

The JSON shape is in [AGENTS.md](AGENTS.md). Deploy the Convex functions first (`npx convex deploy`) so `posts:upsertFromImport` exists in production.

The older VPS flow (`glennsvanbergportfolio.service`, port 3200) is obsolete. Do not use it.
