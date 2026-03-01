import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAdminToken, clearAdminToken } from "~/lib/useAdminToken";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { BlogWriteChat } from "~/components/BlogWriteChat";
import { applyPatch } from "~/lib/patch";

export const Route = createFileRoute("/admin/blog/")({
  component: BlogStudio,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[åä]/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function BlogStudio() {
  const token = useAdminToken();
  const navigate = useNavigate();
  const posts = useQuery(
    api.posts.listForAdmin,
    token ? { token } : "skip"
  );
  const createMutation = useMutation(api.posts.create);
  const updateMutation = useMutation(api.posts.update);
  const deleteMutation = useMutation(api.posts.remove);
  const setFeaturedMutation = useMutation(api.posts.setFeaturedOrder);

  const [editingId, setEditingId] = useState<Id<"posts"> | "new" | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/admin/login" });
    }
  }, [token, navigate]);

  function startNew() {
    setEditingId("new");
    setTitle("");
    setSlug("");
    setExcerpt("");
    setBody("");
    setTags("");
    setError(null);
    setIsChatOpen(false);
  }

  function startEdit(
    id: Id<"posts">,
    post: { title: string; slug: string; excerpt?: string; body: string; tags: string[] }
  ) {
    setEditingId(id);
    setTitle(post.title);
    setSlug(post.slug);
    setExcerpt(post.excerpt ?? "");
    setBody(post.body);
    setTags(post.tags.join(", "));
    setError(null);
    setIsChatOpen(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function onTitleChange(value: string) {
    setTitle(value);
    if (editingId === "new" || !slug || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  }

  async function handleSave() {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      if (editingId === "new") {
        await createMutation({
          token,
          title,
          slug: slug || slugify(title),
          excerpt: excerpt || undefined,
          body,
          tags: tagList,
        });
      } else if (editingId !== null) {
        await updateMutation({
          token,
          id: editingId,
          title,
          slug: slug || slugify(title),
          excerpt: excerpt || undefined,
          body,
          tags: tagList,
        });
      }
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"posts">) {
    if (!token) return;
    if (!confirm("Delete this post?")) return;
    try {
      await deleteMutation({ token, id });
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function handleLogout() {
    clearAdminToken();
    navigate({ to: "/admin/login" });
  }

  function handleUseDraft(draftBody: string, draftTitle?: string) {
    const t = draftTitle ?? "Untitled";
    setBody(draftBody);
    if (!title) {
      setTitle(t);
      setSlug(slugify(t));
    }
    setError(null);
  }

  function handleApplyPatch(patch: string): Promise<{ ok: boolean; error?: string }> {
    setShowPreview(false);
    setIsChatOpen(false);

    const result = applyPatch(body, patch);
    if (result.ok) {
      setBody(result.text);
      requestAnimationFrame(() => {
        textareaRef.current?.focus({ preventScroll: true });
      });
      return Promise.resolve({ ok: true });
    }
    return Promise.resolve({ ok: false, error: result.error });
  }

  if (!token) return null;

  if (editingId) {
    return (
      <div className="flex flex-col flex-1 min-h-0 py-4 w-full mx-auto max-w-[1920px]">
        <div className="flex items-center justify-between gap-4 shrink-0 mb-4 px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={cancelEdit}
              className="text-sm font-mono text-muted hover:text-foreground transition-colors"
            >
              ← Back
            </button>
            <h2 className="text-xl font-bold uppercase tracking-tight">
              {editingId === "new" ? "New post" : "Edit post"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
             <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="lg:hidden px-3 py-2 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest rounded hover:bg-emerald-500/10 transition-colors"
             >
                {isChatOpen ? "Close Chat" : "AI Chat"}
             </button>
             <button
               onClick={handleSave}
               disabled={saving}
               className="min-h-[44px] px-6 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
             >
               {saving ? "Saving..." : "Save"}
             </button>
          </div>
        </div>
        
        {error && (
          <p className="text-red-500 text-sm px-4 mb-4" role="alert">{error}</p>
        )}

        <div className="flex-1 min-h-0 flex gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Editor Side */}
          <div className={`flex-1 flex flex-col min-h-0 gap-4 ${isChatOpen ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <div className="flex-1">
                 <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Title</label>
                 <input
                   type="text"
                   value={title}
                   onChange={(e) => onTitleChange(e.target.value)}
                   className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground outline-none transition-colors"
                   placeholder="Post title"
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Slug</label>
                 <input
                   type="text"
                   value={slug}
                   onChange={(e) => setSlug(e.target.value)}
                   className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground font-mono text-sm outline-none transition-colors"
                   placeholder="url-slug"
                 />
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
               <div className="flex-1">
                 <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Excerpt</label>
                 <input
                   type="text"
                   value={excerpt}
                   onChange={(e) => setExcerpt(e.target.value)}
                   className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground outline-none transition-colors"
                   placeholder="Short summary"
                 />
               </div>
               <div className="flex-1">
                 <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Tags (comma-separated)</label>
                 <input
                   type="text"
                   value={tags}
                   onChange={(e) => setTags(e.target.value)}
                   className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground outline-none transition-colors"
                   placeholder="AI, Realtid, ..."
                 />
               </div>
            </div>

            <div className="flex-1 flex flex-col min-h-0 border border-primary/20 focus-within:border-emerald-500/50 rounded-lg overflow-hidden transition-colors bg-black/20">
               <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-black/40 shrink-0">
                 <label className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">Content (Markdown)</label>
                 <button
                   type="button"
                   onClick={() => setShowPreview((p) => !p)}
                   className="text-xs font-mono text-primary hover:text-emerald-400 transition-colors"
                 >
                   {showPreview ? "Edit" : "Preview"}
                 </button>
               </div>
               <div className="flex-1 min-h-0 relative">
                 {showPreview ? (
                   <div className="absolute inset-0 overflow-auto p-4 sm:p-6 bg-black/40">
                     <div className="markdown-content text-lg text-foreground/80 leading-relaxed font-light space-y-8 max-w-3xl mx-auto">
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
                         {body || "*Nothing to preview*"}
                       </ReactMarkdown>
                     </div>
                   </div>
                 ) : (
                   <textarea
                     ref={textareaRef}
                     value={body}
                     onChange={(e) => setBody(e.target.value)}
                     className="absolute inset-0 w-full h-full p-4 sm:p-6 bg-transparent text-foreground font-mono text-sm sm:text-base resize-none outline-none leading-relaxed"
                     placeholder="# Start writing..."
                     spellCheck={false}
                   />
                 )}
               </div>
            </div>
          </div>

          {/* AI Chat Side */}
          <div className={`w-full lg:w-[400px] xl:w-[500px] shrink-0 border border-emerald-500/20 rounded-lg bg-black/40 flex flex-col ${!isChatOpen ? 'hidden lg:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
               <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                 AI Assistant
               </h3>
               {isChatOpen && (
                 <button onClick={() => setIsChatOpen(false)} className="lg:hidden text-muted hover:text-foreground text-xl leading-none">&times;</button>
               )}
            </div>
            <div className="flex-1 min-h-0 flex flex-col">
               <BlogWriteChat 
                 token={token} 
                 currentDraft={body}
                 onUseDraft={handleUseDraft} 
                 onApplyPatch={handleApplyPatch}
                 isEmbedded
               />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold uppercase tracking-tight">Blog Studio</h2>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={startNew}
            className="min-h-[44px] px-6 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
          >
            + New post
          </button>
          <button
            onClick={handleLogout}
            className="min-h-[44px] px-3 py-2 text-sm text-muted hover:text-foreground transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div>
        <h3 className="font-mono text-sm uppercase tracking-widest text-primary/80 mb-4">
          Posts
        </h3>
        <p className="text-muted text-xs mb-4">
          Set &quot;Featured 1&quot; and &quot;Featured 2&quot; to choose which posts appear on the landing page.
        </p>
        {posts === undefined ? (
          <p className="text-muted text-sm">Loading...</p>
        ) : posts.length === 0 ? (
          <p className="text-muted text-sm">No posts yet. Create one above.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li
                key={post._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-primary/10 gap-2 sm:gap-4 group hover:bg-black/20 px-2 rounded transition-colors -mx-2"
              >
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => startEdit(post._id, post)}>
                  <span className="font-medium text-foreground group-hover:text-emerald-400 transition-colors">{post.title}</span>
                  <span className="text-muted text-sm ml-2 font-mono">
                    /{post.slug}
                  </span>
                  {(post.featuredOrder === 1 || post.featuredOrder === 2) && (
                    <span className="ml-2 text-xs font-mono text-emerald-400/80">
                      (Featured {post.featuredOrder})
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <select
                    value={post.featuredOrder ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!token) return;
                      setFeaturedMutation({
                        token,
                        postId: post._id,
                        featuredOrder: val === "" ? null : (Number(val) as 1 | 2),
                      });
                    }}
                    className="min-h-[44px] text-xs bg-black/40 border border-primary/20 rounded px-3 py-2 text-foreground font-mono outline-none focus:border-emerald-500/50 transition-colors"
                  >
                    <option value="">—</option>
                    <option value="1">Featured 1</option>
                    <option value="2">Featured 2</option>
                  </select>
                  <button
                    onClick={() => startEdit(post._id, post)}
                    className="min-h-[44px] px-3 py-2 text-sm text-primary hover:text-emerald-400 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="min-h-[44px] px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </div>
  );
}
