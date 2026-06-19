export type DealRating = "great" | "good" | "fair" | "high";

export type Car = {
  id: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  mileage: number;
  fuel: "Petrol" | "Diesel" | "Hybrid" | "Electric";
  transmission: "Automatic" | "Manual";
  bodyType: "Saloon" | "Estate" | "Coupe" | "SUV" | "Hatchback" | "Convertible";
  exteriorColor: string;
  engine: string;
  doors: number;
  seats: number;
  location: string;
  dealer: string;
  dealerRating: number;
  reviews: number;
  deal: DealRating;
  belowMarket?: number;
  image: string;
  description: string;
  features: string[];
};

export const CARS: Car[] = [
  {
    id: "1", make: "Audi", model: "A5", trim: "40 TFSI S line", year: 2022,
    price: 28995, mileage: 18450, fuel: "Petrol", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Glacier White", engine: "2.0L", doors: 2, seats: 4,
    location: "London", dealer: "Imperial Auto Trade", dealerRating: 4.7, reviews: 312,
    deal: "great", belowMarket: 1820,
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/11/16/49/2022_audi_a5-pic-2312565679931934014-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Stunning S line A5 with full service history, panoramic roof and virtual cockpit. One owner from new.",
    features: ["Panoramic roof", "Virtual cockpit", "Heated seats", "Apple CarPlay", "Parking sensors", "LED matrix headlights"],
  },
  {
    id: "2", make: "Audi", model: "A5", trim: "Sportback Black Edition", year: 2021,
    price: 24750, mileage: 32100, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Mythos Black", engine: "2.0L TDI", doors: 5, seats: 5,
    location: "Manchester", dealer: "Northwest Premium Cars", dealerRating: 4.5, reviews: 184,
    deal: "good", belowMarket: 640,
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/02/11/33/2021_audi_a5-pic-6785869306166248525-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Beautiful Black Edition Sportback with black optic pack, 19\" alloys and full leather.",
    features: ["Black optic pack", "19\" alloys", "Leather interior", "Sat nav", "Bang & Olufsen sound"],
  },
  {
    id: "3", make: "Audi", model: "A5", trim: "2.0 TDI Sport", year: 2020,
    price: 19495, mileage: 45200, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Daytona Grey", engine: "2.0L TDI", doors: 2, seats: 4,
    location: "Birmingham", dealer: "Midlands Motor Co.", dealerRating: 4.3, reviews: 96,
    deal: "good",
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/09/08/57/2020_audi_a5-pic-833376768084165293-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Well-maintained A5 Sport with full Audi service history.",
    features: ["Sat nav", "Cruise control", "DAB radio", "Bluetooth"],
  },
  {
    id: "4", make: "Audi", model: "A5", trim: "2.0 TFSI S line", year: 2019,
    price: 17995, mileage: 52800, fuel: "Petrol", transmission: "Manual",
    bodyType: "Coupe", exteriorColor: "Nano Grey", engine: "2.0L TFSI", doors: 2, seats: 4,
    location: "Leeds", dealer: "Yorkshire Prestige", dealerRating: 4.6, reviews: 221,
    deal: "fair",
    image: "https://static-eu.cargurus.com/images/forsale/2026/03/12/08/47/2019_audi_a5-pic-5022834830097572986-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Sharp S line spec with sports suspension and 19\" rotor alloys.",
    features: ["Sports suspension", "19\" alloys", "Half leather", "Xenon lights"],
  },
  {
    id: "5", make: "Audi", model: "A5", trim: "45 TFSI quattro S line", year: 2025,
    price: 42990, mileage: 4200, fuel: "Petrol", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Tango Red", engine: "2.0L TFSI quattro", doors: 5, seats: 5,
    location: "Bristol", dealer: "South West Audi Specialists", dealerRating: 4.8, reviews: 412,
    deal: "great", belowMarket: 2410,
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/11/14/31/2025_audi_a5-pic-9154256614250759594-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Nearly new 2025 A5 quattro S line in stunning Tango Red. Massive spec.",
    features: ["Quattro AWD", "Matrix LED", "Head-up display", "Adaptive cruise", "B&O sound", "Heated/ventilated seats"],
  },
  {
    id: "6", make: "Audi", model: "A5", trim: "2.0 TDI S line", year: 2018,
    price: 14995, mileage: 68500, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Ibis White", engine: "2.0L TDI", doors: 2, seats: 4,
    location: "Glasgow", dealer: "Caledonian Cars", dealerRating: 4.2, reviews: 67,
    deal: "good",
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/04/11/32/2018_audi_a5-pic-1709662683758984558-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Clean A5 S line with full service history and 2 keys.",
    features: ["S line styling", "Sat nav", "Leather seats", "Cruise control"],
  },
  {
    id: "7", make: "Audi", model: "A5", trim: "40 TDI Black Edition", year: 2025,
    price: 46500, mileage: 1850, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Mythos Black", engine: "2.0L TDI", doors: 5, seats: 5,
    location: "Edinburgh", dealer: "Capital Prestige", dealerRating: 4.9, reviews: 528,
    deal: "great", belowMarket: 1990,
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/16/14/45/2025_audi_a5-pic-1571904337621843131-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Top-spec Black Edition with virtually every option box ticked.",
    features: ["Black Edition pack", "21\" alloys", "Pano roof", "B&O 3D sound", "Massage seats"],
  },
  {
    id: "8", make: "Audi", model: "A5", trim: "2.0 TFSI Sport", year: 2018,
    price: 13750, mileage: 71200, fuel: "Petrol", transmission: "Manual",
    bodyType: "Coupe", exteriorColor: "Florett Silver", engine: "2.0L TFSI", doors: 2, seats: 4,
    location: "Liverpool", dealer: "Merseyside Motors", dealerRating: 4.0, reviews: 42,
    deal: "high",
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/16/12/26/2018_audi_a5-pic-8997445905211967823-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Tidy A5 Sport with recent service.",
    features: ["Sat nav", "Bluetooth", "Cruise control"],
  },
  {
    id: "9", make: "Audi", model: "A5", trim: "2.0 TDI Quattro", year: 2015,
    price: 9995, mileage: 92400, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Coupe", exteriorColor: "Phantom Black", engine: "2.0L TDI quattro", doors: 2, seats: 4,
    location: "Sheffield", dealer: "Steel City Autos", dealerRating: 4.1, reviews: 58,
    deal: "fair",
    image: "https://static-eu.cargurus.com/images/forsale/2026/06/18/18/21/2015_audi_a5-pic-7507482431451413980-1024x768.jpeg?io=true&width=640&height=480&fit=bounds&format=jpg&auto=webp",
    description: "Bargain quattro A5 with full leather and sat nav.",
    features: ["Quattro AWD", "Full leather", "Sat nav", "Heated seats"],
  },
  {
    id: "10", make: "BMW", model: "3 Series", trim: "320d M Sport", year: 2022,
    price: 26995, mileage: 24500, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Saloon", exteriorColor: "Alpine White", engine: "2.0L", doors: 4, seats: 5,
    location: "London", dealer: "City BMW Specialists", dealerRating: 4.6, reviews: 290,
    deal: "great", belowMarket: 1500,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1024&q=80",
    description: "Immaculate 320d M Sport with M Sport Plus pack.",
    features: ["M Sport Plus", "Harman Kardon", "Pro nav", "Heated seats"],
  },
  {
    id: "11", make: "Mercedes-Benz", model: "C-Class", trim: "C220d AMG Line", year: 2023,
    price: 32500, mileage: 12800, fuel: "Diesel", transmission: "Automatic",
    bodyType: "Saloon", exteriorColor: "Obsidian Black", engine: "2.0L", doors: 4, seats: 5,
    location: "Manchester", dealer: "Northern Mercedes", dealerRating: 4.7, reviews: 356,
    deal: "good", belowMarket: 720,
    image: "https://images.unsplash.com/photo-1617814086367-b9b1f3b6a0e3?w=1024&q=80",
    description: "Latest-gen C-Class AMG Line Premium with MBUX and digital cockpit.",
    features: ["MBUX", "Digital cockpit", "AMG Line", "Burmester sound"],
  },
  {
    id: "12", make: "Tesla", model: "Model 3", trim: "Long Range", year: 2023,
    price: 29995, mileage: 18900, fuel: "Electric", transmission: "Automatic",
    bodyType: "Saloon", exteriorColor: "Pearl White", engine: "Dual Motor", doors: 4, seats: 5,
    location: "Bristol", dealer: "EV Hub Bristol", dealerRating: 4.8, reviews: 198,
    deal: "great", belowMarket: 2100,
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1024&q=80",
    description: "Long Range Model 3 with Enhanced Autopilot and tow bar.",
    features: ["Enhanced Autopilot", "Premium interior", "Tow bar", "Heat pump"],
  },
];

export const MAKES = Array.from(new Set(CARS.map((c) => c.make))).sort();
export const BODY_TYPES: Car["bodyType"][] = ["Saloon", "Estate", "Coupe", "SUV", "Hatchback", "Convertible"];
export const FUELS: Car["fuel"][] = ["Petrol", "Diesel", "Hybrid", "Electric"];
export const TRANSMISSIONS: Car["transmission"][] = ["Automatic", "Manual"];

export function getCar(id: string) {
  return CARS.find((c) => c.id === id);
}

export function dealLabel(d: DealRating) {
  return { great: "Great Deal", good: "Good Deal", fair: "Fair Deal", high: "High Price" }[d];
}

export function dealColor(d: DealRating) {
  return {
    great: "bg-deal-great text-white",
    good: "bg-deal-good text-white",
    fair: "bg-deal-fair text-foreground",
    high: "bg-muted text-muted-foreground",
  }[d];
}

export function formatPrice(n: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

export function formatMiles(n: number) {
  return new Intl.NumberFormat("en-GB").format(n) + " mi";
}
