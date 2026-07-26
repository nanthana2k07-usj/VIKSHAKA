import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { evidenceItems, type EvidenceItem } from "@/lib/mock-data";
import {
  Fingerprint, Search, Filter, ShieldCheck, Lock, FlaskConical, HardDrive, Video, Package, Eye
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/evidence")({
  head: () => ({
    meta: [
      { title: "Evidence Vault · VIKSHAKA" },
      { name: "description", content: "Digital evidence vault with chain of custody tracking and forensic analysis status." },
    ],
  }),
  component: EvidencePage,
});

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  physical: Package,
  digital: HardDrive,
  forensic: FlaskConical,
  cctv: Video,
};

const statusStyle: Record<string, string> = {
  in_custody: "bg-primary/10 text-primary border-primary/30",
  in_analysis: "bg-warning/10 text-warning border-warning/30",
  released: "bg-muted text-muted-foreground border-border",
  sealed: "bg-success/10 text-success border-success/30",
};

function EvidencePage() {
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selected, setSelected] = useState<EvidenceItem | null>(null);

  const filtered = useMemo(() => {
    return evidenceItems.filter(e => {
      if (typeFilter !== "all" && e.type !== typeFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        return e.id.toLowerCase().includes(s) || e.caseId.toLowerCase().includes(s) ||
          e.description.toLowerCase().includes(s) || e.collectedBy.toLowerCase().includes(s);
      }
      return true;
    });
  }, [q, typeFilter]);

  const stats = {
    total: evidenceItems.length,
    inAnalysis: evidenceItems.filter(e => e.status === "in_analysis").length,
    sealed: evidenceItems.filter(e => e.status === "sealed").length,
    avgChain: Math.round(evidenceItems.reduce((s, e) => s + e.chainOfCustody, 0) / evidenceItems.length),
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Forensics & Custody</div>
        <h1 className="font-display text-3xl font-bold mt-1">Evidence Vault</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {stats.total} exhibits tracked · {stats.inAnalysis} in analysis · avg chain depth {stats.avgChain} transfers
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Exhibits", value: stats.total, icon: Fingerprint },
          { label: "In Analysis", value: stats.inAnalysis, icon: FlaskConical },
          { label: "Sealed", value: stats.sealed, icon: Lock },
          { label: "Avg Chain Depth", value: stats.avgChain, icon: ShieldCheck },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <s.icon className="size-4 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</div>
              <div className="text-xl font-bold">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by ID, case, description…"
            className="w-full bg-surface-2/60 border border-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-primary/50" />
        </div>
        <Filter className="size-4 text-muted-foreground" />
        {["all", "physical", "digital", "forensic", "cctv"].map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
              typeFilter === t ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:bg-muted"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2/40 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <th className="text-left px-4 py-3">Exhibit ID</th>
              <th className="text-left px-4 py-3">Case</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Description</th>
              <th className="text-left px-4 py-3">Type</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Chain</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(item => {
              const Icon = typeIcon[item.type];
              return (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{item.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.caseId}</td>
                  <td className="px-4 py-3 text-xs hidden md:table-cell max-w-[240px] truncate">{item.description}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-xs capitalize">
                      <Icon className="size-3.5 text-muted-foreground" />{item.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${statusStyle[item.status]}`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: item.chainOfCustody }).map((_, i) => (
                        <div key={i} className="size-1.5 rounded-full bg-primary/60" />
                      ))}
                      <span className="text-[10px] font-mono text-muted-foreground ml-1">{item.chainOfCustody}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelected(item)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                      <Eye className="size-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Exhibit Detail</div>
                <h2 className="font-display text-xl font-bold mt-1">{selected.id}</h2>
              </div>
              <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">Case</span><div className="font-mono text-primary">{selected.caseId}</div></div>
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">Type</span><div className="capitalize">{selected.type}</div></div>
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">Collected</span><div>{selected.collectedAt}</div></div>
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">By</span><div>{selected.collectedBy}</div></div>
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">Location</span><div>{selected.location}</div></div>
                <div><span className="text-[10px] font-mono text-muted-foreground uppercase">Chain Depth</span><div>{selected.chainOfCustody} transfers</div></div>
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Description</span>
                <p className="mt-1 text-muted-foreground">{selected.description}</p>
              </div>
              <button onClick={() => { toast.success("Chain of custody verified", { description: selected.id }); setSelected(null); }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-2">
                <ShieldCheck className="size-4" /> Verify Chain of Custody
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
