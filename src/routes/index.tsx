import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShieldCheck, TrendingDown, Car as CarIcon, MapPin, Heart } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { fmtPrice, fmtMiles, type DBListing } from "@/lib/listings";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "idilicar4sales — Find your next car" },
      { name: "description", content: "Search thousands of used and new cars from trusted UK dealers." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const [make, setMake] = useState("any");
  const [model, setModel] = useState("any");
  const [priceMax, setPriceMax] = useState("any");
  const [postcode, setPostcode] = useState("");

  const { data: cars } = useQuery({
    queryKey: ["home-cars"],
    queryFn: async (): Promise<DBListing[]> => {
      const { data, error } = await (supabase as any).from("listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  const makes = useMemo(() => Array.from(new Set((cars ?? []).map((c) => c.make))).sort(), [cars]);
  const models = useMemo(() => make === "any" ? [] : Array.from(new Set((cars ?? []).filter((c) => c.make === make).map((c) => c.model))), [cars, make]);
  const featured = (cars ?? []).slice(0, 8);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const search: Record<string, string> = {};
    if (make !== "any") search.make = make;
    if (model !== "any") search.model = model;
    if (priceMax !== "any") search.priceMax = priceMax;
    if (postcode) search.postcode = postcode;
    navigate({ to: "/search", search });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative bg-navy text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy to-primary opacity-90" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
                Find your perfect car — at the right price.
              </h1>
              <p className="mt-3 text-lg text-white/80">
                Compare thousands of listings from trusted UK sellers. Make offers, message dealers, and sell your car in minutes.
              </p>
            </div>
            <form onSubmit={onSearch} className="mt-8 rounded-xl bg-card p-4 text-foreground shadow-xl md:p-6">
              <div className="grid gap-3 md:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Make</label>
                  <Select value={make} onValueChange={(v) => { setMake(v); setModel("any"); }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any make</SelectItem>
                      {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Model</label>
                  <Select value={model} onValueChange={setModel} disabled={make === "any"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any model</SelectItem>
                      {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Max price</label>
                  <Select value={priceMax} onValueChange={setPriceMax}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">No max</SelectItem>
                      {[10000, 15000, 20000, 25000, 30000, 40000, 60000].map((p) => (
                        <SelectItem key={p} value={String(p)}>£{p.toLocaleString()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Postcode</label>
                  <Input placeholder="e.g. SW1A 1AA" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
                </div>
                <div className="self-end">
                  <Button type="submit" className="h-10 w-full bg-brand text-brand-foreground hover:bg-brand/90">
                    <Search className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <section className="border-b bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
            <Feature icon={<TrendingDown className="h-6 w-6" />} title="Real market prices" desc="Live listings from sellers across the UK — no hidden mark-ups." />
            <Feature icon={<ShieldCheck className="h-6 w-6" />} title="Trusted sellers" desc="Verified dealers and private sellers with public profiles." />
            <Feature icon={<CarIcon className="h-6 w-6" />} title="Buy, sell, message" desc="Send offers, chat to sellers, and track everything from one dashboard." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy">Featured listings</h2>
              <p className="text-sm text-muted-foreground">Recently added cars from idilicar4sales sellers</p>
            </div>
            <Link to="/search" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => <Card key={c.id} c={c} />)}
          </div>
        </section>

        <section className="bg-muted/40 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-6 text-2xl font-bold text-navy">Browse by body type</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {["Saloon", "Estate", "Coupe", "SUV", "Hatchback", "Convertible"].map((b) => (
                <Link key={b} to="/search" search={{ bodyType: b }} className="rounded-lg border bg-card p-4 text-center text-sm font-medium transition hover:border-brand hover:text-brand">
                  {b}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Card({ c }: { c: DBListing }) {
  return (
    <Link to="/listings/$id" params={{ id: c.id }} className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {c.image_url ? <img src={c.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" /> : null}
        <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90"><Heart className="h-4 w-4" /></span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="font-semibold leading-tight text-navy group-hover:text-brand">{c.year} {c.make} {c.model}</h3>
        <div className="text-xs text-muted-foreground">{c.trim}</div>
        <div className="mt-1 text-xl font-bold">{fmtPrice(c.price)}</div>
        <div className="mt-1 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
          <span>{fmtMiles(c.mileage)}</span><span>•</span><span>{c.fuel}</span><span>•</span><span>{c.transmission}</span>
        </div>
        {c.location && <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{c.location}</div>}
      </div>
    </Link>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">{icon}</div>
      <div><div className="font-semibold text-navy">{title}</div><div className="text-sm text-muted-foreground">{desc}</div></div>
    </div>
  );
}
