import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { fmtDate } from "@/lib/listings";

export const Route = createFileRoute("/dashboard/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const inbox = useQuery({
    queryKey: ["msgs-in", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contact_messages").select("*, listings(make, model, year)")
        .eq("recipient_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const outbox = useQuery({
    queryKey: ["msgs-out", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("contact_messages").select("*, listings(make, model, year)")
        .eq("sender_id", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function markRead(id: string) {
    await (supabase as any).from("contact_messages").update({ is_read: true }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["msgs-in"] });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Contact history</h1>
      <Tabs defaultValue="inbox">
        <TabsList>
          <TabsTrigger value="inbox">Inbox ({inbox.data?.length ?? 0})</TabsTrigger>
          <TabsTrigger value="sent">Sent ({outbox.data?.length ?? 0})</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4">
          <MsgList msgs={inbox.data ?? []} onRead={markRead} showRead />
        </TabsContent>
        <TabsContent value="sent" className="mt-4">
          <MsgList msgs={outbox.data ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MsgList({ msgs, onRead, showRead }: { msgs: any[]; onRead?: (id: string) => void; showRead?: boolean }) {
  if (!msgs.length) return <div className="rounded-lg border bg-card p-10 text-center text-sm text-muted-foreground">No messages yet.</div>;
  return (
    <div className="space-y-3">
      {msgs.map((m) => (
        <div key={m.id} className={`rounded-lg border bg-card p-4 ${showRead && !m.is_read ? "border-brand" : ""}`}
             onClick={() => showRead && !m.is_read && onRead?.(m.id)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-semibold">{m.sender_name} <span className="text-xs font-normal text-muted-foreground">· {m.sender_email}</span></div>
              {m.listings && (
                <Link to="/listings/$id" params={{ id: m.listing_id }} className="text-xs text-brand hover:underline">
                  About: {m.listings.year} {m.listings.make} {m.listings.model}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2">
              {showRead && !m.is_read && <Badge className="bg-brand text-brand-foreground">New</Badge>}
              <span className="text-xs text-muted-foreground">{fmtDate(m.created_at)}</span>
            </div>
          </div>
          <p className="mt-2 text-sm">{m.message}</p>
          {m.sender_phone && <div className="mt-1 text-xs text-muted-foreground">📞 {m.sender_phone}</div>}
        </div>
      ))}
    </div>
  );
}
