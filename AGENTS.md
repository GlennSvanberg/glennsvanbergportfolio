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
