import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ShieldCheck, TrendingDown, Car as CarIcon } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CARS, MAKES } from "@/lib/cars";

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

  const models = make === "any" ? [] : Array.from(new Set(CARS.filter((c) => c.make === make).map((c) => c.model)));
  const featured = CARS.slice(0, 8);

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
                Compare millions of listings from trusted UK dealers. We rate every deal so you know what's fair.
              </p>
            </div>

            <form onSubmit={onSearch} className="mt-8 rounded-xl bg-card p-4 text-foreground shadow-xl md:p-6">
              <div className="grid gap-3 md:grid-cols-5">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Make</label>
                  <Select value={make} onValueChange={(v) => { setMake(v); setModel("any"); }}>
                    <SelectTrigger><SelectValue placeholder="Any make" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any make</SelectItem>
                      {MAKES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Model</label>
                  <Select value={model} onValueChange={setModel} disabled={make === "any"}>
                    <SelectTrigger><SelectValue placeholder="Any model" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any model</SelectItem>
                      {models.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Max price</label>
                  <Select value={priceMax} onValueChange={setPriceMax}>
                    <SelectTrigger><SelectValue placeholder="No max" /></SelectTrigger>
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
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="text-muted-foreground">Popular:</span>
                {["Audi A5", "BMW 3 Series", "Tesla Model 3", "Mercedes C-Class"].map((q) => (
                  <Link key={q} to="/search" search={{ q }} className="rounded-full border bg-secondary px-3 py-1 text-secondary-foreground hover:bg-accent">
                    {q}
                  </Link>
                ))}
              </div>
            </form>
          </div>
        </section>

        <section className="border-b bg-muted/40">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 md:grid-cols-3">
            <Feature icon={<TrendingDown className="h-6 w-6" />} title="Deal Ratings" desc="We analyse market prices so you know if it's a Great, Good or Fair deal." />
            <Feature icon={<ShieldCheck className="h-6 w-6" />} title="Trusted Dealers" desc="Every dealer is rated by real buyers like you." />
            <Feature icon={<CarIcon className="h-6 w-6" />} title="Huge Selection" desc="The UK's biggest range of new and used cars in one place." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy">Featured listings</h2>
              <p className="text-sm text-muted-foreground">Hand-picked great deals near you</p>
            </div>
            <Link to="/search" className="text-sm font-semibold text-brand hover:underline">See all →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((c) => <CarCard key={c.id} car={c} />)}
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

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">{icon}</div>
      <div>
        <div className="font-semibold text-navy">{title}</div>
        <div className="text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}
