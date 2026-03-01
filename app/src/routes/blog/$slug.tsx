import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ReactMarkdown from "react-markdown";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPost,
})

function BlogPost() {
  const { slug } = Route.useParams();
  const post = useQuery(api.posts.getBySlug, { slug });

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

  return (
    <main className="min-h-screen flex flex-col bg-[var(--background)] py-16 md:py-24">
      <article className="container mx-auto px-4 md:px-8 max-w-4xl">
        <Link 
          to="/blog" 
          className="inline-flex items-center gap-3 text-muted/60 hover:text-emerald-400 font-mono text-sm uppercase tracking-widest mb-12 transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          Tillbaka
        </Link>

        <header className="mb-16">
          <div className="flex flex-wrap gap-3 mb-8">
            {post.tags.map((tag) => (
              <span key={tag} className="text-primary bg-primary/5 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/20">
                {tag}
              </span>
            ))}
            <span className="text-muted/60 font-mono text-xs tracking-widest uppercase px-3 py-1 rounded-full border border-primary/10">
              {new Date(post.publishedAt).toLocaleDateString("sv-SE", { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
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
              <ReactMarkdown
                components={{
                  h1: ({node, ...props}) => <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-foreground mt-16 mb-8" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground mt-12 mb-6" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground mt-10 mb-4" {...props} />,
                  p: ({node, ...props}) => <p className="mb-6 leading-relaxed" {...props} />,
                  a: ({node, ...props}) => <a className="text-emerald-400 hover:text-emerald-300 underline decoration-primary/30 hover:decoration-emerald-400 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-emerald-400" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-emerald-400" {...props} />,
                  li: ({node, ...props}) => <li className="pl-2" {...props} />,
                  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-400/50 pl-6 italic my-8 text-muted" {...props} />,
                  code: ({node, inline, className, children, ...props}: any) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline ? (
                      <div className="rounded-xl overflow-hidden my-8 border border-primary/20 bg-black">
                        <div className="bg-primary/5 px-4 py-2 text-xs font-mono text-muted/60 uppercase tracking-widest border-b border-primary/10">
                          {match ? match[1] : 'Code'}
                        </div>
                        <pre className="p-4 overflow-x-auto text-sm text-emerald-300/90 font-mono">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    ) : (
                      <code className="font-mono text-sm bg-primary/10 text-emerald-400 px-1.5 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {post.body}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    </main>
  )
}
