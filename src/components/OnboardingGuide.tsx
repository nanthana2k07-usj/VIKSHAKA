import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X, BellRing, MapPin, Video, FolderOpen, Sparkles, FileText } from "lucide-react";

const KEY = "vk.onboarding.dismissed.v1";

const steps = [
  { n: 1, icon: BellRing, title: "Triage alerts", desc: "Acknowledge, dispatch and resolve incoming alerts.", to: "/alerts" },
  { n: 2, icon: MapPin, title: "Review hotspots", desc: "Geospatial density map with risk clusters.", to: "/hotspots" },
  { n: 3, icon: Video, title: "Monitor CCTV", desc: "Live grid with AI weapon and crowd detection.", to: "/cctv" },
  { n: 4, icon: FolderOpen, title: "Manage cases", desc: "Search, filter and open FIRs from the registry.", to: "/cases" },
  { n: 5, icon: Sparkles, title: "Ask ARIA", desc: "AI copilot — cases, next steps, draft FIRs.", to: null },
  { n: 6, icon: FileText, title: "Generate reports", desc: "Export CSV / print executive briefings.", to: "/reports" },
] as const;

export function OnboardingGuide() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  useEffect(() => {
    setDismissed(localStorage.getItem(KEY) === "1");
  }, []);
  if (dismissed !== false) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-surface to-surface p-5 reveal relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 size-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
        aria-label="Dismiss guide"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-primary">Welcome briefing</div>
      </div>
      <h3 className="font-display font-bold text-lg">How to use VIKSHAKA</h3>
      <p className="text-sm text-muted-foreground">Six steps to run the command center. Click any step to jump in.</p>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {steps.map(s => {
          const Icon = s.icon;
          const body = (
            <div className="rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 hover:border-primary/40 transition-all p-3 h-full">
              <div className="flex items-center justify-between mb-2">
                <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Icon className="size-4 text-primary" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">Step {s.n}</span>
              </div>
              <div className="text-xs font-semibold">{s.title}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
            </div>
          );
          return s.to ? (
            <Link key={s.n} to={s.to}>{body}</Link>
          ) : (
            <div key={s.n}>{body}</div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[10px] font-mono text-muted-foreground flex-wrap">
        <span className="uppercase tracking-widest">Shortcuts</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground">⌘K</kbd> Search</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground">Ask ARIA</kbd> AI copilot</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground">Alerts</kbd> Triage board</span>
        <button onClick={dismiss} className="ml-auto uppercase tracking-widest hover:text-foreground underline-offset-2 hover:underline">Dismiss</button>
      </div>
    </div>
  );
}
