import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck, ArrowRight, Radio, Zap, LogIn, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/auth";
import { DemoSimulation } from "@/components/DemoSimulation";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VIKSHAKA — AI Crime Intelligence Platform" },
      { name: "description", content: "Command-center intelligence platform for senior police officers." },
      { property: "og:title", content: "VIKSHAKA — Command Center" },
      { property: "og:description", content: "Enter the AI-powered crime intelligence command center." },
    ],
  }),
  component: Splash,
});

const SPLASH_KEY = "vk.splash.seen";

function Splash() {
  const navigate = useNavigate();
  const { session, hydrated } = useSession();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setProgress((p) => Math.min(100, p + 3)), 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
  }, [hydrated]);

  const enter = (to: "/dashboard" | "/auth") => {
    try { sessionStorage.setItem(SPLASH_KEY, "1"); } catch {}
    navigate({ to });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground relative overflow-hidden">
      {/* backdrop */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, var(--primary), transparent 40%), radial-gradient(circle at 70% 80%, var(--accent), transparent 45%)",
        }}
      />
      <div
        className="fixed inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="relative flex flex-col items-center text-center">
          <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2">
            <div className="size-[380px] rounded-full border border-primary/20 animate-[spin_18s_linear_infinite]" />
            <div className="absolute inset-6 rounded-full border border-accent/20 animate-[spin_24s_linear_infinite_reverse]" />
            <div className="absolute inset-14 rounded-full border border-primary/10 animate-[spin_32s_linear_infinite]" />
          </div>

          <div className="relative inline-block mb-6 float-slow">
            <div className="absolute inset-0 blur-3xl bg-primary/40 rounded-full animate-pulse" />
            <div className="relative size-24 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
              <ShieldCheck className="size-12 text-primary-foreground" strokeWidth={2} />
            </div>
          </div>

          <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary mb-2">Bharat Police · Command System</div>
          <h1 className="font-display text-6xl font-bold tracking-tight">VIKSHAKA</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-md">
            AI Crime Intelligence Platform — unified cases, hotspots, CCTV, criminal networks and an AI copilot for senior police officers.
          </p>

          <div className="flex items-center justify-center gap-6 mt-6 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><Radio className="size-3 text-success pulse-dot" />Secure link</span>
            <span className="flex items-center gap-1.5"><Zap className="size-3 text-primary" />AES-256</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="size-3 text-accent" />MHA-cleared</span>
          </div>

          {/* Clean Action Buttons */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => enter("/auth")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 shadow-glow transition-all"
            >
              <LogIn className="size-4" /> Sign In to Command Center <ArrowRight className="size-4" />
            </button>
            {hydrated && session && (
              <button
                onClick={() => enter("/dashboard")}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-surface hover:bg-muted text-sm font-semibold transition-colors"
              >
                <LayoutDashboard className="size-4 text-accent" /> Open Active Dashboard
              </button>
            )}
          </div>

          <div className="mt-8 max-w-xs w-full">
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {progress < 100 ? "Establishing secure channel…" : "Ready"}
            </div>
          </div>
        </div>

        {/* Interactive walkthrough */}
        <div className="mt-12">
          <DemoSimulation dismissible={false} autoPlay={true} />
        </div>
      </div>
    </div>
  );
}
