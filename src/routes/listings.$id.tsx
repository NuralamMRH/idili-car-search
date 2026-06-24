import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Heart, MapPin, Tag, Share2, ChevronLeft, ChevronRight,
  Images, Calendar, ArrowLeftRight, Plus, Phone, Star,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtPrice, fmtMiles, type DBListing } from "@/lib/listings";

export const Route = createFileRoute("/listings/$id")({
  head: () => ({ meta: [{ title: "Car details — idilicar4sales" }] }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async (): Promise<DBListing | null> => {
      const { data, error } = await (supabase as any).from("listings").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: seller } = useQuery({
    queryKey: ["seller", listing?.seller_id],
    enabled: !!listing?.seller_id,
    queryFn: async () => {
      const { data } = await (supabase as any).from("profiles").select("*").eq("id", listing!.seller_id).maybeSingle();
      return data;
    },
  });

  const { data: recommended } = useQuery({
    queryKey: ["dealer-recommended", listing?.seller_id, id],
    enabled: !!listing?.seller_id,
    queryFn: async (): Promise<DBListing[]> => {
      const { data } = await (supabase as any)
        .from("listings")
        .select("*")
        .eq("seller_id", listing!.seller_id)
        .neq("id", id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const { data: fav } = useQuery({
    queryKey: ["fav", id, user?.id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data } = await (supabase as any).from("favorites").select("id").eq("user_id", user!.id).eq("listing_id", id).maybeSingle();
      return data;
    },
  });

  async function toggleFav() {
    if (!user) return navigate({ to: "/auth", search: { redirect: `/listings/${id}` } });
    if (fav) {
      await (supabase as any).from("favorites").delete().eq("id", fav.id);
      toast.success("Removed from saved");
    } else {
      await (supabase as any).from("favorites").insert({ user_id: user.id, listing_id: id });
      toast.success("Saved!");
    }
    qc.invalidateQueries({ queryKey: ["fav", id] });
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ url, title: document.title });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {}
  }

  if (isLoading) {
    return <div className="flex min-h-screen flex-col"><SiteHeader /><div className="p-12 text-center text-muted-foreground">Loading...</div></div>;
  }
  if (!listing) {
    return <div className="flex min-h-screen flex-col"><SiteHeader />
      <div className="p-12 text-center"><h1 className="text-xl font-bold">Listing not found</h1>
        <Button asChild className="mt-4"><Link to="/search">Back to search</Link></Button></div></div>;
  }

  const isOwner = user?.id === listing.seller_id;
  const images = (listing.images && listing.images.length ? listing.images : [listing.image_url].filter(Boolean)) as string[];
  const sellerName = seller?.dealer_name || seller?.display_name || seller?.full_name || "Private seller";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Link to="/search" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
          <ChevronLeft className="h-4 w-4" /> All results
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          {/* LEFT */}
          <div>
            <Gallery images={images} onShare={share} onFav={toggleFav} faved={!!fav} />

            <section className="mt-8">
              <h2 className="text-2xl font-bold text-navy">Features</h2>
              <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <FeatureItem k="Mileage" v={fmtMiles(listing.mileage).replace(" mi", "")} />
                <FeatureItem k="Drivetrain" v="Front-wheel drive" />
                <FeatureItem k="Exterior colour" v={listing.exterior_color ?? "—"} />
                <FeatureItem k="Engine" v={listing.engine ?? listing.fuel} />
                <FeatureItem k="Transmission" v={listing.transmission} />
                <FeatureItem k="Body" v={listing.body_type ?? "—"} />
                <FeatureItem k="Year" v={String(listing.year)} />
                <FeatureItem k="Fuel" v={listing.fuel} />
                <FeatureItem k="Doors" v={listing.doors?.toString() ?? "—"} />
                <FeatureItem k="Seats" v={listing.seats?.toString() ?? "—"} />
              </div>
            </section>

            {listing.description && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-navy">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{listing.description}</p>
              </section>
            )}

            {listing.features?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold text-navy">Included features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-deal-great" />{f}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* RIGHT */}
          <aside>
            <div className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold leading-tight text-navy">
                  {listing.year} {listing.make} {listing.model}{listing.trim ? ` ${listing.trim}` : ""}
                </h1>
                {listing.location && (
                  <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {listing.location}
                  </div>
                )}
                {listing.status !== "active" && <Badge className="mt-2 capitalize">{listing.status}</Badge>}
                <div className="mt-3 text-3xl font-extrabold text-navy">{fmtPrice(listing.price)}</div>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <div>
                    <Badge className="bg-deal-fair text-white hover:bg-deal-fair">● Fair Deal</Badge>
                    <div className="mt-1 text-xs text-muted-foreground">Competitively priced</div>
                  </div>
                  {seller && (
                    <div className="text-right">
                      <div className="text-xs font-semibold text-navy">Dealer rating</div>
                      <div className="mt-0.5 flex items-center justify-end gap-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`h-3.5 w-3.5 ${i <= 3 ? "fill-brand text-brand" : "text-muted-foreground/30"}`} />)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {!isOwner && listing.status === "active" && listing.seller_id ? (
                <RequestInfoCard listing={listing} sellerPhone={seller?.phone} />
              ) : isOwner ? (
                <div className="rounded-lg border bg-muted p-4 text-sm text-muted-foreground">
                  This is your listing. Manage it from your <Link to="/dashboard/listings" className="text-brand hover:underline">dashboard</Link>.
                </div>
              ) : null}

              {seller && listing.seller_id && (
                <Link to="/dealers/$id" params={{ id: listing.seller_id }} className="block rounded-lg border bg-card p-4 transition hover:border-brand hover:shadow-md">
                  <div className="text-xs uppercase text-muted-foreground">Sold by</div>
                  <div className="mt-1 font-semibold text-navy">{sellerName}</div>
                  {seller.is_dealer && <Badge className="mt-1">Verified dealer</Badge>}
                  <div className="mt-2 text-xs font-semibold text-brand">View seller profile →</div>
                </Link>
              )}
            </div>
          </aside>
        </div>

        {/* RECOMMENDED FROM DEALER */}
        {recommended && recommended.length > 0 && (
          <section className="mt-14 border-t pt-10">
            <h2 className="text-2xl font-bold text-navy">Recommended from this dealer</h2>
            <p className="mt-1 text-sm text-muted-foreground">More cars from {sellerName}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((c) => (
                <Link key={c.id} to="/listings/$id" params={{ id: c.id }} className="group overflow-hidden rounded-lg border bg-card transition hover:shadow-lg">
                  <div className="aspect-[4/3] bg-muted">
                    {c.image_url
                      ? <img src={c.image_url} alt="" className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" />
                      : <div className="grid h-full w-full place-items-center text-muted-foreground">No image</div>}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold text-navy group-hover:text-brand">{c.year} {c.make} {c.model}</div>
                    <div className="mt-1 text-lg font-bold">{fmtPrice(c.price)}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{fmtMiles(c.mileage)} • {c.fuel} • {c.transmission}</div>
                  </div>
                </Link>
              ))}
            </div>
            {listing.seller_id && (
              <div className="mt-6 text-center">
                <Button asChild variant="outline">
                  <Link to="/dealers/$id" params={{ id: listing.seller_id }}>See all from this dealer</Link>
                </Button>
              </div>
            )}
          </section>
        )}

        {!isOwner && listing.status === "active" && listing.seller_id && (
          <section className="mt-10 flex justify-center">
            <OfferDialog listing={listing} />
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function FeatureItem({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/20 text-navy">
        <div className="h-2 w-2 rounded-full bg-navy" />
      </div>
      <div>
        <div className="font-bold text-navy">{k}</div>
        <div className="text-sm text-muted-foreground">{v}</div>
      </div>
    </div>
  );
}

function Gallery({ images, onShare, onFav, faved }: { images: string[]; onShare: () => void; onFav: () => void; faved: boolean }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="grid aspect-[16/10] place-items-center bg-muted text-muted-foreground">No image</div>
      </div>
    );
  }
  const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
  const next = () => setIdx((i) => (i + 1) % images.length);
  return (
    <div>
      <div className="relative overflow-hidden rounded-lg border bg-card">
        <div className="aspect-[16/10] bg-muted">
          <img src={images[idx]} alt="" className="h-full w-full object-cover" />
        </div>
        <span className="absolute left-3 top-3 rounded bg-navy px-2 py-1 text-xs font-semibold text-white">Sponsored</span>
        <div className="absolute right-3 top-3 flex gap-2">
          <button onClick={onShare} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow hover:bg-muted" aria-label="Share">
            <Share2 className="h-4 w-4 text-navy" />
          </button>
          <button onClick={onFav} className="grid h-10 w-10 place-items-center rounded-full bg-white shadow hover:bg-muted" aria-label="Save">
            <Heart className={`h-4 w-4 ${faved ? "fill-brand text-brand" : "text-navy"}`} />
          </button>
        </div>
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white" aria-label="Previous">
              <ChevronLeft className="h-5 w-5 text-navy" />
            </button>
            <button onClick={next} className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 shadow hover:bg-white" aria-label="Next">
              <ChevronRight className="h-5 w-5 text-navy" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded bg-navy/80 px-2 py-1 text-xs font-semibold text-white">
          <Images className="h-3 w-3" /> {idx + 1}/{images.length}
        </span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button onClick={prev} className="grid h-10 w-8 shrink-0 place-items-center rounded border hover:bg-muted" aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex flex-1 gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded border-2 ${i === idx ? "border-brand" : "border-transparent"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
          <button onClick={next} className="grid h-10 w-8 shrink-0 place-items-center rounded border hover:bg-muted" aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function RequestInfoCard({ listing, sellerPhone }: { listing: DBListing; sellerPhone?: string | null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: user?.email ?? "", phone: "", postcode: "",
    prefCall: false, prefText: false, prefEmail: true,
    comments: "", subscribe: true,
  });
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth", search: { redirect: `/listings/${listing.id}` } });
    const prefs = [
      form.prefCall && "Call",
      form.prefText && "Text",
      form.prefEmail && "Email",
    ].filter(Boolean).join(", ") || "Any";
    const msg = [
      form.comments || `Hi, I'm interested in the ${listing.year} ${listing.make} ${listing.model}. Is it still available?`,
      `\n\nPreferred contact: ${prefs}`,
      form.postcode ? `\nPostcode: ${form.postcode}` : "",
    ].join("");
    setBusy(true);
    const { error } = await (supabase as any).from("contact_messages").insert({
      listing_id: listing.id, sender_id: user.id, recipient_id: listing.seller_id,
      sender_name: `${form.firstName} ${form.lastName}`.trim() || (user.email ?? "Buyer"),
      sender_email: form.email,
      sender_phone: form.phone || null,
      message: msg,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Request sent! The dealer will be in touch.");
    setForm({ ...form, comments: "" });
  }

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="text-lg font-bold text-navy">Request information</h3>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name"><Input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Field>
          <Field label="Last name"><Input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Field>
        </div>
        <Field label="Email address"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"><Input placeholder="07770 000 000" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Postcode"><Input placeholder="WC1V 7PX" value={form.postcode} onChange={(e) => setForm({ ...form, postcode: e.target.value })} /></Field>
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-md border px-3 py-2 text-sm">
          <span className="font-semibold">I prefer:</span>
          <PrefBox label="Call" checked={form.prefCall} onChange={(v) => setForm({ ...form, prefCall: v })} />
          <PrefBox label="Text" checked={form.prefText} onChange={(v) => setForm({ ...form, prefText: v })} />
          <PrefBox label="Email" checked={form.prefEmail} onChange={(v) => setForm({ ...form, prefEmail: v })} />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/15">
            <Calendar className="h-4 w-4" /> Add appointment
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand hover:bg-brand/15">
            <ArrowLeftRight className="h-4 w-4" /> Add part exchange
          </button>
        </div>

        {!showComments ? (
          <button type="button" onClick={() => setShowComments(true)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
            <Plus className="h-4 w-4" /> Add comments
          </button>
        ) : (
          <Field label="Comments"><Textarea rows={3} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} placeholder="Anything you'd like to ask?" /></Field>
        )}

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={form.subscribe} onCheckedChange={(v) => setForm({ ...form, subscribe: !!v })} />
          Email me new results for my search
        </label>

        <Button type="submit" disabled={busy} className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90">
          {busy ? "Sending..." : "Check availability"}
        </Button>

        {sellerPhone && (
          <div className="flex items-center justify-center gap-2 border-t pt-3 text-sm font-bold text-navy">
            <Phone className="h-4 w-4" /> Call {sellerPhone}
          </div>
        )}
      </form>
    </div>
  );
}

function PrefBox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-1.5">
      <Checkbox checked={checked} onCheckedChange={(v) => onChange(!!v)} />
      <span>{label}</span>
    </label>
  );
}

function OfferDialog({ listing }: { listing: DBListing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(Math.round(Number(listing.price) * 0.95));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth", search: { redirect: `/listings/${listing.id}` } });
    setBusy(true);
    const { error } = await (supabase as any).from("offers").insert({
      listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id,
      amount, message: message || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Offer sent!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11"><Tag className="mr-2 h-4 w-4" /> Make an offer</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Make an offer</DialogTitle></DialogHeader>
        <form onSubmit={send} className="space-y-3">
          <div className="rounded-md bg-muted p-3 text-sm">Asking: <span className="font-bold">{fmtPrice(listing.price)}</span></div>
          <Field label="Your offer (£)"><Input type="number" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} /></Field>
          <Field label="Message (optional)"><Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} /></Field>
          <Button type="submit" disabled={busy} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">{busy ? "Sending..." : "Send offer"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block text-xs font-semibold text-navy">{label}</Label>{children}</div>;
}
