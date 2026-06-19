import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CarCard } from "@/components/car-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CARS, MAKES, BODY_TYPES, FUELS, TRANSMISSIONS, type Car } from "@/lib/cars";

type SearchParams = {
  q?: string;
  make?: string;
  model?: string;
  bodyType?: string;
  priceMax?: string;
  postcode?: string;
};

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
      { name: "description", content: "Browse and filter thousands of cars from trusted UK dealers." },
    ],
  }),
  component: SearchPage,
});

type Sort = "best" | "price-asc" | "price-desc" | "miles-asc" | "year-desc";

function SearchPage() {
  const sp = Route.useSearch();
  const [make, setMake] = useState(sp.make ?? "any");
  const [bodyType, setBodyType] = useState(sp.bodyType ?? "any");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, sp.priceMax ? Number(sp.priceMax) : 60000]);
  const [mileageMax, setMileageMax] = useState(150000);
  const [yearMin, setYearMin] = useState(2010);
  const [fuels, setFuels] = useState<string[]>([]);
  const [transmissions, setTransmissions] = useState<string[]>([]);
  const [sort, setSort] = useState<Sort>("best");
  const [q, setQ] = useState(sp.q ?? "");

  const filtered = useMemo(() => {
    const list: Car[] = CARS.filter((c) => {
      if (make !== "any" && c.make !== make) return false;
      if (bodyType !== "any" && c.bodyType !== bodyType) return false;
      if (c.price < priceRange[0] || c.price > priceRange[1]) return false;
      if (c.mileage > mileageMax) return false;
      if (c.year < yearMin) return false;
      if (fuels.length && !fuels.includes(c.fuel)) return false;
      if (transmissions.length && !transmissions.includes(c.transmission)) return false;
      if (q) {
        const hay = `${c.make} ${c.model} ${c.trim}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const order: Record<Sort, (a: Car, b: Car) => number> = {
      "best": (a, b) => dealScore(b) - dealScore(a),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      "miles-asc": (a, b) => a.mileage - b.mileage,
      "year-desc": (a, b) => b.year - a.year,
    };
    return [...list].sort(order[sort]);
  }, [make, bodyType, priceRange, mileageMax, yearMin, fuels, transmissions, sort, q]);

  function toggle(arr: string[], v: string, set: (a: string[]) => void) {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6">
        <aside className="hidden w-72 shrink-0 lg:block">
          <div className="sticky top-20 space-y-6 rounded-lg border bg-card p-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Filters</h2>

            <Filter label="Keyword">
              <Input placeholder="e.g. quattro, S line" value={q} onChange={(e) => setQ(e.target.value)} />
            </Filter>

            <Filter label="Make">
              <Select value={make} onValueChange={setMake}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any make</SelectItem>
                  {MAKES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </Filter>

            <Filter label="Body type">
              <Select value={bodyType} onValueChange={setBodyType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any body type</SelectItem>
                  {BODY_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </Filter>

            <Filter label={`Price: £${priceRange[0].toLocaleString()} – £${priceRange[1].toLocaleString()}`}>
              <Slider min={0} max={60000} step={500} value={priceRange} onValueChange={(v) => setPriceRange([v[0], v[1]] as [number, number])} />
            </Filter>

            <Filter label={`Max mileage: ${mileageMax.toLocaleString()} mi`}>
              <Slider min={5000} max={150000} step={5000} value={[mileageMax]} onValueChange={(v) => setMileageMax(v[0])} />
            </Filter>

            <Filter label={`Year from: ${yearMin}`}>
              <Slider min={2010} max={2025} step={1} value={[yearMin]} onValueChange={(v) => setYearMin(v[0])} />
            </Filter>

            <Filter label="Fuel type">
              <div className="space-y-2">
                {FUELS.map((f) => (
                  <label key={f} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={fuels.includes(f)} onCheckedChange={() => toggle(fuels, f, setFuels)} />
                    {f}
                  </label>
                ))}
              </div>
            </Filter>

            <Filter label="Transmission">
              <div className="space-y-2">
                {TRANSMISSIONS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={transmissions.includes(t)} onCheckedChange={() => toggle(transmissions, t, setTransmissions)} />
                    {t}
                  </label>
                ))}
              </div>
            </Filter>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-navy">
                {filtered.length} cars {make !== "any" ? `· ${make}` : ""}
              </h1>
              <p className="text-xs text-muted-foreground">Showing best matches first</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by</span>
              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="best">Best deal</SelectItem>
                  <SelectItem value="price-asc">Price: low to high</SelectItem>
                  <SelectItem value="price-desc">Price: high to low</SelectItem>
                  <SelectItem value="miles-asc">Lowest mileage</SelectItem>
                  <SelectItem value="year-desc">Newest first</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <div className="text-lg font-semibold">No cars match your filters</div>
              <p className="mt-2 text-sm text-muted-foreground">Try widening your price or mileage range.</p>
              <Button asChild className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90">
                <Link to="/search">Reset filters</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function dealScore(c: Car) {
  return { great: 4, good: 3, fair: 2, high: 1 }[c.deal];
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-foreground">{label}</div>
      {children}
    </div>
  );
}
