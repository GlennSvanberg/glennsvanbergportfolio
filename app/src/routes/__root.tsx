import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import * as React from 'react'
import { AtSign, Linkedin, Phone, Twitter } from 'lucide-react'
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
            <Link
              to="/"
              trackaton-on-click="nav-home"
              className="font-mono uppercase tracking-widest text-sm hover:text-emerald-400 transition-colors"
            >
              Glenn Svanberg
            </Link>
            <nav>
              <Link
                to="/blog"
                trackaton-on-click="nav-blog"
                className="font-mono uppercase tracking-widest text-sm text-muted hover:text-emerald-400 transition-colors"
              >
                Blog
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="border-t border-primary/10 bg-[var(--background)]">
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="font-mono uppercase tracking-widest text-xs text-muted">
                  Kontakt
                </p>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Let&apos;s build something great
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="mailto:signeratsvanberg@gmail.com"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                >
                  <AtSign className="h-4 w-4" />
                  signeratsvanberg@gmail.com
                </a>
                <a
                  href="tel:+46735029113"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +46 735 029 113
                </a>
                <a
                  href="https://x.com/GlennSvanberg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  @GlennSvanberg
                </a>
                <a
                  href="https://www.linkedin.com/in/glenn-svanberg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-emerald-400 hover:text-emerald-400 transition-colors"
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <meta
          name="google-site-verification"
          content="2ExHAhWJb7V-X99Ywj7kbUOq0F3ntivTe_TToxdXXCc"
        />
        <script
          src="https://www.trackaton.com/track.js"
          data-website-id="jd72ctkphffch0p4g19c0jcehh827hjz"
          data-endpoint="https://resolute-orca-949.convex.site/api/e"
          async
        />
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
