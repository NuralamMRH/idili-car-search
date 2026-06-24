import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Check, Heart, MapPin, MessageSquare, Tag } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

  if (isLoading) {
    return <div className="flex min-h-screen flex-col"><SiteHeader /><div className="p-12 text-center text-muted-foreground">Loading...</div></div>;
  }
  if (!listing) {
    return <div className="flex min-h-screen flex-col"><SiteHeader />
      <div className="p-12 text-center"><h1 className="text-xl font-bold">Listing not found</h1>
        <Button asChild className="mt-4"><Link to="/search">Back to search</Link></Button></div></div>;
  }

  const isOwner = user?.id === listing.seller_id;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Link to="/search" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to results
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <Gallery images={(listing.images && listing.images.length ? listing.images : [listing.image_url].filter(Boolean)) as string[]} />


            <section className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="text-lg font-bold text-navy">Vehicle details</h2>
              <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
                <Spec k="Mileage" v={fmtMiles(listing.mileage)} />
                <Spec k="Year" v={String(listing.year)} />
                <Spec k="Fuel" v={listing.fuel} />
                <Spec k="Transmission" v={listing.transmission} />
                <Spec k="Body" v={listing.body_type ?? "—"} />
                <Spec k="Engine" v={listing.engine ?? "—"} />
                <Spec k="Doors" v={listing.doors?.toString() ?? "—"} />
                <Spec k="Seats" v={listing.seats?.toString() ?? "—"} />
                <Spec k="Colour" v={listing.exterior_color ?? "—"} />
              </dl>
            </section>

            {listing.description && (
              <section className="mt-6 rounded-lg border bg-card p-6">
                <h2 className="text-lg font-bold text-navy">Description</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/80">{listing.description}</p>
              </section>
            )}

            {listing.features?.length > 0 && (
              <section className="mt-6 rounded-lg border bg-card p-6">
                <h2 className="text-lg font-bold text-navy">Features</h2>
                <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  {listing.features.map((f) => (
                    <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-deal-great" />{f}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside>
            <div className="sticky top-20 space-y-4">
              <div className="rounded-lg border bg-card p-6">
                <div className="text-xs uppercase text-muted-foreground">{listing.trim}</div>
                <h1 className="mt-1 text-2xl font-bold text-navy">{listing.year} {listing.make} {listing.model}</h1>
                {listing.status !== "active" && <Badge className="mt-2 capitalize">{listing.status}</Badge>}
                <div className="mt-4 text-3xl font-extrabold">{fmtPrice(listing.price)}</div>
                {listing.location && <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{listing.location}</div>}

                {!isOwner && listing.status === "active" && listing.seller_id && (
                  <div className="mt-5 space-y-2">
                    <ContactDialog listing={listing} />
                    <OfferDialog listing={listing} />
                    <Button variant="outline" className="w-full" onClick={toggleFav}>
                      <Heart className={`mr-2 h-4 w-4 ${fav ? "fill-brand text-brand" : ""}`} />
                      {fav ? "Saved" : "Save"}
                    </Button>
                  </div>
                )}
                {isOwner && (
                  <div className="mt-5 rounded-md bg-muted p-3 text-xs text-muted-foreground">This is your listing. Manage it from your <Link to="/dashboard/listings" className="text-brand hover:underline">dashboard</Link>.</div>
                )}
              </div>

              {seller && listing.seller_id && (
                <Link to="/dealers/$id" params={{ id: listing.seller_id }} className="block rounded-lg border bg-card p-6 transition hover:border-brand hover:shadow-md">
                  <div className="text-xs uppercase text-muted-foreground">Sold by</div>
                  <div className="mt-1 font-semibold text-navy">{seller.dealer_name || seller.display_name || seller.full_name || "Private seller"}</div>
                  {seller.is_dealer && <Badge className="mt-1">Verified dealer</Badge>}
                  <div className="mt-2 text-xs font-semibold text-brand">View seller profile →</div>
                </Link>
              )}
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return <div><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>;
}

function Gallery({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  if (!images.length) {
    return (
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="grid aspect-[16/10] place-items-center bg-muted text-muted-foreground">No image</div>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="aspect-[16/10] bg-muted">
          <img src={images[idx]} alt="" className="h-full w-full object-cover" />
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-16 w-24 overflow-hidden rounded border-2 ${i === idx ? "border-brand" : "border-transparent"}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactDialog({ listing }: { listing: DBListing }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: user?.email ?? "", phone: "", message: "" });
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/auth", search: { redirect: `/listings/${listing.id}` } });
    setBusy(true);
    const { error } = await (supabase as any).from("contact_messages").insert({
      listing_id: listing.id, sender_id: user.id, recipient_id: listing.seller_id,
      sender_name: form.name, sender_email: form.email, sender_phone: form.phone || null, message: form.message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent!");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-11 w-full bg-brand text-brand-foreground hover:bg-brand/90">
          <MessageSquare className="mr-2 h-4 w-4" /> Contact seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Contact seller</DialogTitle></DialogHeader>
        <form onSubmit={send} className="space-y-3">
          <Field label="Your name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Phone (optional)"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Message"><Textarea required rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Hi, is this still available?" /></Field>
          <Button type="submit" disabled={busy} className="w-full bg-brand text-brand-foreground hover:bg-brand/90">{busy ? "Sending..." : "Send message"}</Button>
        </form>
      </DialogContent>
    </Dialog>
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
        <Button variant="outline" className="h-11 w-full"><Tag className="mr-2 h-4 w-4" /> Make an offer</Button>
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
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}
