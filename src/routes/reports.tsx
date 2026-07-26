import { createFileRoute } from "@tanstack/react-router";
import { cases, officers, hotspots, crimeMix, criminals, cctv, patrols, alerts } from "@/lib/mock-data";
import { Download, FileText, Printer, Eye, X, FileJson } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadCSV, downloadJSON } from "@/lib/exports";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · VIKSHAKA" },
      { name: "description", content: "Generate crime, police performance, location, evidence and AI intelligence reports with CSV/JSON export." },
      { property: "og:title", content: "Reports · VIKSHAKA" },
      { property: "og:description", content: "Executive-ready crime and performance reports." },
    ],
  }),
  component: ReportsPage,
});

type ReportId = "crime" | "criminal" | "police" | "location" | "evidence" | "ai";

const reportKinds: Array<{ id: ReportId; label: string; desc: string }> = [
  { id: "crime", label: "Crime Report", desc: "Statewise + districtwise + type breakdown" },
  { id: "criminal", label: "Criminal Register", desc: "Persons of interest, threat level, linked cases" },
  { id: "police", label: "Police Performance", desc: "Officer-wise clearance rate, response times" },
  { id: "location", label: "Location Intelligence", desc: "Hotspots, district ranking, dangerous zones" },
  { id: "evidence", label: "Evidence Log", desc: "CCTV + AI detections chain of custody" },
  { id: "ai", label: "AI Intelligence", desc: "Alert stream, predictions and signals" },
];

function getRows(id: ReportId): Record<string, unknown>[] {
  switch (id) {
    case "crime":    return cases.map(c => ({ id: c.id, fir: c.fir, title: c.title, ipc: c.ipc, type: c.crimeType, district: c.district, state: c.state, status: c.status, priority: c.priority, officer: c.officer, reported: c.reportedAt }));
    case "criminal": return criminals.map(c => ({ id: c.id, name: c.name, alias: c.alias, age: c.age, gang: c.gang ?? "solo", district: c.district, threat: c.threatLevel, status: c.status, linkedCases: c.linkedCases, lastSeen: c.lastSeen }));
    case "police":   return officers.map(o => ({ id: o.id, name: o.name, rank: o.rank, badge: o.badge, station: o.station, status: o.status, casesResolved: o.casesResolved, performance: o.performance }));
    case "location": return hotspots.map(h => ({ id: h.id, area: h.area, district: h.district, state: h.state, incidents30d: h.incidents30d, risk: h.risk, primary: h.primaryCrime, lat: h.lat, lng: h.lng }));
    case "evidence": return cctv.map(c => ({ id: c.id, location: c.location, district: c.district, status: c.status, lastAlert: c.lastAlert ?? "-", aiTag: c.aiTag ?? "-" }));
    case "ai":       return alerts.map(a => ({ id: a.id, time: a.time, severity: a.severity, category: a.category, title: a.title, location: a.location, officer: a.officer ?? "-" }));
  }
}

function ReportsPage() {
  const { session } = useSession();
  const canExport = can(session?.role, "action:export_report");
  const canGenerate = can(session?.role, "action:generate_report");
  const [preview, setPreview] = useState<ReportId | null>(null);

  const stamp = new Date().toISOString().slice(0, 10);

  const exportCSV = (id: ReportId) => {
    if (!canExport) { toast.error("Export requires Officer or higher clearance"); return; }
    downloadCSV(getRows(id), `vikshaka-${id}-${stamp}`);
    toast.success(`${id.toUpperCase()} CSV exported`);
  };
  const exportJSON = (id: ReportId) => {
    if (!canExport) { toast.error("Export requires clearance"); return; }
    downloadJSON({ report: id, generatedAt: new Date().toISOString(), officer: session?.name, rows: getRows(id) }, `vikshaka-${id}-${stamp}`);
    toast.success(`${id.toUpperCase()} JSON exported`);
  };
  const exportAll = () => {
    if (!canExport) { toast.error("Export requires clearance"); return; }
    reportKinds.forEach(r => setTimeout(() => downloadCSV(getRows(r.id), `vikshaka-${r.id}-${stamp}`), 200 * reportKinds.indexOf(r)));
    toast.success("Exporting all 6 reports…");
  };
  const generate = (id: ReportId) => {
    if (!canGenerate) { toast.error("Generation requires Commissioner or Analyst role"); return; }
    toast.success(`Generated ${id.toUpperCase()} report`, { description: `${getRows(id).length} records processed` });
    setPreview(id);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Executive Reports</div>
          <h1 className="font-display text-3xl font-bold mt-1">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generated from live data · export as CSV, JSON or print</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5">
            <Printer className="size-3.5"/>Print
          </button>
          <button onClick={exportAll} disabled={!canExport}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40">
            <Download className="size-3.5"/>Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportKinds.map(r => (
          <div key={r.id} className="rounded-xl border border-border bg-surface p-5 hover:border-primary/30 transition-colors reveal">
            <div className="flex items-start justify-between mb-3">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="size-4 text-primary"/>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground uppercase">{getRows(r.id).length} rows</span>
            </div>
            <div className="font-display font-bold">{r.label}</div>
            <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => generate(r.id)} disabled={!canGenerate}
                className="px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest disabled:opacity-40">Generate</button>
              <button onClick={() => setPreview(r.id)} className="px-2.5 py-1.5 rounded-md border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center gap-1">
                <Eye className="size-3" />Preview
              </button>
              <button onClick={() => exportCSV(r.id)} disabled={!canExport} className="px-2.5 py-1.5 rounded-md border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center gap-1 disabled:opacity-40">
                <Download className="size-3" />CSV
              </button>
              <button onClick={() => exportJSON(r.id)} disabled={!canExport} className="px-2.5 py-1.5 rounded-md border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center gap-1 disabled:opacity-40">
                <FileJson className="size-3" />JSON
              </button>
            </div>
          </div>
        ))}
      </div>

      {preview && <PreviewModal id={preview} onClose={() => setPreview(null)} onExportCSV={exportCSV} onExportJSON={exportJSON} />}

      <div className="rounded-xl border border-border bg-surface p-6 space-y-6">
        <h3 className="font-display font-bold text-lg">Snapshot preview — Crime Report (last cycle)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Crime mix</div>
            <div className="space-y-1.5">
              {crimeMix.map(c => (
                <div key={c.type} className="flex items-center gap-2">
                  <div className="text-xs w-24 truncate">{c.type}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(c.count / 320) * 100}%` }}/>
                  </div>
                  <div className="text-xs font-mono w-8 text-right">{c.count}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Top districts</div>
            <div className="space-y-1.5">
              {hotspots.slice(0,7).map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  <div className="text-xs w-32 truncate">{h.district}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${(h.incidents30d / 70) * 100}%` }}/>
                  </div>
                  <div className="text-xs font-mono w-8 text-right">{h.incidents30d}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Officer clearance</div>
            <div className="space-y-1.5">
              {officers.slice(0,7).map(o => (
                <div key={o.id} className="flex items-center gap-2">
                  <div className="text-xs w-28 truncate">{o.name}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-success" style={{ width: `${o.performance}%` }}/>
                  </div>
                  <div className="text-xs font-mono w-8 text-right">{o.performance}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Patrols active: {patrols.filter(p => p.status !== "standby").length} · Alerts open: {alerts.length}
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ id, onClose, onExportCSV, onExportJSON }: {
  id: ReportId; onClose: () => void;
  onExportCSV: (id: ReportId) => void; onExportJSON: (id: ReportId) => void;
}) {
  const rows = getRows(id);
  const label = reportKinds.find(r => r.id === id)?.label ?? id;
  const cols = rows[0] ? Object.keys(rows[0]) : [];
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[85vh] rounded-2xl border border-border bg-surface flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Preview</div>
            <h3 className="font-display font-bold text-lg">{label}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onExportCSV(id)} className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest flex items-center gap-1">
              <Download className="size-3" />CSV
            </button>
            <button onClick={() => onExportJSON(id)} className="px-3 py-1.5 rounded-md border border-border text-[10px] font-mono uppercase tracking-widest flex items-center gap-1">
              <FileJson className="size-3" />JSON
            </button>
            <button onClick={() => window.print()} className="px-3 py-1.5 rounded-md border border-border text-[10px] font-mono uppercase tracking-widest flex items-center gap-1">
              <Printer className="size-3" />Print
            </button>
            <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-surface-2">
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {cols.map(c => <th key={c} className="px-3 py-2 whitespace-nowrap">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-muted/40">
                  {cols.map(c => <td key={c} className="px-3 py-2 whitespace-nowrap">{String(r[c] ?? "-")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {rows.length} rows · Generated {new Date().toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}
