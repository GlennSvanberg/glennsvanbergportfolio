import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from "convex/react";
import { ArrowLeft, Check, Share2 } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { buildBlogPostingJsonLd, buildPageMeta } from '~/lib/seo'

export const Route = createFileRoute('/blog/$slug')({
  head: ({ params }) =>
    buildPageMeta({
      title: `Blogg: ${params.slug.replace(/-/g, ' ')}`,
      description: 'Las ett blogginlagg fran Glenn Svanbergs experiment och projekt.',
      path: `/blog/${params.slug}`,
      ogType: 'article',
    }),
  component: BlogPost,
})

function BlogPost() {
  const { slug } = Route.useParams();
  const post = useQuery(api.posts.getBySlug, { slug });
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = typeof window !== "undefined" ? `${window.location.origin}/blog/${slug}` : "";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      if (typeof window !== "undefined") {
        const input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  }

  if (post === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-muted font-mono animate-pulse">
        Laddar...
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] text-foreground">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-4">Inlägget hittades inte</h1>
        <Link to="/blog" className="text-primary font-mono uppercase tracking-widest hover:text-emerald-400 transition-colors">
          Tillbaka till bloggen
        </Link>
      </div>
    );
  }

  const blogPostingJsonLd = buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    body: post.body,
    tags: post.tags,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
  })

  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] py-16 md:py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <article className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-3 text-muted/60 hover:text-emerald-400 font-mono text-sm uppercase tracking-widest mb-12 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Tillbaka
        </Link>

        <header className="mb-16">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
            <span className="text-muted/60 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/10">
              {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-primary/10 hover:border-emerald-400/50 text-muted/60 hover:text-emerald-400 transition-colors duration-300"
              title="Kopiera länk"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase text-foreground leading-tight">
            {post.title}
          </h1>
        </header>

        <div className="prose-container relative">
          {/* Subtle line indicator for content */}
          <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-primary/20 hidden md:block" />
          
          <div className="md:pl-8 lg:pl-12 w-full max-w-3xl">
            {post.excerpt && (
              <p className="text-xl md:text-2xl text-muted/90 font-light leading-relaxed mb-12 italic border-l-2 border-emerald-400 pl-6">
                {post.excerpt}
              </p>
            )}

            <div className="markdown-content text-lg text-foreground/80 leading-relaxed font-light space-y-8">
              <MarkdownRenderer>
                {post.body.replace(/^\s*#\s+[^\n]+/, '')}
              </MarkdownRenderer>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
