import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Edit, Trash2, Eye, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtMiles, fmtDate, type DBListing } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/listings")({
  component: MyListings,
});

function MyListings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<DBListing[]> => {
      const { data, error } = await (supabase as any)
        .from("listings").select("*").eq("seller_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function markSold(id: string, price: number) {
    const { error } = await (supabase as any).from("listings").update({
      status: "sold", sold_at: new Date().toISOString(), sold_price: price,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Marked as sold");
    qc.invalidateQueries({ queryKey: ["my-listings"] });
  }

  async function remove(id: string) {
    if (!confirm("Delete this listing?")) return;
    const { error } = await (supabase as any).from("listings").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Listing deleted");
    qc.invalidateQueries({ queryKey: ["my-listings"] });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">My listings</h1>
        <Button asChild className="bg-brand text-brand-foreground hover:bg-brand/90"><Link to="/sell">List a car</Link></Button>
      </div>
      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : !listings?.length ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-sm text-muted-foreground">You haven't listed any cars yet.</p>
          <Button asChild className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90"><Link to="/sell">List your first car</Link></Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Mileage</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Listed</th><th className="px-4 py-3"></th></tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{l.year} {l.make} {l.model}</div>
                    <div className="text-xs text-muted-foreground">{l.trim}</div>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmtPrice(l.price)}</td>
                  <td className="px-4 py-3">{fmtMiles(l.mileage)}</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{fmtDate(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" title="View"><Link to="/listings/$id" params={{ id: l.id }}><Eye className="h-4 w-4" /></Link></Button>
                      {l.status === "active" && (
                        <Button variant="ghost" size="icon" title="Mark sold" onClick={() => markSold(l.id, Number(l.price))}>
                          <CheckCircle className="h-4 w-4 text-deal-great" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = {
    active: "bg-deal-great text-white",
    sold: "bg-muted text-muted-foreground",
    pending: "bg-deal-fair text-foreground",
    draft: "bg-secondary text-secondary-foreground",
  }[status] ?? "";
  return <Badge className={`${cls} border-0 capitalize`}>{status}</Badge>;
}
