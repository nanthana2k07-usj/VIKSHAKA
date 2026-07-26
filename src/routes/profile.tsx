import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { roleBadgeClass, roleLabel } from "@/lib/rbac";
import { cases } from "@/lib/mock-data";
import { LogOut, ShieldCheck, Mail, Phone, MapPin, IdCard, Building2, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Officer Profile · VIKSHAKA" },
      { name: "description", content: "Officer profile, service record, active cases and session." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  if (!session) return null;

  const myCases = cases.filter(c => c.officer.includes(session.name.split(" ").slice(-1)[0]) || c.officer.includes(session.name.split(" ")[0])).slice(0, 6);

  const logout = () => {
    signOut();
    toast.success("Signed out — session cleared");
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-6 pb-10 max-w-5xl">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Personnel Record</div>
        <h1 className="font-display text-3xl font-bold mt-1">Officer Profile</h1>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "radial-gradient(circle at 90% 10%, var(--primary), transparent 40%)",
        }} />
        <div className="relative flex items-start gap-6 flex-wrap">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-display font-bold text-primary-foreground shadow-glow">
            {session.avatar}
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-display text-2xl font-bold">{session.name}</h2>
              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${roleBadgeClass[session.role]}`}>
                {roleLabel[session.role]}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">{session.rank} · {session.station}</div>
            <div className="flex items-center gap-4 mt-3 flex-wrap text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-success" />Verified</span>
              <span className="flex items-center gap-1.5"><Calendar className="size-3" />Signed in {new Date(session.loginAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 rounded-lg border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10 flex items-center gap-2">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoRow icon={IdCard} label="Service ID" value={session.serviceId} />
        <InfoRow icon={ShieldCheck} label="Badge" value={session.badge} />
        <InfoRow icon={Building2} label="Station" value={session.station} />
        <InfoRow icon={MapPin} label="District" value={session.district} />
        <InfoRow icon={Mail} label="Email" value={session.email} />
        <InfoRow icon={Phone} label="Mobile" value={`+91 ${session.phone}`} />
      </div>

      <div className="rounded-xl border border-border bg-surface reveal">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold">Assigned cases</h3>
        </div>
        <div className="divide-y divide-border">
          {myCases.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">No cases assigned to this officer yet.</div>}
          {myCases.map(c => (
            <div key={c.id} className="p-4 flex items-start gap-4 hover:bg-muted/40">
              <div className="font-mono text-[10px] text-muted-foreground w-32 shrink-0">{c.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{c.title}</div>
                <div className="text-[11px] text-muted-foreground">{c.ipc} · {c.district}</div>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary">{c.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-semibold truncate">{value}</div>
      </div>
    </div>
  );
}
