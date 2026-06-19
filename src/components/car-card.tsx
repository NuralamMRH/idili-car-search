import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Star } from "lucide-react";
import { type Car, dealColor, dealLabel, formatMiles, formatPrice } from "@/lib/cars";
import { Badge } from "@/components/ui/badge";

export function CarCard({ car }: { car: Car }) {
  return (
    <Link
      to="/cars/$id"
      params={{ id: car.id }}
      className="group flex flex-col overflow-hidden rounded-lg border bg-card transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-foreground shadow hover:bg-white"
          aria-label="Save"
        >
          <Heart className="h-4 w-4" />
        </button>
        <Badge className={`absolute left-2 top-2 ${dealColor(car.deal)} border-0`}>
          {dealLabel(car.deal)}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight text-navy group-hover:text-brand">
            {car.year} {car.make} {car.model}
          </h3>
        </div>
        <div className="text-xs text-muted-foreground">{car.trim}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground">{formatPrice(car.price)}</span>
          {car.belowMarket && (
            <span className="text-xs font-medium text-deal-great">
              {formatPrice(car.belowMarket)} below market
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>{formatMiles(car.mileage)}</span>
          <span>•</span>
          <span>{car.fuel}</span>
          <span>•</span>
          <span>{car.transmission}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2 text-xs">
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" /> {car.location}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Star className="h-3 w-3 fill-deal-fair text-deal-fair" /> {car.dealerRating}
            <span className="text-foreground/40">({car.reviews})</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
