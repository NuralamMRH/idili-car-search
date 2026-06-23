import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Calculator, Car, Fuel, ShieldCheck, TrendingDown } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Car research & buying guides — idilicar4sales" },
      { name: "description", content: "Expert car reviews, buying guides, finance and ownership advice for UK buyers." },
      { property: "og:title", content: "Car research & buying guides — idilicar4sales" },
    ],
  }),
  component: ResearchPage,
});

const TOPICS = [
  { icon: Calculator, title: "Car finance explained", desc: "HP vs PCP vs leasing — pick the right deal for your budget.", tag: "Finance" },
  { icon: ShieldCheck, title: "Used car checks", desc: "MOT, HPI, service history — what to verify before you buy.", tag: "Buying" },
  { icon: TrendingDown, title: "Depreciation league", desc: "Which cars hold their value best in 2026 — by class.", tag: "Ownership" },
  { icon: Fuel, title: "Petrol, diesel, EV or hybrid?", desc: "Total-cost comparison over 3 and 5 years.", tag: "Running costs" },
  { icon: Car, title: "Best family SUVs under £25k", desc: "Our top 10 picks rated by space, safety and reliability.", tag: "Top 10" },
  { icon: BookOpen, title: "Selling privately vs trade-in", desc: "How much more you'll pocket — and the time it costs.", tag: "Selling" },
];

const GUIDES = [
  { title: "How to negotiate the best price", read: "6 min" },
  { title: "Reading a vehicle history report", read: "5 min" },
  { title: "When to walk away from a deal", read: "4 min" },
  { title: "Insurance groups explained", read: "3 min" },
];

function ResearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h1 className="text-3xl font-extrabold">Research & buying guides</h1>
            <p className="mt-2 max-w-2xl text-white/80">
              Make smarter decisions with expert reviews, finance guides and ownership advice — written for UK car buyers.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <h2 className="text-xl font-bold text-navy">Featured topics</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOPICS.map((t) => (
              <div key={t.title} className="group rounded-lg border bg-card p-5 transition hover:border-brand hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">{t.tag}</span>
                </div>
                <h3 className="mt-3 font-semibold text-navy group-hover:text-brand">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-muted/40 py-10">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-xl font-bold text-navy">Quick guides</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {GUIDES.map((g) => (
                <div key={g.title} className="flex items-center justify-between rounded-lg border bg-card p-4">
                  <span className="font-medium">{g.title}</span>
                  <span className="text-xs text-muted-foreground">{g.read} read</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 text-center">
          <h2 className="text-2xl font-bold text-navy">Ready to find your next car?</h2>
          <p className="mt-2 text-muted-foreground">Browse thousands of cars from trusted UK dealers.</p>
          <Link to="/search" className="mt-4 inline-block rounded-md bg-brand px-5 py-2.5 font-semibold text-brand-foreground hover:bg-brand/90">
            Browse cars
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
