import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { auditLog, type AuditEntry } from "@/lib/mock-data";
import {
  ScrollText, Search, Filter, Download, ShieldCheck, User, Clock, Monitor
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit Trail · VIKSHAKA" },
      { name: "description", content: "Compliance audit log tracking all system actions, exports, and access events." },
    ],
  }),
  component: AuditPage,
});

const actionColor: Record<string, string> = {
  DISPATCH: "text-accent",
  ACK_ALERT: "text-warning",
  EXPORT: "text-primary",
  VIEW: "text-muted-foreground",
  CREATE_FIR: "text-success",
  AUTO: "text-muted-foreground",
  ASSIGN: "text-accent",
  SETTINGS: "text-primary",
};

function AuditPage() {
  const { session } = useSession();
  const canExport = can(session?.role, "action:export_report");
  const [q, setQ] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");

  const modules = useMemo(() => [...new Set(auditLog.map(a => a.module))], []);

  const filtered = useMemo(() => {
    return auditLog.filter(a => {
      if (moduleFilter !== "all" && a.module !== moduleFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        return a.actor.toLowerCase().includes(s) || a.action.toLowerCase().includes(s) ||
          a.detail.toLowerCase().includes(s) || a.module.toLowerCase().includes(s);
      }
      return true;
    });
  }, [q, moduleFilter]);

  const exportLog = () => {
    if (!canExport) { toast.error("Export requires Officer or higher clearance"); return; }
    downloadCSV(filtered.map(a => ({
      id: a.id, timestamp: a.timestamp, actor: a.actor, role: a.role,
      action: a.action, module: a.module, detail: a.detail, ip: a.ip,
    })), `vikshaka-audit-${new Date().toISOString().slice(0, 10)}`);
    toast.success("Audit log exported");
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Compliance & Security</div>
          <h1 className="font-display text-3xl font-bold mt-1">Audit Trail</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {auditLog.length} logged events · immutable activity record · AES-256 signed
          </p>
        </div>
        <button onClick={exportLog}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-muted text-xs font-semibold transition-colors">
          <Download className="size-4" /> Export Log
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-success/30 bg-success/5">
        <ShieldCheck className="size-4 text-success shrink-0" />
        <span className="text-xs text-success">
          All actions are cryptographically signed and retained for 7 years per IT Act compliance requirements.
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search actor, action, detail…"
            className="w-full bg-surface-2/60 border border-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-primary/50" />
        </div>
        <Filter className="size-4 text-muted-foreground" />
        <button onClick={() => setModuleFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
            moduleFilter === "all" ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:bg-muted"
          }`}>all</button>
        {modules.map(m => (
          <button key={m} onClick={() => setModuleFilter(m)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
              moduleFilter === m ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:bg-muted"
            }`}>{m}</button>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="divide-y divide-border">
          {filtered.map(entry => (
            <div key={entry.id} className="px-4 py-3.5 hover:bg-muted/20 transition-colors flex items-start gap-4">
              <div className="size-8 rounded-lg bg-surface-2 flex items-center justify-center shrink-0 mt-0.5">
                <ScrollText className="size-3.5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{entry.id}</span>
                  <span className={`text-[10px] font-mono font-bold uppercase ${actionColor[entry.action] ?? "text-foreground"}`}>
                    {entry.action}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">· {entry.module}</span>
                </div>
                <p className="text-sm mt-0.5">{entry.detail}</p>
                <div className="flex items-center gap-4 mt-1.5 text-[10px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><User className="size-3" />{entry.actor} ({entry.role})</span>
                  <span className="flex items-center gap-1"><Clock className="size-3" />{entry.timestamp}</span>
                  <span className="flex items-center gap-1"><Monitor className="size-3" />{entry.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No audit entries match your search.</div>
      )}
    </div>
  );
}
