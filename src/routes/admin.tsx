import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, Car, Tag, MessageSquare } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtDate } from "@/lib/listings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — idilicar4sales" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  const stats = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [u, l, o, m, sold] = await Promise.all([
        (supabase as any).from("profiles").select("id", { count: "exact", head: true }),
        (supabase as any).from("listings").select("id", { count: "exact", head: true }),
        (supabase as any).from("offers").select("id", { count: "exact", head: true }),
        (supabase as any).from("contact_messages").select("id", { count: "exact", head: true }),
        (supabase as any).from("listings").select("sold_price").eq("status", "sold"),
      ]);
      return {
        users: u.count ?? 0, listings: l.count ?? 0, offers: o.count ?? 0, messages: m.count ?? 0,
        gmv: (sold.data ?? []).reduce((s: number, r: any) => s + Number(r.sold_price ?? 0), 0),
      };
    },
  });

  const users = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const listings = useQuery({
    queryKey: ["admin-listings"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await (supabase as any).from("listings").select("*").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const offers = useQuery({
    queryKey: ["admin-offers"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data } = await (supabase as any).from("offers").select("*, listings(make, model, year)").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  if (loading || !isAdmin) {
    return <div className="flex min-h-screen flex-col"><SiteHeader /><div className="p-12 text-center text-muted-foreground">Loading...</div></div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <div className="mb-6 flex items-center gap-2">
          <Shield className="h-6 w-6 text-brand" />
          <h1 className="text-2xl font-bold text-navy">Admin dashboard</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Stat icon={Users} label="Users" value={stats.data?.users ?? 0} />
          <Stat icon={Car} label="Listings" value={stats.data?.listings ?? 0} />
          <Stat icon={Tag} label="Offers" value={stats.data?.offers ?? 0} />
          <Stat icon={MessageSquare} label="Messages" value={stats.data?.messages ?? 0} />
          <Stat icon={Tag} label="GMV (sold)" value={fmtPrice(stats.data?.gmv ?? 0)} />
        </div>

        <Tabs defaultValue="users" className="mt-8">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-4 overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Dealer</th><th className="px-4 py-3">Joined</th></tr>
              </thead>
              <tbody>
                {(users.data ?? []).map((u: any) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.full_name || u.display_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-4 py-3">{u.is_dealer ? <Badge>{u.dealer_name || "Dealer"}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-xs">{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="listings" className="mt-4 overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Listed</th></tr>
              </thead>
              <tbody>
                {(listings.data ?? []).map((l: any) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-4 py-3">
                      <Link to="/listings/$id" params={{ id: l.id }} className="font-medium hover:text-brand">
                        {l.year} {l.make} {l.model}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{fmtPrice(l.price)}</td>
                    <td className="px-4 py-3"><Badge className="capitalize">{l.status}</Badge></td>
                    <td className="px-4 py-3 text-xs">{fmtDate(l.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>

          <TabsContent value="offers" className="mt-4 overflow-hidden rounded-lg border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr>
              </thead>
              <tbody>
                {(offers.data ?? []).map((o: any) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">{o.listings?.year} {o.listings?.make} {o.listings?.model}</td>
                    <td className="px-4 py-3 font-bold">{fmtPrice(o.amount)}</td>
                    <td className="px-4 py-3"><Badge className="capitalize">{o.status}</Badge></td>
                    <td className="px-4 py-3 text-xs">{fmtDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TabsContent>
        </Tabs>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: any }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <div className="mt-2 text-2xl font-bold text-navy">{value}</div>
    </div>
  );
}
