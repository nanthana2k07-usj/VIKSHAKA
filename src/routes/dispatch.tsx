import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { dispatchLog, patrols, type DispatchEntry } from "@/lib/mock-data";
import {
  RadioTower, MapPin, Clock, Users, Filter, ArrowRight, CheckCircle2, AlertTriangle, Radio
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch Center · VIKSHAKA" },
      { name: "description", content: "Centralized real-time dispatch control for patrol units and emergency response." },
    ],
  }),
  component: DispatchPage,
});

const statusStyle: Record<string, string> = {
  dispatched: "bg-warning/10 text-warning border-warning/30",
  en_route: "bg-accent/10 text-accent border-accent/30",
  on_scene: "bg-primary/10 text-primary border-primary/30",
  completed: "bg-success/10 text-success border-success/30",
  standby: "bg-muted text-muted-foreground border-border",
};

const priStyle: Record<string, string> = {
  critical: "border-l-destructive bg-destructive/5",
  high: "border-l-warning bg-warning/5",
  medium: "border-l-accent bg-accent/5",
  low: "border-l-primary bg-primary/5",
};

function DispatchPage() {
  const { session } = useSession();
  const allowed = can(session?.role, "action:dispatch");
  const [entries, setEntries] = useState<DispatchEntry[]>(dispatchLog);
  const [filter, setFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return entries;
    return entries.filter(e => e.status === filter);
  }, [entries, filter]);

  const stats = useMemo(() => ({
    active: entries.filter(e => ["dispatched", "en_route", "on_scene"].includes(e.status)).length,
    enRoute: entries.filter(e => e.status === "en_route").length,
    onScene: entries.filter(e => e.status === "on_scene").length,
    completed: entries.filter(e => e.status === "completed").length,
  }), [entries]);

  const dispatch = (entry: DispatchEntry) => {
    if (!allowed) { toast.error("Dispatch requires Officer clearance"); return; }
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "dispatched" as const, eta: "6 min" } : e));
    toast.success(`${entry.unit} dispatched`, { description: entry.incident });
  };

  const complete = (entry: DispatchEntry) => {
    if (!allowed) { toast.error("Dispatch requires Officer clearance"); return; }
    setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, status: "completed" as const } : e));
    toast.success(`${entry.unit} marked complete`);
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Central Dispatch</div>
          <h1 className="font-display text-3xl font-bold mt-1">Dispatch Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time unit coordination · {patrols.length} patrol units available · {stats.active} active dispatches
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-success/30 bg-success/10">
          <Radio className="size-4 text-success pulse-dot" />
          <span className="text-xs font-mono text-success uppercase tracking-widest">Channel Open</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Dispatches", value: stats.active, color: "text-accent" },
          { label: "En Route", value: stats.enRoute, color: "text-warning" },
          { label: "On Scene", value: stats.onScene, color: "text-primary" },
          { label: "Completed Today", value: stats.completed, color: "text-success" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-4">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        {["all", "dispatched", "en_route", "on_scene", "completed", "standby"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
              filter === f ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:bg-muted"
            }`}>
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(entry => (
          <div key={entry.id} className={`rounded-xl border border-border bg-surface p-4 border-l-4 ${priStyle[entry.priority]}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4 min-w-0">
                <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <RadioTower className="size-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{entry.id}</span>
                    <span className="text-xs font-mono text-muted-foreground">{entry.time}</span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${statusStyle[entry.status]}`}>
                      {entry.status.replace("_", " ")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mt-1">{entry.incident}</h3>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1"><MapPin className="size-3" />{entry.location}</span>
                    <span className="flex items-center gap-1"><Users className="size-3" />{entry.officer}</span>
                    {entry.eta && <span className="flex items-center gap-1"><Clock className="size-3" />ETA {entry.eta}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-sm font-bold text-primary">{entry.unit}</span>
                {entry.status === "standby" && (
                  <button onClick={() => dispatch(entry)} className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">
                    Dispatch
                  </button>
                )}
                {["dispatched", "en_route", "on_scene"].includes(entry.status) && (
                  <button onClick={() => complete(entry)} className="px-3 py-1.5 rounded-lg border border-success/30 bg-success/10 text-success text-xs font-semibold hover:bg-success/20 flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Complete
                  </button>
                )}
                {entry.status === "completed" && (
                  <CheckCircle2 className="size-5 text-success" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="size-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No dispatches match the current filter.</p>
        </div>
      )}
    </div>
  );
}
