import { createFileRoute } from '@tanstack/react-router'
import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import { absoluteUrl } from '~/lib/seo'

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const convexUrl = process.env.VITE_CONVEX_URL
        if (!convexUrl) {
          throw new Error('VITE_CONVEX_URL is required for sitemap')
        }
        const client = new ConvexHttpClient(convexUrl)
        const posts = await client.query(api.posts.listForSitemap)

        const postUrls = (posts ?? []).map(
          (post) => `
  <url>
    <loc>${absoluteUrl(`/blog/${post.slug}`)}</loc>
    <lastmod>${new Date(post.updatedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
        ).join('')

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${absoluteUrl('/')}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${absoluteUrl('/blog')}</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
${postUrls}
</urlset>`

        return new Response(sitemap, {
          headers: {
            'Content-Type': 'application/xml',
          },
        })
      },
    },
  },
})
