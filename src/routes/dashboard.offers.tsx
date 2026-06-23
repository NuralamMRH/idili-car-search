import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtDate } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/offers")({
  component: OffersPage,
});

function OffersPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const received = useQuery({
    queryKey: ["offers-received", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("offers")
        .select("*, listings(make, model, year, image_url)")
        .eq("seller_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const sent = useQuery({
    queryKey: ["offers-sent", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("offers")
        .select("*, listings(make, model, year, image_url)")
        .eq("buyer_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function update(id: string, status: string) {
    const { error } = await (supabase as any).from("offers").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Offer ${status}`);
    qc.invalidateQueries({ queryKey: ["offers-received"] });
    qc.invalidateQueries({ queryKey: ["offers-sent"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Offers history</h1>
      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received">Received ({received.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({sent.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="received" className="mt-4">
          <OffersTable offers={received.data ?? []} kind="received" onUpdate={update} />
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <OffersTable offers={sent.data ?? []} kind="sent" onUpdate={update} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OffersTable({ offers, kind, onUpdate }: { offers: any[]; kind: "received" | "sent"; onUpdate: (id: string, s: string) => void }) {
  if (!offers.length) return <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">No offers yet.</div>;
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Offer</th><th className="px-4 py-3">Message</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3"></th></tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-3">
                <Link to="/listings/$id" params={{ id: o.listing_id }} className="font-semibold hover:text-brand">
                  {o.listings?.year} {o.listings?.make} {o.listings?.model}
                </Link>
              </td>
              <td className="px-4 py-3 font-bold">{fmtPrice(Number(o.amount))}</td>
              <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">{o.message ?? "—"}</td>
              <td className="px-4 py-3"><Badge className="capitalize">{o.status}</Badge></td>
              <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(o.created_at)}</td>
              <td className="px-4 py-3">
                {kind === "received" && o.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => onUpdate(o.id, "accepted")} className="bg-deal-great text-white hover:bg-deal-great/90">Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => onUpdate(o.id, "rejected")}>Reject</Button>
                  </div>
                )}
                {kind === "sent" && o.status === "pending" && (
                  <Button size="sm" variant="outline" onClick={() => onUpdate(o.id, "withdrawn")}>Withdraw</Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
