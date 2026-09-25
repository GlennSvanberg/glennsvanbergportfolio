import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ExploratoryProjects } from '../components/ExploratoryProjects'
import { buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/')({
  head: () =>
    buildPageMeta({
      title: 'Portfolio och experiment',
      description:
        'Glenn Svanbergs portfolio med appar, experiment och blogginlagg om byggande, larande och ideer.',
      path: '/',
    }),
  component: Home,
})

function Home() {
  const [activeWordIndex, setActiveWordIndex] = useState(2);
  const words = ["Experiment", "Appar", "Idéer"];
  const heroRef = useRef<HTMLElement>(null);

  const featuredPosts = useQuery(api.posts.listFeatured) ?? [];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, [words.length]);

  // Hero parallax: hero content fades/lifts faster than scroll,
  // background layers drift slower — creates depth.
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(heroProgress, [0, 1], ["0%", "35%"]);
  const heroContentOpacity = useTransform(heroProgress, [0, 0.7], [1, 0]);
  const heroContentScale = useTransform(heroProgress, [0, 1], [1, 0.92]);
  const heroTitleY = useTransform(heroProgress, [0, 1], ["0%", "60%"]);
  const heroBgY = useTransform(heroProgress, [0, 1], ["0%", "20%"]);
  const heroBlobAY = useTransform(heroProgress, [0, 1], ["0%", "45%"]);
  const heroBlobBY = useTransform(heroProgress, [0, 1], ["0%", "-25%"]);
  const heroGhostX = useTransform(heroProgress, [0, 1], ["0%", "-12%"]);
  const scrollCueOpacity = useTransform(heroProgress, [0, 0.25], [1, 0]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--background)]">
      {/* Hero Section with layered parallax */}
      <section ref={heroRef} className="h-[110vh] w-full flex flex-col items-center justify-center relative px-4 text-center overflow-hidden">
        {/* Layer 1 (slowest): aurora blobs */}
        <motion.div style={{ y: heroBlobAY }} className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-emerald-500/10 blur-[120px]" />
        </motion.div>
        <motion.div style={{ y: heroBlobBY }} className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute bottom-0 -left-32 w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-teal-400/5 blur-[100px]" />
          <div className="absolute top-1/4 -right-32 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-emerald-300/5 blur-[100px]" />
        </motion.div>
        {/* Layer 2: grid that drifts slightly */}
        <motion.div
          style={{ y: heroBgY }}
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.15] [background-image:linear-gradient(to_right,rgba(57,255,20,0.25)_1px,transparent_1px),linear-gradient(to_bottom,rgba(57,255,20,0.25)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]"
        />
        {/* Layer 3: giant ghost text drifting horizontally */}
        <motion.div
          style={{ x: heroGhostX }}
          aria-hidden
          className="absolute top-[8%] left-0 whitespace-nowrap text-[18vw] font-black uppercase leading-none text-white/[0.025] pointer-events-none select-none"
        >
          Bygger · Testar · Spånar · Bygger · Testar · Spånar
        </motion.div>

        {/* Foreground content (fastest): lifts + fades on scroll */}
        <motion.div style={{ y: heroContentY, opacity: heroContentOpacity, scale: heroContentScale }} className="relative z-10 flex flex-col items-center">
          <motion.h1 style={{ y: heroTitleY }} className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase text-white mb-6">
            Glenn <span className="block md:inline">Svanberg</span>
          </motion.h1>
          <p className="text-xl md:text-3xl text-muted font-mono max-w-3xl lowercase tracking-widest border-b border-primary/30 pb-4 flex items-center justify-center gap-2 md:gap-4 flex-wrap">
            {words.map((word, index) => (
              <span key={word} className="flex items-center gap-2 md:gap-4">
                <span
                  className={`transition-all duration-500 ${
                    index === activeWordIndex
                      ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)] font-bold scale-110"
                      : "text-muted font-normal scale-100"
                  }`}
                >
                  {word}
                </span>
                {index < words.length - 1 && <span className="text-muted/50">/</span>}
              </span>
            ))}
          </p>
          <p className="mt-6 max-w-xl text-sm md:text-base text-muted/70 font-light leading-relaxed">
            Jag bygger appar, verktyg och lekfulla experiment — scrolla ner och kika runt.
          </p>
        </motion.div>

        {/* Scroll cue that fades out immediately on scroll */}
        <motion.div style={{ opacity: scrollCueOpacity }} className="absolute bottom-24 z-10 flex flex-col items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted/70">Scrolla</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 rounded-full border border-primary/30 flex justify-center pt-2"
          >
            <div className="w-1 h-2 rounded-full bg-emerald-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Projects */}
      <ExploratoryProjects
        posts={featuredPosts}
      />
    </main>
  )
}
