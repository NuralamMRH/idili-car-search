import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Car, Heart, LayoutDashboard, MessageSquare, Receipt, Tag, TrendingUp } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — idilicar4sales" }] }),
  component: DashboardLayout,
});

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/listings", label: "My listings", icon: Car },
  { to: "/dashboard/offers", label: "Offers", icon: Tag },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/favorites", label: "Saved cars", icon: Heart },
  { to: "/dashboard/sales", label: "Sales history", icon: Receipt },
  { to: "/dashboard/profile", label: "Profile", icon: TrendingUp },
];

function DashboardLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/dashboard" } });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col"><SiteHeader />
        <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-20 rounded-lg border bg-card p-2">
            <div className="px-3 py-3">
              <div className="text-xs uppercase text-muted-foreground">Signed in as</div>
              <div className="truncate text-sm font-semibold">{user.email}</div>
            </div>
            <nav className="flex flex-col gap-0.5">
              {NAV.map((item) => {
                const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                return (
                  <Link key={item.to} to={item.to} className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                    active ? "bg-brand/10 font-semibold text-brand" : "hover:bg-muted"
                  )}>
                    <item.icon className="h-4 w-4" /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <Outlet />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
