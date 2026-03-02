export const SITE_NAME = 'Glenn Svanberg'
export const SITE_URL = 'https://glennsvanberg.se'
export const SITE_LANGUAGE = 'sv-SE'
export const SITE_LOCALE = 'sv_SE'

export const DEFAULT_DESCRIPTION =
  'Personlig portfolio av Glenn Svanberg med experiment, appar, ideer och blogginlagg.'
export const DEFAULT_ROBOTS =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
export const NOINDEX_ROBOTS =
  'noindex,nofollow,noarchive,nosnippet,noimageindex'

export function absoluteUrl(path: string = '/'): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  if (normalizedPath === '/') {
    return `${SITE_URL}/`
  }
  return `${SITE_URL}${normalizedPath}`
}

export function buildPageTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return SITE_NAME
  }
  return `${pageTitle} | ${SITE_NAME}`
}

type PageMetaInput = {
  title?: string
  description?: string
  path?: string
  robots?: string
  ogType?: 'website' | 'article'
}

export function buildPageMeta(input: PageMetaInput) {
  const title = buildPageTitle(input.title)
  const description = input.description ?? DEFAULT_DESCRIPTION
  const url = absoluteUrl(input.path ?? '/')

  return {
    meta: [
      { title },
      { name: 'description', content: description },
      { name: 'robots', content: input.robots ?? DEFAULT_ROBOTS },
      { property: 'og:locale', content: SITE_LOCALE },
      { property: 'og:type', content: input.ogType ?? 'website' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
    ],
    links: [{ rel: 'canonical', href: url }],
  }
}

export const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: absoluteUrl('/'),
}

export const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  inLanguage: SITE_LANGUAGE,
  url: absoluteUrl('/'),
}

export const blogJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: `${SITE_NAME} Blogg`,
  inLanguage: SITE_LANGUAGE,
  url: absoluteUrl('/blog'),
  publisher: {
    '@type': 'Person',
    name: SITE_NAME,
    url: absoluteUrl('/'),
  },
}

function summarizeText(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) {
    return normalized
  }
  return `${normalized.slice(0, maxLength - 1)}…`
}

function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/[#>*_~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

type BlogPostingInput = {
  slug: string
  title: string
  excerpt?: string
  body: string
  tags: Array<string>
  publishedAt: number
  updatedAt?: number
}

export function buildBlogPostingJsonLd(post: BlogPostingInput) {
  const descriptionSource =
    post.excerpt && post.excerpt.trim().length > 0
      ? post.excerpt
      : stripMarkdown(post.body)
  const description = summarizeText(descriptionSource, 180)
  const url = absoluteUrl(`/blog/${post.slug}`)
  const publishedAtIso = new Date(post.publishedAt).toISOString()
  const updatedAtIso = new Date(post.updatedAt ?? post.publishedAt).toISOString()

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    inLanguage: SITE_LANGUAGE,
    url,
    datePublished: publishedAtIso,
    dateModified: updatedAtIso,
    keywords: post.tags,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    publisher: {
      '@type': 'Person',
      name: SITE_NAME,
      url: absoluteUrl('/'),
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}
