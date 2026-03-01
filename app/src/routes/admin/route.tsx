import { createFileRoute, Link, redirect, Outlet } from "@tanstack/react-router";
import { ADMIN_TOKEN_KEY } from "~/lib/useAdminToken";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    const isLoginPage = location.pathname === "/admin/login";
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!isLoginPage && !token) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="h-[100dvh] bg-[var(--background)] text-[var(--foreground)] flex flex-col overflow-hidden">
      <header className="border-b border-primary/10 px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-2 w-full">
          <h1 className="font-mono text-lg font-bold uppercase tracking-widest text-primary/80">
            Admin
          </h1>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/blog"
              className="min-h-[44px] flex items-center text-sm text-muted hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <Link
              to="/admin/settings"
              className="min-h-[44px] flex items-center text-sm text-muted hover:text-foreground transition-colors"
            >
              AI Settings
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full flex flex-col min-h-0">
        <Outlet />
      </main>
    </div>
  );
}
