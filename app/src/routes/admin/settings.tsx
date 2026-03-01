import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdminToken } from "~/lib/useAdminToken";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/settings")({
  component: AISettingsPage,
});

function AISettingsPage() {
  const token = useAdminToken();
  const navigate = useNavigate();
  
  const blogSettings = useQuery(
    api.blogSettings.getForAdmin,
    token ? { token } : "skip"
  );
  const updateBlogMutation = useMutation(api.blogSettings.update);

  const tweetSettings = useQuery(
    api.tweetSettings.getForAdmin,
    token ? { token } : "skip"
  );
  const updateTweetMutation = useMutation(api.tweetSettings.update);

  const [blogInstructions, setBlogInstructions] = useState("");
  const [blogContext, setBlogContext] = useState("");
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogError, setBlogError] = useState<string | null>(null);
  const [blogSuccess, setBlogSuccess] = useState(false);

  const [tweetInstructions, setTweetInstructions] = useState("");
  const [tweetContext, setTweetContext] = useState("");
  const [tweetSaving, setTweetSaving] = useState(false);
  const [tweetError, setTweetError] = useState<string | null>(null);
  const [tweetSuccess, setTweetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/admin/login" });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (blogSettings) {
      setBlogInstructions(blogSettings.instructions);
      setBlogContext(blogSettings.context);
    }
  }, [blogSettings]);

  useEffect(() => {
    if (tweetSettings) {
      setTweetInstructions(tweetSettings.instructions);
      setTweetContext(tweetSettings.context);
    }
  }, [tweetSettings]);

  async function handleBlogSave() {
    if (!token) return;
    setBlogError(null);
    setBlogSuccess(false);
    setBlogSaving(true);
    try {
      await updateBlogMutation({
        token,
        instructions: blogInstructions,
        context: blogContext,
      });
      setBlogSuccess(true);
    } catch (err) {
      setBlogError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBlogSaving(false);
    }
  }

  async function handleTweetSave() {
    if (!token) return;
    setTweetError(null);
    setTweetSuccess(false);
    setTweetSaving(true);
    try {
      await updateTweetMutation({
        token,
        instructions: tweetInstructions,
        context: tweetContext,
      });
      setTweetSuccess(true);
    } catch (err) {
      setTweetError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setTweetSaving(false);
    }
  }

  if (!token) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="flex flex-col gap-12 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        
        {/* Blog Settings Section */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
            AI Blog Settings
          </h2>
          <p className="text-muted text-sm mb-6">
            Control how the Blog AI writes and what context it has about you.
          </p>

          {blogSettings === undefined ? (
            <p className="text-muted text-sm font-mono">Loading...</p>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                  Blog Context (who you are, audience, style)
                </label>
                <textarea
                  value={blogContext}
                  onChange={(e) => setBlogContext(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                  placeholder="e.g. I'm Glenn, a developer and designer..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                  Blog System Instructions
                </label>
                <textarea
                  value={blogInstructions}
                  onChange={(e) => setBlogInstructions(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleBlogSave}
                  disabled={blogSaving}
                  className="min-h-[44px] px-6 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
                >
                  {blogSaving ? "Saving..." : "Save Blog Settings"}
                </button>
                {blogSuccess && (
                  <span className="text-emerald-400 text-sm font-mono">Saved.</span>
                )}
              </div>

              {blogError && (
                <p className="text-red-500 text-sm font-mono" role="alert">{blogError}</p>
              )}
            </div>
          )}
        </div>

        <hr className="border-t border-primary/10" />

        {/* Tweet Settings Section */}
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tight mb-2">
            AI Tweet Settings
          </h2>
          <p className="text-muted text-sm mb-6">
            Control how the Tweet AI writes and what context it has about you.
          </p>

          {tweetSettings === undefined ? (
            <p className="text-muted text-sm font-mono">Loading...</p>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                  Tweet Context
                </label>
                <textarea
                  value={tweetContext}
                  onChange={(e) => setTweetContext(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                  placeholder="e.g. Keep it casual, usually in Swedish..."
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                  Tweet System Instructions
                </label>
                <textarea
                  value={tweetInstructions}
                  onChange={(e) => setTweetInstructions(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleTweetSave}
                  disabled={tweetSaving}
                  className="min-h-[44px] px-6 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
                >
                  {tweetSaving ? "Saving..." : "Save Tweet Settings"}
                </button>
                {tweetSuccess && (
                  <span className="text-emerald-400 text-sm font-mono">Saved.</span>
                )}
              </div>

              {tweetError && (
                <p className="text-red-500 text-sm font-mono" role="alert">{tweetError}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
