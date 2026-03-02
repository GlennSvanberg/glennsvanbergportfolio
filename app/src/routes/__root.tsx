import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_ROBOTS,
  SITE_NAME,
  personJsonLd,
  webSiteJsonLd,
} from '~/lib/seo'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        name: 'theme-color',
        content: '#000000',
      },
      {
        title: SITE_NAME,
      },
      {
        name: 'description',
        content: DEFAULT_DESCRIPTION,
      },
      {
        name: 'robots',
        content: DEFAULT_ROBOTS,
      },
      {
        property: 'og:locale',
        content: 'sv_SE',
      },
      {
        property: 'og:site_name',
        content: SITE_NAME,
      },
      {
        name: 'twitter:card',
        content: 'summary',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/site.webmanifest' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
    ],
  }),
  notFoundComponent: () => <div>Sidan hittades inte</div>,
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="flex flex-col min-h-screen">
        <header className="border-b border-primary/10 bg-[var(--background)] text-[var(--foreground)] px-4 py-3 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="font-mono uppercase tracking-widest text-sm hover:text-emerald-400 transition-colors">
              Glenn Svanberg
            </Link>
            <nav>
              <Link to="/blog" className="font-mono uppercase tracking-widest text-sm text-muted hover:text-emerald-400 transition-colors">
                Blog
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
