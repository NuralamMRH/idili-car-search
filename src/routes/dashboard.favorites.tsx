import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtMiles } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["favs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("favorites")
        .select("id, created_at, listings(*)")
        .eq("user_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function remove(id: string) {
    await (supabase as any).from("favorites").delete().eq("id", id);
    toast.success("Removed from saved");
    qc.invalidateQueries({ queryKey: ["favs"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Saved cars</h1>
      {isLoading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">Loading...</div>
      ) : !data?.length ? (
        <div className="rounded-lg border bg-card p-10 text-center">
          <Heart className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">You haven't saved any cars yet.</p>
          <Button asChild className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90"><Link to="/search">Browse cars</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((f: any) => f.listings && (
            <div key={f.id} className="overflow-hidden rounded-lg border bg-card">
              <Link to="/listings/$id" params={{ id: f.listings.id }}>
                <div className="aspect-[4/3] bg-muted">
                  {f.listings.image_url && <img src={f.listings.image_url} alt="" className="h-full w-full object-cover" />}
                </div>
              </Link>
              <div className="p-3">
                <Link to="/listings/$id" params={{ id: f.listings.id }} className="font-semibold hover:text-brand">
                  {f.listings.year} {f.listings.make} {f.listings.model}
                </Link>
                <div className="mt-1 text-lg font-bold">{fmtPrice(f.listings.price)}</div>
                <div className="text-xs text-muted-foreground">{fmtMiles(f.listings.mileage)} · {f.listings.fuel}</div>
                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => remove(f.id)}>
                  <Trash2 className="mr-1.5 h-3 w-3" /> Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
