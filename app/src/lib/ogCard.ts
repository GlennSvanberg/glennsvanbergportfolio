export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const OG_CONTENT_WIDTH = 1040
export const OG_PADDING_X = 80

const BG = '#0D1117'
const FOREGROUND = '#EDEDED'
const EMERALD = '#34d399'
const GRID = '#39FF14'

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function background(): string {
  return `
  <defs>
    <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
      <path d="M 64 0 L 0 0 0 64" fill="none" stroke="${GRID}" stroke-opacity="0.16" stroke-width="1"/>
    </pattern>
    <radialGradient id="fade" cx="50%" cy="42%" r="58%">
      <stop offset="0%" stop-color="white"/>
      <stop offset="70%" stop-color="white" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="white" stop-opacity="0"/>
    </radialGradient>
    <mask id="gridmask">
      <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#fade)"/>
    </mask>
    <radialGradient id="glow" cx="50%" cy="18%" r="55%">
      <stop offset="0%" stop-color="${EMERALD}" stop-opacity="0.28"/>
      <stop offset="55%" stop-color="${EMERALD}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="${EMERALD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${BG}"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glow)"/>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#grid)" mask="url(#gridmask)"/>
  <rect width="${OG_WIDTH}" height="5" fill="${EMERALD}"/>`
}

export function buildDefaultOgSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
${background()}
  <text x="600" y="292" text-anchor="middle" font-family="Inter" font-weight="900" font-size="92" fill="#ffffff" letter-spacing="-2.5">GLENN SVANBERG</text>
  <text x="600" y="372" text-anchor="middle" font-family="Inter" font-weight="400" font-size="36" fill="${FOREGROUND}">Jag älskar att testa saker</text>
  <rect x="390" y="404" width="420" height="4" rx="2" fill="${EMERALD}"/>
</svg>`
}

export function buildBlogOgSvg(lines: Array<string>, fontSize: number): string {
  const lineHeight = Math.round(fontSize * 1.12)
  const titleBlock = lines.length * lineHeight
  const kickerBlock = 56
  const gap = 28
  const groupHeight = kickerBlock + gap + titleBlock
  const groupTop = Math.max(72, Math.round((OG_HEIGHT - groupHeight) / 2))
  const kickerBaseline = groupTop + 28
  const ruleY = kickerBaseline + 22
  const firstBaseline = ruleY + gap + fontSize * 0.78
  const title = lines
    .map((line, index) => {
      const y = Math.round(firstBaseline + index * lineHeight)
      return `  <text x="${OG_PADDING_X}" y="${y}" font-family="Inter" font-weight="900" font-size="${fontSize}" fill="#ffffff" letter-spacing="-1.5">${escapeXml(line)}</text>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
${background()}
  <text x="${OG_PADDING_X}" y="${kickerBaseline}" font-family="Inter" font-weight="400" font-size="24" fill="${EMERALD}" letter-spacing="6">GLENN SVANBERG</text>
  <rect x="${OG_PADDING_X}" y="${ruleY}" width="72" height="4" rx="2" fill="${EMERALD}"/>
${title}
</svg>`
}
