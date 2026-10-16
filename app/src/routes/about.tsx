import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AtSign, Linkedin, Twitter } from 'lucide-react'
import { ABOUT_DESCRIPTION, aboutPageJsonLd, buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    buildPageMeta({
      title: 'Om Glenn Svanberg',
      description: ABOUT_DESCRIPTION,
      path: '/about',
    }),
  component: AboutPage,
})

function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }}
      />
      <article className="container mx-auto px-4 md:px-8 max-w-3xl">
        <header className="mb-12 md:mb-16">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-mono uppercase tracking-[0.3em] text-xs text-emerald-400 mb-4"
          >
            Göteborg
          </motion.p>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase text-foreground">
            Om Glenn
          </h1>
          <p className="mt-8 text-xl md:text-2xl text-muted/90 font-light leading-relaxed border-l-2 border-emerald-400 pl-6">
            Jag älskar att testa ny teknik och nya sätt att göra saker på.
          </p>
        </header>

        <div className="space-y-6 text-lg text-foreground/80 font-light leading-relaxed">
          <p>Jag heter Glenn Svanberg och bor i Göteborg.</p>
          <p>
            Det som driver mig är att förstå hur saker kan göras smartare med ny
            teknik. Jag bygger hellre något och testar än läser om det.
          </p>
          <p>
            Jag experimenterar med appar, verktyg, AI-agenter och lekfulla idéer.
            Vissa blir något, de flesta blir lärdomar.
          </p>
          <p>
            Den här sidan är min plats för experimenten och tankarna. Inte en
            konsultbroschyr.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/blog"
            trackaton-on-click="about-blog"
            className="inline-flex items-center rounded-md bg-emerald-400 px-4 py-2 font-mono text-xs uppercase tracking-widest text-black hover:bg-emerald-300 transition-colors"
          >
            Blogg
          </Link>
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
          <a
            href="mailto:glenn@inventing.se"
            className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted hover:border-emerald-400 hover:text-emerald-400 transition-colors"
          >
            <AtSign className="h-4 w-4" />
            glenn@inventing.se
          </a>
        </div>
      </article>
    </main>
  )
}
