import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Building2, MapPin, Phone, User } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { fmtPrice, fmtMiles, type DBListing } from "@/lib/listings";

export const Route = createFileRoute("/dealers/$id")({
  head: () => ({
    meta: [
      { title: "Dealer profile — idilicar4sales" },
      { name: "description", content: "View dealer profile and listings on idilicar4sales." },
    ],
  }),
  component: DealerProfile,
});

function DealerProfile() {
  const { id } = Route.useParams();

  const { data: dealer, isLoading } = useQuery({
    queryKey: ["dealer", id],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: listings } = useQuery({
    queryKey: ["dealer-listings", id],
    queryFn: async (): Promise<DBListing[]> => {
      const { data, error } = await (supabase as any)
        .from("listings")
        .select("*")
        .eq("seller_id", id)
        .in("status", ["active", "pending"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="p-12 text-center text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="p-12 text-center">
          <h1 className="text-xl font-bold">Dealer not found</h1>
          <Link to="/dealers" className="mt-3 inline-block text-brand hover:underline">Back to dealers</Link>
        </div>
      </div>
    );
  }

  const name = dealer.dealer_name || dealer.display_name || dealer.full_name || "Seller";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <Link to="/dealers" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> All dealers
            </Link>
            <div className="mt-4 flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-white/10">
                {dealer.is_dealer ? <Building2 className="h-8 w-8" /> : <User className="h-8 w-8" />}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold">{name}</h1>
                <div className="mt-1 flex flex-wrap gap-3 text-sm text-white/80">
                  {dealer.is_dealer && <Badge className="bg-brand text-brand-foreground">Verified dealer</Badge>}
                  {dealer.postcode && <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{dealer.postcode}</span>}
                  {dealer.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{dealer.phone}</span>}
                </div>
                {dealer.bio && <p className="mt-3 max-w-2xl text-sm text-white/80">{dealer.bio}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="mb-4 text-lg font-bold text-navy">{listings?.length ?? 0} cars for sale</h2>
          {!listings?.length ? (
            <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">No active listings yet.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((c) => (
                <Link key={c.id} to="/listings/$id" params={{ id: c.id }} className="group overflow-hidden rounded-lg border bg-card transition hover:shadow-lg">
                  <div className="aspect-[4/3] bg-muted">
                    {c.image_url
                      ? <img src={c.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                      : <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-navy group-hover:text-brand">{c.year} {c.make} {c.model}</div>
                    <div className="mt-1 text-lg font-bold">{fmtPrice(c.price)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{fmtMiles(c.mileage)} • {c.fuel} • {c.transmission}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
