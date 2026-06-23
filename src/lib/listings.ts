export type DBListing = {
  id: string;
  seller_id: string | null;
  make: string;
  model: string;
  trim: string | null;
  year: number;
  price: number;
  mileage: number;
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  body_type: string | null;
  exterior_color: string | null;
  engine: string | null;
  doors: number | null;
  seats: number | null;
  location: string | null;
  description: string | null;
  features: string[];
  image_url: string | null;
  status: "active" | "sold" | "pending" | "draft";
  views: number;
  sold_at: string | null;
  sold_price: number | null;
  created_at: string;
  updated_at: string;
};

export const FUELS = ["Petrol", "Diesel", "Hybrid", "Electric"] as const;
export const TRANSMISSIONS = ["Automatic", "Manual"] as const;
export const BODY_TYPES = ["Saloon", "Estate", "Coupe", "SUV", "Hatchback", "Convertible"] as const;

export function fmtPrice(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(Number(n));
}
export function fmtMiles(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-GB").format(n) + " mi";
}
export function fmtDate(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
