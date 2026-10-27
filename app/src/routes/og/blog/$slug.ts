import { createFileRoute } from '@tanstack/react-router'
import { fetchBlogPostBySlug } from '~/lib/convexServer'

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function pngResponse(png: Buffer): Response {
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export const Route = createFileRoute('/og/blog/$slug')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const { renderBlogOgPng, renderDefaultOgPng } =
          await import('~/lib/renderOgPng')
        const { ogFontFiles } = await import('~/lib/ogFontFiles.server')
        const fontFiles = ogFontFiles()

        try {
          if (!SLUG_PATTERN.test(params.slug)) {
            return pngResponse(renderDefaultOgPng(fontFiles))
          }
          const post = await fetchBlogPostBySlug(params.slug)
          if (!post) {
            return pngResponse(renderDefaultOgPng(fontFiles))
          }
          return pngResponse(renderBlogOgPng(post.title, fontFiles))
        } catch (error) {
          console.error('[og] failed to render blog image', error)
          try {
            return pngResponse(renderDefaultOgPng(fontFiles))
          } catch (fallbackError) {
            console.error('[og] default image fallback failed', fallbackError)
            return new Response('OG image failed', { status: 500 })
          }
        }
      },
    },
  },
})
