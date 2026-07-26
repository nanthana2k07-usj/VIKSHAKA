import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, ShieldAlert, Radio, Video, Sparkles, FileText, MapPin, CheckCircle2, ArrowRight, X } from "lucide-react";

const KEY = "vk.demo.dismissed.v1";

type Step = {
  n: number;
  title: string;
  caption: string;
  screen: "alert" | "dispatch" | "cctv" | "aria" | "report";
};

const steps: Step[] = [
  { n: 1, title: "Alert lands on triage board", caption: "A critical alert arrives from Zone-7 CCTV — armed suspect detected.", screen: "alert" },
  { n: 2, title: "Dispatch nearest patrol", caption: "One click dispatches Patrol P-14, ETA 3 mins.", screen: "dispatch" },
  { n: 3, title: "Live CCTV verification", caption: "AI cross-checks 4 nearby feeds and locks the target frame.", screen: "cctv" },
  { n: 4, title: "Ask ARIA for context", caption: "Copilot pulls prior FIRs, associates and next-step recommendations with citations.", screen: "aria" },
  { n: 5, title: "Auto-draft situation report", caption: "One-click export to PDF/CSV for the commissioner brief.", screen: "report" },
];

interface Props {
  dismissible?: boolean;
  autoPlay?: boolean;
}

export function DemoSimulation({ dismissible = true, autoPlay = true }: Props) {
  const [dismissed, setDismissed] = useState<boolean | null>(dismissible ? null : false);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!dismissible) return;
    setDismissed(localStorage.getItem(KEY) === "1");
  }, [dismissible]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setI(v => (v + 1) % steps.length), 3400);
    return () => clearInterval(t);
  }, [playing]);

  if (dismissed !== false) return null;
  const step = steps[i];

  const dismiss = () => { localStorage.setItem(KEY, "1"); setDismissed(true); };
  const prev = () => { setPlaying(false); setI(v => (v - 1 + steps.length) % steps.length); };
  const next = () => { setPlaying(false); setI(v => (v + 1) % steps.length); };
  const restart = () => { setI(0); setPlaying(true); };

  return (
    <div className="rounded-xl border border-accent/30 bg-gradient-to-br from-accent/10 via-surface to-surface p-5 reveal relative overflow-hidden">
      {dismissible && (
        <button onClick={dismiss} className="absolute top-3 right-3 size-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground z-10" aria-label="Dismiss demo">
          <X className="size-4" />
        </button>
      )}

      <div className="flex items-center gap-2 mb-1">
        <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Interactive walkthrough</div>
        <span className="pulse-dot size-1.5 rounded-full bg-accent" />
      </div>
      <h3 className="font-display font-bold text-lg">Live simulation · a shift in 30 seconds</h3>
      <p className="text-sm text-muted-foreground">Watch how a real incident flows through VIKSHAKA — from alert to closure.</p>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        <div className="rounded-lg border border-border bg-surface-2/60 min-h-[240px] p-4 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Stage {step.n}/{steps.length} · {step.title}</div>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="size-7 rounded-md border border-border hover:bg-muted flex items-center justify-center" aria-label="Previous step" title="Previous">
                <ChevronLeft className="size-3.5" />
              </button>
              <button onClick={() => setPlaying(p => !p)} className="h-7 px-2.5 rounded-md border border-border hover:bg-muted flex items-center gap-1 text-[10px] font-mono uppercase" aria-label={playing ? "Pause" : "Play"}>
                {playing ? <><Pause className="size-3" /> Pause</> : <><Play className="size-3" /> Play</>}
              </button>
              <button onClick={next} className="size-7 rounded-md border border-border hover:bg-muted flex items-center justify-center" aria-label="Next step" title="Next">
                <ChevronRight className="size-3.5" />
              </button>
              <button onClick={restart} className="size-7 rounded-md border border-border hover:bg-muted flex items-center justify-center" aria-label="Restart" title="Restart">
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          <div key={step.n} className="animate-fade-in">
            {step.screen === "alert" && <StageAlert />}
            {step.screen === "dispatch" && <StageDispatch />}
            {step.screen === "cctv" && <StageCctv />}
            {step.screen === "aria" && <StageAria />}
            {step.screen === "report" && <StageReport />}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface-2/40 p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 px-1">Timeline</div>
          <ol className="space-y-1.5">
            {steps.map((s, idx) => {
              const active = idx === i;
              const done = idx < i;
              return (
                <li key={s.n}>
                  <button
                    onClick={() => { setI(idx); setPlaying(false); }}
                    className={`w-full text-left flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-all ${
                      active ? "bg-accent/15 border border-accent/30" : "border border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className={`mt-0.5 size-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      done ? "bg-success/20 text-success" : active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="size-3.5" /> : s.n}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-semibold ${active ? "text-foreground" : "text-foreground/80"}`}>{s.title}</div>
                      {active && <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.caption}</div>}
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500" style={{ width: `${((i + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StageAlert() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-widest text-destructive flex items-center gap-1.5">
        <ShieldAlert className="size-3.5" /> Incoming · Zone 7
      </div>
      <div className="rounded-lg border-l-4 border-l-destructive bg-destructive/5 border border-destructive/20 p-3 animate-[slide-in-right_0.4s_ease-out]">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold">Armed suspect detected · MG Road CCTV-04</div>
          <span className="text-[10px] font-mono text-destructive">CRITICAL</span>
        </div>
        <div className="text-[11px] text-muted-foreground mt-1">22:14 · Bengaluru South · confidence 94%</div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 rounded-md border border-border p-2 text-center">
          <div className="text-[10px] font-mono text-muted-foreground">New</div>
          <div className="text-lg font-bold text-destructive">1</div>
        </div>
        <div className="flex-1 rounded-md border border-border p-2 text-center opacity-60">
          <div className="text-[10px] font-mono text-muted-foreground">Investigating</div>
          <div className="text-lg font-bold">3</div>
        </div>
        <div className="flex-1 rounded-md border border-border p-2 text-center opacity-60">
          <div className="text-[10px] font-mono text-muted-foreground">Resolved</div>
          <div className="text-lg font-bold text-success">12</div>
        </div>
      </div>
    </div>
  );
}

function StageDispatch() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
        <Radio className="size-3.5" /> Dispatch matrix
      </div>
      <div className="rounded-lg border border-border bg-background/40 p-3">
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          {["P-14", "P-22", "P-07"].map((p, idx) => (
            <div key={p} className={`rounded border p-2 ${idx === 0 ? "border-primary bg-primary/10 animate-pulse-slow" : "border-border"}`}>
              <div className="font-mono font-bold">{p}</div>
              <div className="text-muted-foreground text-[10px] mt-0.5">ETA {[3, 7, 11][idx]}m</div>
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="size-3 text-muted-foreground" />
                <span className="text-[10px]">{["0.8km", "2.1km", "3.4km"][idx]}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-success flex items-center gap-1"><CheckCircle2 className="size-3" /> P-14 dispatched</span>
          <span className="text-muted-foreground font-mono">ETA 03:12</span>
        </div>
      </div>
    </div>
  );
}

function StageCctv() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-widest text-accent flex items-center gap-1.5">
        <Video className="size-3.5" /> AI feed lock
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`aspect-video rounded border overflow-hidden relative ${i === 1 ? "border-destructive" : "border-border"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
            <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "4px 4px" }} />
            {i === 1 && (
              <>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 border-2 border-destructive animate-pulse" />
                <div className="absolute top-1 left-1 text-[8px] font-mono text-destructive">LOCK</div>
              </>
            )}
            <div className="absolute bottom-0.5 right-1 text-[7px] font-mono text-white/60">CAM-{i + 1}</div>
          </div>
        ))}
      </div>
      <div className="text-[11px] text-muted-foreground">Cross-referenced across 4 feeds · target confirmed on CAM-2</div>
    </div>
  );
}

function StageAria() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
        <Sparkles className="size-3.5" /> ARIA copilot
      </div>
      <div className="rounded-lg border border-border bg-background/40 p-3 text-[11px] space-y-1.5">
        <div className="text-muted-foreground">You: <span className="text-foreground">Any prior record for this suspect?</span></div>
        <div className="border-l-2 border-primary pl-2 typing-line">
          Match: <span className="font-mono text-primary">C-9012</span> — 2 prior FIRs in
          <span className="font-mono text-primary"> VK-BLR-2024-0421</span>, associate of
          <span className="font-mono text-primary"> C-8871</span>.
        </div>
        <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">
          Sources: <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">VK-BLR-2024-0421</span>
          <span className="ml-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono">C-9012</span>
        </div>
      </div>
    </div>
  );
}

function StageReport() {
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono uppercase tracking-widest text-success flex items-center gap-1.5">
        <FileText className="size-3.5" /> Situation report
      </div>
      <div className="rounded-lg border border-border bg-background/40 p-3 space-y-1.5">
        {["Incident logged", "Patrol dispatched", "Suspect apprehended", "FIR draft prepared"].map((r, idx) => (
          <div key={r} className="flex items-center gap-2 text-[11px]" style={{ animationDelay: `${idx * 100}ms` }}>
            <CheckCircle2 className="size-3.5 text-success" />
            <span>{r}</span>
          </div>
        ))}
      </div>
      <button className="w-full text-[11px] font-semibold py-1.5 rounded-md bg-primary text-primary-foreground flex items-center justify-center gap-1.5">
        Export brief <ArrowRight className="size-3" />
      </button>
    </div>
  );
}
