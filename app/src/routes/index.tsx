import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ExploratoryProjects } from '../components/ExploratoryProjects'
import { buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/')({
  validateSearch: (raw: Record<string, unknown>): { q?: string; tag?: string } => {
    const qRaw = raw.q;
    const tagRaw = raw.tag;
    const q = typeof qRaw === 'string' ? qRaw.trim() : undefined;
    const tag = typeof tagRaw === 'string' ? tagRaw.trim() : undefined;
    return {
      q: q || undefined,
      tag: tag || undefined,
    };
  },
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

  const { q, tag } = Route.useSearch();
  const navigate = Route.useNavigate();

  const featuredPosts = useQuery(api.posts.listFeatured) ?? [];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[var(--background)]">
      {/* Hero Section */}
      <section className="h-screen w-full flex flex-col items-center justify-center relative px-4 text-center">
        <h1 className="text-7xl md:text-[9rem] font-black tracking-tighter uppercase text-white mb-6">
          Glenn <span className="block md:inline">Svanberg</span>
        </h1>
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
        
      </section>

      {/* Projects */}
      <ExploratoryProjects
        posts={featuredPosts}
        searchQuery={q ?? ''}
        activeTag={tag ?? null}
        onSearchQueryChange={(value) =>
          navigate({
            search: (prev) => ({ ...prev, q: value.trim() ? value : undefined }),
            replace: true,
            resetScroll: false,
          })
        }
        onActiveTagChange={(next) =>
          navigate({
            search: (prev) => ({ ...prev, tag: next ?? undefined }),
            replace: true,
            resetScroll: false,
          })
        }
        onClearFilters={() =>
          navigate({
            search: (prev) => ({ ...prev, q: undefined, tag: undefined }),
            replace: true,
            resetScroll: false,
          })
        }
      />
    </main>
  )
}
