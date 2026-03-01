import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAdminToken } from "~/lib/useAdminToken";
import { useState, useEffect, useRef } from "react";
import { TweetWriteChat } from "~/components/TweetWriteChat";
import { XPostPreview } from "~/components/XPostPreview";
import { projects } from "~/data/projects";
import { getEffectiveLength, X_CHAR_LIMIT } from "~/lib/xCharCount";

export const Route = createFileRoute("/admin/tweets/")({
  component: TweetStudio,
});

function TweetStudio() {
  const token = useAdminToken();
  const navigate = useNavigate();
  const postTweetAction = useAction(api.postTweet.post);
  const recentPosts = useQuery(
    api.posts.listTitlesForTweetContext,
    token ? { token } : "skip"
  );

  const [text, setText] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  const [linkedProjectId, setLinkedProjectId] = useState<string>("");
  const [linkedPostSlug, setLinkedPostSlug] = useState<string>("");
  
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/admin/login" });
    }
  }, [token, navigate]);

  function handleUseDraft(draftText: string) {
    setText(draftText);
    setShowPreview(true);
    setError(null);
    setSuccessMsg(null);
  }

  async function handlePost() {
    if (!token) return;
    const charCount = getEffectiveLength(text);
    if (charCount > X_CHAR_LIMIT) {
      setError(`Tweet is too long (\${charCount} > \${X_CHAR_LIMIT})`);
      return;
    }
    if (!text.trim()) {
      setError("Tweet cannot be empty");
      return;
    }
    
    setError(null);
    setSuccessMsg(null);
    setPosting(true);
    try {
      const result = await postTweetAction({ token, text });
      setSuccessMsg(`Posted successfully! ID: ${result.id}`);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post tweet");
    } finally {
      setPosting(false);
    }
  }

  if (!token) return null;

  // Build the extra context to pass to the AI
  let extraContext = "";
  if (linkedProjectId) {
    const proj = projects.find(p => p.id === linkedProjectId);
    if (proj) {
      extraContext += `Project Context:\nName: \${proj.name}\nDescription: \${proj.description}\nURL: \${proj.url}\nTags: \${proj.tags.join(", ")}\n\n`;
    }
  }
  if (linkedPostSlug && recentPosts) {
    const post = recentPosts.find(p => p.slug === linkedPostSlug);
    if (post) {
      extraContext += `Blog Post Context:\nTitle: \${post.title}\nExcerpt: \${post.excerpt ?? 'N/A'}\nURL: https://glennsvanberg.se/blog/\${post.slug}\n\n`;
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 py-4 w-full mx-auto max-w-[1920px]">
      <div className="flex items-center justify-between gap-4 shrink-0 mb-4 px-4 sm:px-6">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          Tweet Studio
        </h2>
        <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="lg:hidden px-3 py-2 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest rounded hover:bg-emerald-500/10 transition-colors"
            >
              {isChatOpen ? "Close Chat" : "AI Chat"}
            </button>
            <button
              onClick={handlePost}
              disabled={posting || !text.trim() || getEffectiveLength(text) > X_CHAR_LIMIT}
              className="min-h-[44px] px-6 py-2 bg-[#1d9bf0] text-white font-mono text-sm font-bold uppercase tracking-widest rounded hover:bg-[#1a8cd8] disabled:opacity-50 shadow-[0_0_15px_rgba(29,155,240,0.4)] transition-all flex items-center gap-2"
            >
              {posting ? "Posting..." : "Post to X"}
            </button>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm px-4 mb-4" role="alert">{error}</p>
      )}
      {successMsg && (
        <p className="text-emerald-500 text-sm px-4 mb-4" role="alert">{successMsg}</p>
      )}

      <div className="flex-1 min-h-0 flex gap-4 px-4 sm:px-6 pb-4 sm:pb-6">
        {/* Editor Side */}
        <div className={`flex-1 flex flex-col min-h-0 gap-4 \${isChatOpen ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <div className="flex-1">
                <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Link Project Context (Optional)</label>
                <select
                  value={linkedProjectId}
                  onChange={(e) => setLinkedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground outline-none transition-colors text-sm"
                >
                  <option value="">-- None --</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-mono text-emerald-400/80 mb-1 uppercase tracking-widest">Link Blog Post Context (Optional)</label>
                <select
                  value={linkedPostSlug}
                  onChange={(e) => setLinkedPostSlug(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded text-foreground outline-none transition-colors text-sm"
                >
                  <option value="">-- None --</option>
                  {recentPosts?.map(p => (
                    <option key={p.slug} value={p.slug}>{p.title}</option>
                  ))}
                </select>
              </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0 border border-primary/20 focus-within:border-emerald-500/50 rounded-lg overflow-hidden transition-colors bg-black/20">
              <div className="flex items-center justify-between px-4 py-2 border-b border-primary/20 bg-black/40 shrink-0">
                <label className="text-xs font-mono text-emerald-400/80 uppercase tracking-widest">Tweet Content</label>
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
                  <div className="absolute inset-0 overflow-auto p-4 sm:p-6 bg-black/40 flex justify-center">
                    <div className="w-full max-w-lg mt-8">
                      <XPostPreview text={text} />
                    </div>
                  </div>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="absolute inset-0 w-full h-full p-4 sm:p-6 bg-transparent text-foreground font-sans text-lg resize-none outline-none leading-relaxed"
                    placeholder="What is happening?!"
                    spellCheck={false}
                  />
                )}
              </div>
          </div>
        </div>

        {/* AI Chat Side */}
        <div className={`w-full lg:w-[400px] xl:w-[500px] shrink-0 border border-emerald-500/20 rounded-lg bg-black/40 flex flex-col \${!isChatOpen ? 'hidden lg:flex' : 'flex'}`}>
          <div className="px-4 py-3 border-b border-emerald-500/20 flex items-center justify-between shrink-0">
              <h3 className="font-mono text-sm uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
                Tweet Assistant
              </h3>
              {isChatOpen && (
                <button onClick={() => setIsChatOpen(false)} className="lg:hidden text-muted hover:text-foreground text-xl leading-none">&times;</button>
              )}
          </div>
          <div className="flex-1 min-h-0 flex flex-col">
              <TweetWriteChat 
                token={token} 
                currentDraft={text}
                extraContext={extraContext}
                onUseDraft={handleUseDraft} 
                isEmbedded
              />
          </div>
        </div>
      </div>
    </div>
  );
}
