---
name: add-app-to-site
description: Adds a new app/project to glennsvanberg.se. Captures desktop and mobile screenshots of the live site, saves to public folder, and adds project entry. Use when adding a new project to the portfolio, taking screenshots of sites, or when the user wants to showcase a new app.
---

# Add App to Site

Workflow for adding a new project to glennsvanberg.se. Desktop and mobile screenshots are required for responsive project cards.

## Quick Start

1. **Capture screenshots** – Run the script (captures both desktop and mobile)
2. **Save to public** – `app/public/{projectId}-desktop.png` and `app/public/{projectId}-mobile.png`
3. **Add project** – Update `app/src/data/projects.ts` with `imageUrlDesktop` and `imageUrlMobile`

## Screenshot Methods

### Method A: Script (recommended)

Run from `app/` directory:

```powershell
cd app
npm run screenshot -- <url> <projectId>
```

Example:

```powershell
cd app
npm run screenshot -- https://example.com myproject
```

Output:
- `app/public/myproject-desktop.png` (1920×1080)
- `app/public/myproject-mobile.png` (390×844)

**First run**: Install Playwright browsers with `npx playwright install chromium` (from `app/`)

### Method B: Browser MCP

When the agent has browser access, capture **two** screenshots at different viewport sizes:

1. **Desktop** (1920×1080):
   - `browser_resize` width 1920, height 1080
   - `browser_navigate` to the site URL
   - `browser_wait_for` 2–3 seconds for content to load
   - `browser_take_screenshot` with `filename: "app/public/{projectId}-desktop.png"` and `fullPage: true`

2. **Mobile** (390×844):
   - `browser_resize` width 390, height 844
   - `browser_navigate` to the site URL (or reload if already there)
   - `browser_wait_for` 2–3 seconds
   - `browser_take_screenshot` with `filename: "app/public/{projectId}-mobile.png"` and `fullPage: true`

## Project Entry Format

Add to `app/src/data/projects.ts`:

```ts
{
  id: "projectid",
  name: "Project Name",
  tags: ["Tag1", "Tag2"],
  description: "Short description in Swedish or English.",
  url: "https://example.com",
  imageUrlDesktop: "/projectid-desktop.png",
  imageUrlMobile: "/projectid-mobile.png",
  colSpan: 1,
  rowSpan: 1,
}
```

- **id**: Lowercase, no spaces (used for image filenames)
- **imageUrlDesktop**: Path from public root, e.g. `"/projectid-desktop.png"`
- **imageUrlMobile**: Path from public root, e.g. `"/projectid-mobile.png"`
- **imageUrl** (legacy): Single image for both viewports; use when only one screenshot exists. Prefer `imageUrlDesktop` + `imageUrlMobile` for responsive display.
- **colSpan/rowSpan**: 1 or 2 for grid layout

## Responsive Display

The site uses `<picture>` with `media="(max-width: 767px)"` to show:
- **Mobile screenshot** when viewport width &lt; 768px
- **Desktop screenshot** when viewport width ≥ 768px

## File Locations

| Item | Path |
|------|------|
| Desktop screenshots | `app/public/{projectId}-desktop.png` |
| Mobile screenshots | `app/public/{projectId}-mobile.png` |
| Project data | `app/src/data/projects.ts` |
| Script | `app/scripts/screenshot-site.mjs` |

## Migrating Existing Projects

For projects that only have `imageUrl` (single screenshot):

1. Run `npm run screenshot -- <url> <projectId>` to generate desktop and mobile variants
2. Update the project entry: replace `imageUrl` with `imageUrlDesktop` and `imageUrlMobile`

## Script Reference

The screenshot script lives at `app/scripts/screenshot-site.mjs`. It captures at two viewports:
- Desktop: 1920×1080
- Mobile: 390×844 (iPhone 14 Pro size)

Execute via `npm run screenshot` from `app/`. For script details or modifications, read the file directly.

## Checklist

- [ ] Desktop and mobile screenshots captured and saved to `app/public/`
- [ ] Project added to `projects.ts` with `imageUrlDesktop` and `imageUrlMobile`
- [ ] Run `npm run lint` in `app/` after changes
