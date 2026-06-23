import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtDate } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/sales")({
  component: SalesPage,
});

function SalesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: ["sales", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("listings").select("*")
        .eq("seller_id", user!.id).eq("status", "sold").order("sold_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = (data ?? []).reduce((s: number, l: any) => s + Number(l.sold_price ?? 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold text-navy">Sales history</h1>
        <div className="text-right">
          <div className="text-xs uppercase text-muted-foreground">Lifetime sales</div>
          <div className="text-2xl font-bold text-deal-great">{fmtPrice(total)}</div>
        </div>
      </div>
      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : !data?.length ? (
        <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">
          No completed sales yet. Mark a listing as sold from the My listings page.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr><th className="px-4 py-3">Vehicle</th><th className="px-4 py-3">Listed price</th><th className="px-4 py-3">Sold price</th><th className="px-4 py-3">Sold on</th></tr>
            </thead>
            <tbody>
              {data.map((l: any) => (
                <tr key={l.id} className="border-t">
                  <td className="px-4 py-3">
                    <Link to="/listings/$id" params={{ id: l.id }} className="font-semibold hover:text-brand">
                      {l.year} {l.make} {l.model}
                    </Link>
                    <div className="text-xs text-muted-foreground">{l.trim}</div>
                  </td>
                  <td className="px-4 py-3">{fmtPrice(l.price)}</td>
                  <td className="px-4 py-3 font-bold text-deal-great">{fmtPrice(l.sold_price)}</td>
                  <td className="px-4 py-3 text-xs">{fmtDate(l.sold_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
