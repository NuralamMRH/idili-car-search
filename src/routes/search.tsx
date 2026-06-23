import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { FUELS, TRANSMISSIONS, BODY_TYPES, fmtPrice, fmtMiles, type DBListing } from "@/lib/listings";

type SearchParams = { q?: string; make?: string; model?: string; bodyType?: string; priceMax?: string; postcode?: string };

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): SearchParams => ({
    q: typeof s.q === "string" ? s.q : undefined,
    make: typeof s.make === "string" ? s.make : undefined,
    model: typeof s.model === "string" ? s.model : undefined,
    bodyType: typeof s.bodyType === "string" ? s.bodyType : undefined,
    priceMax: typeof s.priceMax === "string" ? s.priceMax : undefined,
    postcode: typeof s.postcode === "string" ? s.postcode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search cars — idilicar4sales" },
      { name: "description", content: "Browse thousands of cars from trusted UK dealers." },
    ],
  }),
  component: SearchPage,
});

type Sort = "newest" | "price-asc" | "price-desc" | "miles-asc" | "year-desc";

function SearchPage() {
  const sp = Route.useSearch();
  const [make, setMake] = useState(sp.make ?? "any");
  const [bodyType, setBodyType] = useState(sp.bodyType ?? "any");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, sp.priceMax ? Number(sp.priceMax) : 80000]);
  const [mileageMax, setMileageMax] = useState(150000);
  const [yearMin, setYearMin] = useState(2010);
  const [fuels, setFuels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("newest");
  const [q, setQ] = useState(sp.q ?? "");

  const { data: all, isLoading } = useQuery({
    queryKey: ["listings-all"],
    queryFn: async (): Promise<DBListing[]> => {
      const { data, error } = await (supabase as any).from("listings").select("*").in("status", ["active", "pending"]).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const makes = useMemo(() => Array.from(new Set((all ?? []).map((c) => c.make))).sort(), [all]);

  const filtered = useMemo(() => {
    const list = (all ?? []).filter((c) => {
      if (make !== "any" && c.make !== make) return false;
      if (bodyType !== "any" && c.body_type !== bodyType) return false;
      if (Number(c.price) < priceRange[0] || Number(c.price) > priceRange[1]) return false;
      if (c.mileage > mileageMax) return false;
      if (c.year < yearMin) return false;
      if (fuels.length && !fuels.includes(c.fuel)) return false;
      if (transmissions.length && !transmissions.includes(c.transmission)) return false;
      if (q) {
        const hay = `${c.make} ${c.model} ${c.trim ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const orders: Record<Sort, (a: DBListing, b: DBListing) => number> = {
      "newest": (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      "price-asc": (a, b) => Number(a.price) - Number(b.price),
      "price-desc": (a, b) => Number(b.price) - Number(a.price),
      "miles-asc": (a, b) => a.mileage - b.mileage,
      "year-desc": (a, b) => b.year - a.year,
    };
    return [...list].sort(orders[sort]);
  }, [all, make, bodyType, priceRange, mileageMax, yearMin, fuels, transmissions, sort, q]);

  function toggle(arr: string[], v: string, set: (a: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 space-y-5 rounded-lg border bg-card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Filters</h2>
            <F label="Keyword"><Input placeholder="e.g. quattro" value={q} onChange={(e) => setQ(e.target.value)} /></F>
            <F label="Make">
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any make</SelectItem>
                  {makes.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label="Body type">
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any body type</SelectItem>
                  {BODY_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </F>
            <F label={`Price: £${priceRange[0].toLocaleString()} – £${priceRange[1].toLocaleString()}`}>
              <Slider min={0} max={80000} step={500} value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} />
            </F>
            <F label={`Max mileage: ${mileageMax.toLocaleString()} mi`}>
              <Slider min={5000} max={150000} step={5000} value={[mileageMax]} onValueChange={(v) => setMileageMax(v[0])} />
            </F>
            <F label={`Year from: ${yearMin}`}>
              <Slider min={2010} max={2026} step={1} value={[yearMin]} onValueChange={(v) => setYearMin(v[0])} />
            </F>
            <F label="Fuel">
              <div className="space-y-2">
                {FUELS.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={fuels.includes(f)} onCheckedChange={() => toggle(fuels, f, setFuels)} />{f}
                  </label>
                ))}
              </div>
            </F>
            <F label="Transmission">
              <div className="space-y-2">
                {TRANSMISSIONS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={transmissions.includes(t)} onCheckedChange={() => toggle(transmissions, t, setTransmissions)} />{t}
                  </label>
                ))}
              </div>
            </F>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-navy">
                {isLoading ? "Loading..." : `${filtered.length} cars`} {make !== "any" ? `· ${make}` : ""}
              </h1>
              <p className="text-xs text-muted-foreground">Live listings from idilicar4sales sellers</p>
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="miles-asc">Lowest mileage</SelectItem>
                <SelectItem value="year-desc">Newest year first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isLoading && filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <div className="text-lg font-semibold">No cars match</div>
              <p className="mt-2 text-sm text-muted-foreground">Try widening your filters.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => <ListingCard key={c.id} c={c} />)}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ListingCard({ c }: { c: DBListing }) {
  return (
    <Link to="/listings/$id" params={{ id: c.id }} className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {c.image_url ? (
          <img src={c.image_url} alt={`${c.year} ${c.make} ${c.model}`} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
        ) : <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>}
        <span className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground"><Heart className="h-4 w-4" /></span>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="mb-2 text-xs font-semibold">{label}</div>{children}</div>;
}
