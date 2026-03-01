import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  Link,
} from '@tanstack/react-router'
import * as React from 'react'
import type { QueryClient } from '@tanstack/react-query'
import appCss from '~/styles/app.css?url'

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
        title: 'Glenn Svanberg',
      },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
      { rel: 'manifest', href: '/site.webmanifest', color: '#000000' },
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon-32x32.png' },
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
    <html>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
