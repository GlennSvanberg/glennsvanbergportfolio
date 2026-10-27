import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { interBlackBase64, interRegularBase64 } from './ogFonts.generated.ts'

let cached: Array<string> | undefined

export function ogFontFiles(): Array<string> {
  if (cached) {
    return cached
  }

  const dir = join(tmpdir(), 'glennsvanberg-og-fonts')
  mkdirSync(dir, { recursive: true })
  const files = [
    ['Inter-Black.ttf', interBlackBase64],
    ['Inter-Regular.ttf', interRegularBase64],
  ] as const
  const paths: Array<string> = []
  for (const [name, base64] of files) {
    const path = join(dir, name)
    if (!existsSync(path)) {
      writeFileSync(path, Buffer.from(base64, 'base64'))
    }
    paths.push(path)
  }
  cached = paths
  return paths
}
