import ReactMarkdown from "react-markdown";

export function MarkdownRenderer({ children }: { children: string }) {
  return (
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
      {children}
    </ReactMarkdown>
  );
}
