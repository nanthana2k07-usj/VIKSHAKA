import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { briefings, type Briefing } from "@/lib/mock-data";
import {
  BookOpen, Lock, Shield, Eye, Clock, Tag, ChevronRight, X, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/briefings")({
  head: () => ({
    meta: [
      { title: "Intelligence Briefings · VIKSHAKA" },
      { name: "description", content: "Classified intelligence briefings and crime analysis reports for command staff." },
    ],
  }),
  component: BriefingsPage,
});

const classStyle: Record<string, { badge: string; icon: React.ComponentType<{ className?: string }> }> = {
  restricted: { badge: "bg-destructive/10 text-destructive border-destructive/30", icon: Lock },
  confidential: { badge: "bg-warning/10 text-warning border-warning/30", icon: Shield },
  internal: { badge: "bg-primary/10 text-primary border-primary/30", icon: Eye },
};

function BriefingsPage() {
  const [filter, setFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Briefing | null>(null);
  const [read, setRead] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (filter === "all") return briefings;
    return briefings.filter(b => b.classification === filter);
  }, [filter]);

  const openBriefing = (b: Briefing) => {
    setSelected(b);
    setRead(prev => new Set([...prev, b.id]));
    toast.info(`Briefing ${b.id} opened`, { description: `${b.classification.toUpperCase()} clearance verified` });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Intelligence Division</div>
          <h1 className="font-display text-3xl font-bold mt-1">Intel Briefings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {briefings.length} classified reports · {read.size} read · updated daily
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-destructive/30 bg-destructive/5">
          <AlertTriangle className="size-4 text-destructive" />
          <span className="text-[10px] font-mono text-destructive uppercase tracking-widest">Classified Access</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {["all", "restricted", "confidential", "internal"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider border transition-colors ${
              filter === f ? "bg-primary/10 text-primary border-primary/30" : "border-border text-muted-foreground hover:bg-muted"
            }`}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map(b => {
          const cls = classStyle[b.classification];
          const ClassIcon = cls.icon;
          const isRead = read.has(b.id);
          return (
            <button key={b.id} onClick={() => openBriefing(b)}
              className={`text-left rounded-xl border bg-surface p-5 hover:border-primary/30 transition-all group ${
                isRead ? "border-border opacity-80" : "border-primary/20 shadow-sm"
              }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-muted-foreground">{b.id}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border flex items-center gap-1 ${cls.badge}`}>
                    <ClassIcon className="size-2.5" />{b.classification}
                  </span>
                  {!isRead && <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30">Unread</span>}
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
              <h3 className="font-semibold text-sm mt-2 leading-snug">{b.title}</h3>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{b.summary}</p>
              <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1"><Clock className="size-3" />{b.readTime}</span>
                <span>{b.author}</span>
                <span>{b.publishedAt}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {b.tags.map(tag => (
                  <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Tag className="size-2.5" />{tag}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="size-4 text-primary" />
                    <span className="font-mono text-xs text-muted-foreground">{selected.id}</span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${classStyle[selected.classification].badge}`}>
                      {selected.classification}
                    </span>
                  </div>
                  <h2 className="font-display text-xl font-bold">{selected.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{selected.author}</span>
                    <span>·</span>
                    <span>{selected.publishedAt}</span>
                    <span>·</span>
                    <span>{selected.readTime} read</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-muted"><X className="size-5" /></button>
              </div>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <p className="text-sm leading-relaxed text-foreground/90">{selected.summary}</p>
              <div className="mt-6 p-4 rounded-lg border border-border bg-muted/30">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Distribution Tags</div>
                <div className="flex flex-wrap gap-2">
                  {selected.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
