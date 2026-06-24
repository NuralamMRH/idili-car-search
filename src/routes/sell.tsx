import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Upload } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { FUELS, TRANSMISSIONS, BODY_TYPES, fmtPrice } from "@/lib/listings";

export const Route = createFileRoute("/sell")({
  head: () => ({
    meta: [
      { title: "Sell my car — idilicar4sales" },
      { name: "description", content: "Free instant valuation and list your car to thousands of UK buyers." },
    ],
  }),
  component: SellPage,
});

function SellPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    make: "", model: "", trim: "", year: new Date().getFullYear() - 3, price: 15000, mileage: 30000,
    fuel: "Petrol", transmission: "Automatic", body_type: "Saloon", exterior_color: "",
    engine: "", doors: 4, seats: 5, location: "", description: "", features: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [newImage, setNewImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [estimate, setEstimate] = useState<number | null>(null);

  function addImage() {
    const url = newImage.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return toast.error("Enter a valid http(s) image URL");
    setImages((arr) => [...arr, url]);
    setNewImage("");
  }
  function removeImage(i: number) {
    setImages((arr) => arr.filter((_, idx) => idx !== i));
  }
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const urls = await Promise.all(
      files.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(f);
          }),
      ),
    );
    setImages((arr) => [...arr, ...urls]);
    e.target.value = "";
  }

  function valuate() {
    const base = 25000 - (2026 - Number(form.year || 2020)) * 1800 - Number(form.mileage || 0) * 0.08;
    const e = Math.max(1500, Math.round(base / 100) * 100);
    setEstimate(e);
    setForm((f) => ({ ...f, price: e }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth", search: { redirect: "/sell" } });
    setBusy(true);
    const features = form.features.split(",").map((s) => s.trim()).filter(Boolean);
    const { data, error } = await (supabase as any).from("listings").insert({
      seller_id: user.id,
      make: form.make, model: form.model, trim: form.trim || null,
      year: Number(form.year), price: Number(form.price), mileage: Number(form.mileage),
      fuel: form.fuel, transmission: form.transmission, body_type: form.body_type,
      exterior_color: form.exterior_color || null, engine: form.engine || null,
      doors: Number(form.doors), seats: Number(form.seats), location: form.location || null,
      description: form.description || null,
      image_url: images[0] || null,
      images,
      features, status: "active",
    }).select().single();
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Your car is now live!");
    navigate({ to: "/listings/$id", params: { id: data.id } });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-navy text-white">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <h1 className="text-3xl font-extrabold">Sell your car the smart way</h1>
            <p className="mt-2 text-white/80">Get an instant valuation and list to thousands of UK buyers — in minutes.</p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10">
          {!user && (
            <div className="mb-4 rounded-lg border border-brand/30 bg-brand/5 p-4 text-sm">
              <Link to="/auth" search={{ mode: "signup", redirect: "/sell" }} className="font-semibold text-brand hover:underline">
                Sign in or register
              </Link>{" "}to publish your listing. You can still fill out the form below.
            </div>
          )}

          <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
                <Sparkles className="h-4 w-4" /> Vehicle details
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Make"><Input required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} placeholder="Audi" /></Field>
                <Field label="Model"><Input required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="A5" /></Field>
                <Field label="Trim"><Input value={form.trim} onChange={(e) => setForm({ ...form, trim: e.target.value })} placeholder="40 TFSI S line" /></Field>
                <Field label="Year"><Input type="number" required value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} /></Field>
                <Field label="Mileage"><Input type="number" required value={form.mileage} onChange={(e) => setForm({ ...form, mileage: Number(e.target.value) })} /></Field>
                <Field label="Asking price (£)"><Input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></Field>
                <Field label="Body type">
                  <Select value={form.body_type} onValueChange={(v) => setForm({ ...form, body_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{BODY_TYPES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Fuel">
                  <Select value={form.fuel} onValueChange={(v) => setForm({ ...form, fuel: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{FUELS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Transmission">
                  <Select value={form.transmission} onValueChange={(v) => setForm({ ...form, transmission: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TRANSMISSIONS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Colour"><Input value={form.exterior_color} onChange={(e) => setForm({ ...form, exterior_color: e.target.value })} /></Field>
                <Field label="Engine"><Input value={form.engine} onChange={(e) => setForm({ ...form, engine: e.target.value })} placeholder="2.0L TDI" /></Field>
                <Field label="Location"><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="London" /></Field>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={valuate} className="mt-3">
                <Sparkles className="mr-1.5 h-3 w-3" /> Suggest a price
              </Button>
              {estimate !== null && <span className="ml-3 text-sm text-deal-great">Suggested: {fmtPrice(estimate)}</span>}
            </div>

            <Field label="Photo URL (paste a public image link)">
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </Field>
            <Field label="Features (comma-separated)">
              <Input value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Sat nav, Heated seats, Cruise control" />
            </Field>
            <Field label="Description">
              <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>

            <Button type="submit" disabled={busy || !user} className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90">
              <Upload className="mr-2 h-4 w-4" /> {busy ? "Publishing..." : user ? "Publish listing" : "Sign in to publish"}
            </Button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}
