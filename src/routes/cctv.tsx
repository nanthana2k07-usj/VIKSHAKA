import { createFileRoute } from "@tanstack/react-router";
import { cctv } from "@/lib/mock-data";
import { Video, VideoOff, AlertTriangle, Maximize2, Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/cctv")({
  head: () => ({
    meta: [
      { title: "CCTV Monitoring · VIKSHAKA" },
      { name: "description", content: "Live CCTV grid with AI anomaly detection across city-wide surveillance network." },
      { property: "og:title", content: "CCTV Monitoring · VIKSHAKA" },
      { property: "og:description", content: "Multi-feed CCTV command with AI weapon/crowd/vehicle detection." },
    ],
  }),
  component: CctvPage,
});

const statusStyle = {
  online: { border: "border-success/30", dot: "bg-success", label: "LIVE" },
  alert: { border: "border-destructive/50", dot: "bg-destructive pulse-dot", label: "ALERT" },
  offline: { border: "border-muted", dot: "bg-muted", label: "OFFLINE" },
} as const;

function FauxFeed({ label, alert }: { label: string; alert?: boolean }) {
  // stylised static "video" using gradient + scanlines
  return (
    <div className="absolute inset-0 grid-bg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)"
      }} />
      {alert && (
        <div className="absolute inset-0 border-4 border-destructive/60 animate-pulse" />
      )}
      <div className="absolute top-2 left-2 text-[9px] font-mono text-white/60">{label}</div>
      <div className="absolute bottom-2 right-2 text-[9px] font-mono text-white/60">REC ●</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="size-20 rounded-full border-2 border-white/10 flex items-center justify-center">
          <Video className="size-8 text-white/20" />
        </div>
      </div>
      {alert && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-destructive rounded-md size-16 bg-destructive/10">
          <div className="absolute -top-5 left-0 text-[9px] font-mono text-destructive font-bold whitespace-nowrap">AI DETECT</div>
        </div>
      )}
    </div>
  );
}

function CctvPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "ALERTS" | "OFFLINE">("ALL");
  const online = cctv.filter(c => c.status !== "offline").length;
  const alertsCount = cctv.filter(c => c.status === "alert").length;
  const visible = cctv.filter(c => filter === "ALL" ? true : filter === "ALERTS" ? c.status === "alert" : c.status === "offline");

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Surveillance Grid</div>
          <h1 className="font-display text-3xl font-bold mt-1">CCTV Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">{online}/{cctv.length} feeds live · {alertsCount} active AI detections · YOLOv8 + face-match models running</p>
        </div>
        <div className="flex gap-2">
          {(["ALL", "ALERTS", "OFFLINE"] as const).map(k => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3 py-2 rounded-lg border text-[10px] font-mono uppercase tracking-widest ${filter === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:bg-muted"}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Total feeds</div>
          <div className="font-display text-2xl font-bold mt-1">{cctv.length}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-[10px] font-mono uppercase text-success">Online</div>
          <div className="font-display text-2xl font-bold mt-1 text-success">{online}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-[10px] font-mono uppercase text-destructive">Active alerts</div>
          <div className="font-display text-2xl font-bold mt-1 text-destructive">{alertsCount}</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Districts covered</div>
          <div className="font-display text-2xl font-bold mt-1">{new Set(cctv.map(c => c.district)).size}</div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {visible.map(c => {
          const s = statusStyle[c.status];
          return (
            <div key={c.id} className={`relative rounded-xl border-2 ${s.border} bg-surface overflow-hidden reveal group`}>
              <div className="relative aspect-video">
                <FauxFeed label={c.id} alert={c.status === "alert"} />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { toast.success(`Snapshot saved · ${c.id}`); }}
                    className="size-7 rounded-md bg-black/60 backdrop-blur flex items-center justify-center" aria-label="Snapshot">
                    <Camera className="size-3.5 text-white" />
                  </button>
                  <button onClick={() => setExpanded(c.id)} className="size-7 rounded-md bg-black/60 backdrop-blur flex items-center justify-center" aria-label="Expand">
                    <Maximize2 className="size-3.5 text-white" />
                  </button>
                </div>
              </div>
              <div className="p-3 border-t border-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`size-1.5 rounded-full ${s.dot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</span>
                  {c.lastAlert && <span className="ml-auto text-[10px] font-mono text-destructive">{c.lastAlert}</span>}
                </div>
                <div className="text-xs font-semibold truncate">{c.location}</div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">{c.district}</div>
                {c.aiTag && c.aiTag !== "—" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 w-fit">
                    <AlertTriangle className="size-3" /> {c.aiTag}
                  </div>
                )}
                {c.status === "offline" && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <VideoOff className="size-3" /> Signal lost
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {expanded && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-6" onClick={() => setExpanded(null)}>
          <div className="w-full max-w-5xl aspect-video rounded-xl border-2 border-primary/40 bg-surface overflow-hidden relative" onClick={e => e.stopPropagation()}>
            <FauxFeed label={expanded} alert={cctv.find(c=>c.id===expanded)?.status === "alert"} />
            <button onClick={() => setExpanded(null)} className="absolute top-3 right-3 size-8 rounded-md bg-black/60 text-white font-bold">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
