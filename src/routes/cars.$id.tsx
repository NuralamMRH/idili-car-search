import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, MapPin, Phone, Share2, Star, Check, ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCar, dealColor, dealLabel, formatMiles, formatPrice, CARS } from "@/lib/cars";
import { CarCard } from "@/components/car-card";

export const Route = createFileRoute("/cars/$id")({
  loader: ({ params }) => {
    const car = getCar(params.id);
    if (!car) throw notFound();
    return { car };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.car.year} ${loaderData.car.make} ${loaderData.car.model} — idilicar4sales` },
          { name: "description", content: loaderData.car.description },
          { property: "og:title", content: `${loaderData.car.year} ${loaderData.car.make} ${loaderData.car.model}` },
          { property: "og:description", content: loaderData.car.description },
          { property: "og:image", content: loaderData.car.image },
        ]
      : [{ title: "Car details" }],
  }),
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col"><SiteHeader />
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Car not found</h1>
        <Button asChild className="mt-4"><Link to="/search">Back to search</Link></Button>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="p-8 text-center">
      <p>{error.message}</p>
      <Button onClick={reset} className="mt-4">Retry</Button>
    </div>
  ),
  component: CarDetail,
});

function CarDetail() {
  const { car } = Route.useLoaderData();
  const similar = CARS.filter((c) => c.id !== car.id && c.make === car.make).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Link to="/search" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to results
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="overflow-hidden rounded-lg border bg-card">
              <div className="relative aspect-[16/10] bg-muted">
                <img src={car.image} alt={`${car.year} ${car.make} ${car.model}`} className="h-full w-full object-cover" />
                <Badge className={`absolute left-3 top-3 ${dealColor(car.deal)} border-0 text-sm`}>{dealLabel(car.deal)}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-1 p-1">
                {[0,1,2,3].map((i) => (
                  <div key={i} className="aspect-[4/3] overflow-hidden rounded bg-muted">
                    <img src={car.image} alt="" className="h-full w-full object-cover opacity-80" />
                  </div>
                ))}
              </div>
            </div>

            <section className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="text-lg font-bold text-navy">Vehicle details</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <Spec k="Mileage" v={formatMiles(car.mileage)} />
                <Spec k="Year" v={String(car.year)} />
                <Spec k="Fuel" v={car.fuel} />
                <Spec k="Transmission" v={car.transmission} />
                <Spec k="Body" v={car.bodyType} />
                <Spec k="Engine" v={car.engine} />
                <Spec k="Doors" v={String(car.doors)} />
                <Spec k="Seats" v={String(car.seats)} />
                <Spec k="Colour" v={car.exteriorColor} />
              </dl>
            </section>

            <section className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="text-lg font-bold text-navy">Description</h2>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{car.description}</p>
            </section>

            <section className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="text-lg font-bold text-navy">Features</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                {car.features.map((f: string) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-deal-great" /> {f}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">{car.trim}</div>
                <h1 className="mt-1 text-2xl font-bold text-navy">{car.year} {car.make} {car.model}</h1>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold">{formatPrice(car.price)}</span>
                  {car.belowMarket && (
                    <span className="text-sm font-semibold text-deal-great">{formatPrice(car.belowMarket)} below market</span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {car.location}
                </div>
                <div className="mt-5 space-y-2">
                  <Button className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90">
                    <Phone className="mr-2 h-4 w-4" /> Contact dealer
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline"><Heart className="mr-2 h-4 w-4" /> Save</Button>
                    <Button variant="outline"><Share2 className="mr-2 h-4 w-4" /> Share</Button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="text-sm font-semibold text-navy">{car.dealer}</div>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-deal-fair text-deal-fair" />
                  <span className="font-medium">{car.dealerRating}</span>
                  <span className="text-muted-foreground">({car.reviews} reviews)</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{car.location}</div>
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-4 text-xl font-bold text-navy">Similar {car.make}s</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((c) => <CarCard key={c.id} car={c} />)}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{k}</dt>
      <dd className="font-medium text-foreground">{v}</dd>
    </div>
  );
}
