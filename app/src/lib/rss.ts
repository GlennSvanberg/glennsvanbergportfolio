import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../convex/_generated/api'
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from '~/lib/seo'

const RSS_CONTENT_TYPE = 'application/rss+xml; charset=utf-8'

type RssPost = {
  slug: string
  title: string
  excerpt?: string
  publishedAt: number
}

function getRssConvexUrl(): string | undefined {
  return (
    import.meta.env.VITE_CONVEX_URL ||
    process.env.VITE_CONVEX_URL ||
    process.env.CONVEX_URL
  )
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

async function fetchPostsForRss(): Promise<Array<RssPost>> {
  const convexUrl = getRssConvexUrl()
  if (!convexUrl) {
    console.error(
      '[rss] Convex URL missing (VITE_CONVEX_URL / CONVEX_URL); serving empty feed',
    )
    return []
  }

  try {
    const client = new ConvexHttpClient(convexUrl)
    const posts = await client.query(api.posts.list, {})
    return posts.map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
    }))
  } catch (error) {
    console.error('[rss] posts.list failed; serving empty feed', error)
    return []
  }
}

function buildRssXml(posts: Array<RssPost>): string {
  const items = posts
    .map((post) => {
      const link = absoluteUrl(`/blog/${post.slug}`)
      const description = post.excerpt?.trim() || post.title
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
      <author>${escapeXml(SITE_NAME)}</author>
    </item>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(absoluteUrl('/'))}</link>
    <description>${escapeXml(DEFAULT_DESCRIPTION)}</description>
    <language>sv-SE</language>${items}
  </channel>
</rss>
`
}

export async function renderRssResponse(): Promise<Response> {
  try {
    const posts = await fetchPostsForRss()
    return new Response(buildRssXml(posts), {
      status: 200,
      headers: {
        'Content-Type': RSS_CONTENT_TYPE,
      },
    })
  } catch (error) {
    console.error('[rss] unexpected failure; serving empty feed', error)
    return new Response(buildRssXml([]), {
      status: 200,
      headers: {
        'Content-Type': RSS_CONTENT_TYPE,
      },
    })
  }
}
