# Project Guidelines

## Project Overview
- **Framework**: TanStack Start
- **Location**: `app/` folder
- **Terminal**: PowerShell
- **UI Components**: shadcn/ui
- **Site**: glennsvanberg.se - personal site showcasing side projects

## Project Structure
- Each side project has a card with:
  - Link to the project
  - Short description
  - Preview image/visual

## Development Workflow
- **Dev server**: Always running - DO NOT start/stop it
- **After bigger changes**: Always run `npm run lint` in the `app/` folder
- **Lint command**: `npm run lint` (runs TypeScript check + ESLint)
- **Act, don't ask**: When a routine follow-through step is needed (build, restart, verify), do it directly instead of asking for confirmation
- **Deploy after every change**: Source changes alone do NOT update the live site. Always finish with build + restart + verify (see Deployment Workflow)

## Deployment Workflow (VPS)
Live site runs as a systemd service serving the built output — always deploy after code changes:
```powershell
cd app
npm run build                                     # Rebuild .output/
systemctl --user restart glennsvanbergportfolio.service
systemctl --user status glennsvanbergportfolio.service
curl -H "Host: glennsvanbergportfolio.vps" http://127.0.0.1:3200/  # Verify new version serves
```
- Service: `glennsvanbergportfolio.service` (port 3200, workdir `app/`, runs `.output/server/index.mjs`)
- **CRITICAL: `app/.env.local` must contain `VITE_CONVEX_URL` before building.** Vite bakes it into the bundle at build time — building without it produces a site that 500s on every page (`missing envar CONVEX_URL`). The old `.output/` cannot be recovered once overwritten, so never rebuild without verifying the env var is present (e.g. `grep -c convex .output/server/_ssr/router-*.mjs` should be > 0 after build).
- Convex MCP/CLI on the VPS is NOT logged in — the deployment URL cannot be fetched automatically. If `.env.local` is missing, ask the user for the URL from dashboard.convex.dev → Settings.
- Never commit secrets (`.env*` is gitignored; the Convex URL itself is a public client endpoint, safe to keep in VPS-local `.env.local`)

## Commands
All commands should be run from the `app/` directory:
```powershell
cd app
npm run lint    # Type check + lint
npm run format  # Format code
npm run build   # Build for production
```

## Component Guidelines
- Use shadcn/ui components for UI elements
- Project cards should include preview visuals
- Follow TanStack Start patterns for routing and server functions
