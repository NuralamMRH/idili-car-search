import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MAKES, formatPrice } from "@/lib/cars";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell my car — idilicar4sales" },
      { name: "description", content: "Get a free instant valuation and list your car to thousands of UK buyers." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const [reg, setReg] = useState("");
  const [make, setMake] = useState("any");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [estimate, setEstimate] = useState<number | null>(null);

  function valuate(e: React.FormEvent) {
    e.preventDefault();
    const base = 25000 - (2025 - Number(year || 2020)) * 1800 - Number(mileage || 0) * 0.08;
    setEstimate(Math.max(1500, Math.round(base / 100) * 100));
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-extrabold tracking-tight">Sell your car the smart way</h1>
              <p className="mt-2 text-lg text-white/80">
                Get an instant valuation, list to thousands of buyers, and close the deal faster.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto -mt-10 max-w-3xl px-4">
          <form onSubmit={valuate} className="rounded-xl border bg-card p-6 shadow-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand">
              <Sparkles className="h-4 w-4" /> Instant valuation
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Registration">
                <Input value={reg} onChange={(e) => setReg(e.target.value.toUpperCase())} placeholder="AB12 CDE" />
              </Field>
              <Field label="Make">
                <Select value={make} onValueChange={setMake}>
                  <SelectTrigger><SelectValue placeholder="Select make" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Select make</SelectItem>
                    {MAKES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Year">
                <Input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2020" />
              </Field>
              <Field label="Mileage">
                <Input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} placeholder="35000" />
              </Field>
            </div>
            <Button type="submit" className="mt-5 h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90">
              Get my valuation
            </Button>

            {estimate !== null && (
              <div className="mt-5 rounded-lg border bg-deal-great/10 p-5 text-center">
                <div className="text-sm text-muted-foreground">Estimated value</div>
                <div className="text-3xl font-extrabold text-deal-great">{formatPrice(estimate)}</div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Based on current market data for similar listings on idilicar4sales.
                </p>
                <Button className="mt-4 bg-brand text-brand-foreground hover:bg-brand/90">List my car now</Button>
              </div>
            )}
          </form>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold text-navy">How it works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, t: "Get your price", d: "Free instant valuation based on real-time market data." },
              { n: 2, t: "List in minutes", d: "Add photos and details. Your listing goes live straight away." },
              { n: 3, t: "Sell with confidence", d: "Chat to verified buyers and complete the sale securely." },
            ].map((s) => (
              <div key={s.n} className="rounded-lg border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-brand-foreground font-bold">{s.n}</div>
                <div className="mt-3 font-semibold text-navy">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
