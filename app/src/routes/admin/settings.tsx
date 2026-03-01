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
  const settings = useQuery(
    api.blogSettings.getForAdmin,
    token ? { token } : "skip"
  );
  const updateMutation = useMutation(api.blogSettings.update);

  const [instructions, setInstructions] = useState("");
  const [context, setContext] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate({ to: "/admin/login" });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (settings) {
      setInstructions(settings.instructions);
      setContext(settings.context);
    }
  }, [settings]);

  async function handleSave() {
    if (!token) return;
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await updateMutation({
        token,
        instructions,
        context,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (!token) return null;

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="flex flex-col gap-8 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8">
        <h2 className="text-xl font-bold uppercase tracking-tight">
          AI Blog Settings
        </h2>
        <p className="text-muted text-sm -mt-6">
          Control how the AI writes and what context it has about you. Changes
          apply immediately to new chat messages.
        </p>

        {settings === undefined ? (
          <p className="text-muted text-sm font-mono">Loading...</p>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                Context (who you are, audience, style)
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={8}
                className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                placeholder="e.g. I'm Glenn, a developer and designer. My audience is other developers interested in real-time apps and AI. I write in Swedish, casual but professional tone. I cover topics like Convex, React, and building small experiments."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="block text-xs font-mono text-emerald-400/80 uppercase tracking-widest">
                System instructions (how the AI writes)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 bg-black/40 border border-primary/20 focus:border-emerald-500/50 rounded-lg text-foreground font-mono text-sm resize-y outline-none transition-colors"
                placeholder="Main system prompt..."
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="min-h-[44px] px-6 py-2 bg-emerald-500 text-black font-mono text-sm font-bold uppercase tracking-widest rounded hover:opacity-90 disabled:opacity-50 shadow-[0_0_15px_rgba(52,211,153,0.4)] transition-all"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              {success && (
                <span className="text-emerald-400 text-sm font-mono">
                  Saved.
                </span>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-sm font-mono" role="alert">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
