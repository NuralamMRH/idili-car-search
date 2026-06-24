import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, MapPin, Phone } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "UK car dealers — idilicar4sales" },
      { name: "description", content: "Browse verified UK car dealerships listing on idilicar4sales." },
      { property: "og:title", content: "UK car dealers — idilicar4sales" },
    ],
  }),
  component: DealersPage,
});

function DealersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dealers"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("*").eq("is_dealer", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h1 className="text-3xl font-extrabold">Trusted UK dealers</h1>
            <p className="mt-2 text-white/80">Browse verified dealerships and find your next car from a name you can trust.</p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10">
          {isLoading ? (
            <div className="text-center text-muted-foreground">Loading dealers...</div>
          ) : !data?.length ? (
            <div className="rounded-lg border bg-card p-10 text-center">
              <Building2 className="mx-auto h-8 w-8 text-muted-foreground" />
              <h2 className="mt-2 text-lg font-semibold">No dealers yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Are you a dealer? Sign up and enable "I'm a dealer" in your profile to appear here.
              </p>
              <Link to="/auth" search={{ mode: "signup" }} className="mt-4 inline-block rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
                Register as a dealer
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((d: any) => (
                <Link
                  key={d.id}
                  to="/dealers/$id"
                  params={{ id: d.id }}
                  className="block rounded-lg border bg-card p-5 transition hover:border-brand hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand/10 text-brand">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-navy">{d.dealer_name || d.display_name || d.full_name}</div>
                      {d.postcode && <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{d.postcode}</div>}
                      {d.phone && <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{d.phone}</div>}
                    </div>
                  </div>
                  {d.bio && <p className="mt-3 text-sm text-foreground/80 line-clamp-3">{d.bio}</p>}
                  <div className="mt-3 text-xs font-semibold text-brand">View profile →</div>
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
