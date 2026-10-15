import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import { absoluteUrl } from '~/lib/seo'

type SitemapPost = { slug: string; updatedAt: number }

function getSitemapConvexUrl(): string | undefined {
  return (
    import.meta.env.VITE_CONVEX_URL ||
    process.env.VITE_CONVEX_URL ||
    process.env.CONVEX_URL
  )
}

async function fetchPostsForSitemap(): Promise<Array<SitemapPost>> {
  const convexUrl = getSitemapConvexUrl()
  if (!convexUrl) {
    console.error(
      '[sitemap] Convex URL missing (VITE_CONVEX_URL / CONVEX_URL); serving static URLs only',
    )
    return []
  }

  try {
    const client = new ConvexHttpClient(convexUrl)
    return await client.query(api.posts.listForSitemap)
  } catch (error) {
    console.error('[sitemap] listForSitemap failed; serving static URLs only', error)
    return []
  }
}

function buildSitemapXml(posts: Array<SitemapPost>): string {
  const postUrls = posts
    .map(
      (post) => `
  <url>
    <loc>${absoluteUrl(`/blog/${post.slug}`)}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${absoluteUrl('/')}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${absoluteUrl('/about')}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${absoluteUrl('/blog')}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${postUrls}
</urlset>`
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const posts = await fetchPostsForSitemap()
        const sitemap = buildSitemapXml(posts)

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        })
      },
    },
  },
})
