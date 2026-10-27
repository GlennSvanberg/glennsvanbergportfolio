import { Resvg } from '@resvg/resvg-js'
import {
  OG_CONTENT_WIDTH,
  buildBlogOgSvg,
  buildDefaultOgSvg,
  escapeXml,
} from './ogCard.ts'

const TITLE_FONT_SIZES = [84, 72, 64, 56, 48, 42] as const
const TITLE_MAX_LINES = 4
const TITLE_LETTER_SPACING = -1.5

function fontOptions(fontFiles: Array<string>) {
  return {
    loadSystemFonts: false,
    fontFiles,
    defaultFontFamily: 'Inter',
    sansSerifFamily: 'Inter',
  }
}

export function renderSvgToPng(svg: string, fontFiles: Array<string>): Buffer {
  const resvg = new Resvg(svg, {
    font: fontOptions(fontFiles),
    fitTo: { mode: 'width', value: 1200 },
    textRendering: 1,
  })
  const png = resvg.render().asPng()
  if (png.length < 1000) {
    throw new Error('OG image render produced an empty PNG')
  }
  return png
}

function measureText(
  text: string,
  fontSize: number,
  fontFiles: Array<string>,
): number {
  if (text.length === 0) {
    return 0
  }
  const svg = `<svg width="4000" height="400" xmlns="http://www.w3.org/2000/svg"><text x="0" y="200" font-family="Inter" font-weight="900" font-size="${fontSize}" letter-spacing="${TITLE_LETTER_SPACING}">${escapeXml(text)}</text></svg>`
  const box = new Resvg(svg, { font: fontOptions(fontFiles) }).getBBox()
  if (!box || box.width < 1) {
    return text.length * fontSize * 0.62
  }
  return box.width
}

function wrapWords(
  words: Array<string>,
  fontSize: number,
  fontFiles: Array<string>,
  maxLines?: number,
): Array<string> | null {
  const lines: Array<string> = []
  let current = ''

  for (const word of words) {
    if (measureText(word, fontSize, fontFiles) > OG_CONTENT_WIDTH) {
      return null
    }
    const next = current ? `${current} ${word}` : word
    if (measureText(next, fontSize, fontFiles) > OG_CONTENT_WIDTH && current) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }
  if (current) {
    lines.push(current)
  }

  if (maxLines !== undefined && lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    let last = kept[maxLines - 1] ?? ''
    while (
      last.length > 0 &&
      measureText(`${last}…`, fontSize, fontFiles) > OG_CONTENT_WIDTH
    ) {
      last = last.slice(0, -1).trimEnd()
    }
    kept[maxLines - 1] = last.length > 0 ? `${last}…` : '…'
    return kept
  }

  return lines
}

export function layoutBlogTitle(
  title: string,
  fontFiles: Array<string>,
): { lines: Array<string>; fontSize: number } {
  const normalized = title
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180)
    .toUpperCase()
  const words = (normalized.length > 0 ? normalized : 'INLÄGG').split(' ')

  for (const fontSize of TITLE_FONT_SIZES) {
    const lines = wrapWords(words, fontSize, fontFiles)
    if (lines && lines.length <= TITLE_MAX_LINES) {
      return { lines, fontSize }
    }
  }

  const fontSize = TITLE_FONT_SIZES[TITLE_FONT_SIZES.length - 1]
  const lines = wrapWords(words, fontSize, fontFiles, TITLE_MAX_LINES)
  if (lines) {
    return { lines, fontSize }
  }

  const hard = normalized.slice(0, 48)
  return { lines: [hard.length > 0 ? `${hard}…` : 'INLÄGG'], fontSize }
}

export function renderDefaultOgPng(fontFiles: Array<string>): Buffer {
  return renderSvgToPng(buildDefaultOgSvg(), fontFiles)
}

export function renderBlogOgPng(
  title: string,
  fontFiles: Array<string>,
): Buffer {
  const { lines, fontSize } = layoutBlogTitle(title, fontFiles)
  return renderSvgToPng(buildBlogOgSvg(lines, fontSize), fontFiles)
}
