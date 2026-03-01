import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { setAdminToken } from "~/lib/useAdminToken";
import { useState } from "react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const loginMutation = useMutation(api.adminAuth.login);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token } = await loginMutation({ username, password });
      setAdminToken(token);
      navigate({ to: "/admin/blog" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 uppercase tracking-tight">
        Admin Login
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-muted mb-1"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 bg-card border border-primary/20 rounded-md text-foreground focus:outline-none focus:border-primary/50"
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-muted mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 bg-card border border-primary/20 rounded-md text-foreground focus:outline-none focus:border-primary/50"
            autoComplete="current-password"
            required
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground font-mono font-bold uppercase tracking-widest rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
