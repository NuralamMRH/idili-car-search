import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState<any>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await (supabase as any).from("profiles").update({
      full_name: form.full_name, display_name: form.display_name, phone: form.phone,
      postcode: form.postcode, is_dealer: form.is_dealer, dealer_name: form.dealer_name, bio: form.bio,
    }).eq("id", user!.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
    qc.invalidateQueries({ queryKey: ["profile"] });
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-navy">Profile</h1>
      <form onSubmit={save} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name"><Input value={form.full_name ?? ""} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></Field>
          <Field label="Display name"><Input value={form.display_name ?? ""} onChange={(e) => setForm({ ...form, display_name: e.target.value })} /></Field>
          <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
          <Field label="Postcode"><Input value={form.postcode ?? ""} onChange={(e) => setForm({ ...form, postcode: e.target.value })} /></Field>
        </div>
        <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
          <Switch checked={!!form.is_dealer} onCheckedChange={(v) => setForm({ ...form, is_dealer: v })} />
          <div>
            <div className="text-sm font-medium">I'm a dealer</div>
            <div className="text-xs text-muted-foreground">Show your dealership in the public Dealers directory.</div>
          </div>
        </div>
        {form.is_dealer && (
          <Field label="Dealer name"><Input value={form.dealer_name ?? ""} onChange={(e) => setForm({ ...form, dealer_name: e.target.value })} /></Field>
        )}
        <Field label="Bio"><Textarea rows={4} value={form.bio ?? ""} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></Field>
        <Button type="submit" className="bg-brand text-brand-foreground hover:bg-brand/90">Save changes</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-1.5 block">{label}</Label>{children}</div>;
}
