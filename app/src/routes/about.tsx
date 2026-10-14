import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { AtSign, Linkedin, Twitter } from 'lucide-react'
import { ABOUT_DESCRIPTION, aboutPageJsonLd, buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/about')({
  head: () =>
    buildPageMeta({
      title: 'Om',
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
            Produktbyggare som tar idéer från noll till betalande kunder, med AI.
          </p>
        </header>

        <div className="space-y-6 text-lg text-foreground/80 font-light leading-relaxed">
          <p>
            Jag heter Glenn Svanberg. Jag bor i Göteborg och växte upp i
            Fjällbacka.
          </p>
          <p>
            Det jag gillar mest är att gå från noll till ett tillsammans med
            riktiga kunder. Hitta ett problem som faktiskt finns, bygga en MVP
            och ta den till marknaden.
          </p>
          <p>
            På dagarna är jag utvecklare och konsult, och förespråkar
            innovation, på ett konsultbolag inom produktinformation. Där har
            jag tagit flera AI- och dataprodukter hela vägen från idé till
            betalande kunder.
          </p>
          <p>
            Vid sidan av är jag indie hacker under varumärket Inventing. Där
            bygger jag SaaS och lekfulla experiment. Samma rörelse, bara mer
            fritt: testa, lära, se vad som bär.
          </p>
          <p>
            Den här sidan är min egen plats för det. Appar, experiment och
            tankar. Inte en konsultbroschyr.
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
