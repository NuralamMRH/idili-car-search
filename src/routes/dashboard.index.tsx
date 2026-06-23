import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Car, Heart, Tag, MessageSquare, Receipt, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const uid = user!.id;
      const [listings, offersOut, offersIn, favs, msgs, sold] = await Promise.all([
        (supabase as any).from("listings").select("id", { count: "exact", head: true }).eq("seller_id", uid),
        (supabase as any).from("offers").select("id", { count: "exact", head: true }).eq("buyer_id", uid),
        (supabase as any).from("offers").select("id", { count: "exact", head: true }).eq("seller_id", uid).eq("status", "pending"),
        (supabase as any).from("favorites").select("id", { count: "exact", head: true }).eq("user_id", uid),
        (supabase as any).from("contact_messages").select("id", { count: "exact", head: true }).eq("recipient_id", uid).eq("is_read", false),
        (supabase as any).from("listings").select("sold_price").eq("seller_id", uid).eq("status", "sold"),
      ]);
      const soldTotal = (sold.data ?? []).reduce((s: number, r: any) => s + Number(r.sold_price ?? 0), 0);
      return {
        listings: listings.count ?? 0,
        offersOut: offersOut.count ?? 0,
        offersIn: offersIn.count ?? 0,
        favorites: favs.count ?? 0,
        unread: msgs.count ?? 0,
        soldCount: (sold.data ?? []).length,
        soldTotal,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your listings, offers and messages.</p>
        </div>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90">
          <Link to="/sell"><Plus className="mr-1.5 h-4 w-4" />List a car</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Car} label="Active listings" value={stats?.listings ?? 0} to="/dashboard/listings" />
        <StatCard icon={Tag} label="Pending offers received" value={stats?.offersIn ?? 0} to="/dashboard/offers" />
        <StatCard icon={Tag} label="Offers sent" value={stats?.offersOut ?? 0} to="/dashboard/offers" />
        <StatCard icon={MessageSquare} label="Unread messages" value={stats?.unread ?? 0} to="/dashboard/messages" />
        <StatCard icon={Heart} label="Saved cars" value={stats?.favorites ?? 0} to="/dashboard/favorites" />
        <StatCard icon={Receipt} label={`Cars sold (${stats?.soldCount ?? 0})`} value={fmtPrice(stats?.soldTotal ?? 0)} to="/dashboard/sales" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: any; label: string; value: any; to: string }) {
  return (
    <Link to={to} className="block rounded-lg border bg-card p-5 transition hover:border-brand hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <div className="mt-3 text-2xl font-bold text-navy">{value}</div>
    </Link>
  );
}
