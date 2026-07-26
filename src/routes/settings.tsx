import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useTheme, type ThemeName } from "@/lib/theme";
import { Check } from "lucide-react";
import { useSession } from "@/lib/auth";
import { roleBadgeClass, roleLabel } from "@/lib/rbac";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · VIKSHAKA" },
      {
        name: "description",
        content: "Personalise theme, notifications, and command preferences.",
      },
      { property: "og:title", content: "Settings · VIKSHAKA" },
      {
        property: "og:description",
        content: "VIKSHAKA settings and personalisation.",
      },
    ],
  }),
  component: SettingsPage,
});

const themes: Array<{
  id: ThemeName;
  label: string;
  sub: string;
  swatch: string[];
}> = [
  {
    id: "bureau",
    label: "Midnight Bureau",
    sub: "Executive · teal + gold on ink navy",
    swatch: ["#0f172a", "#2dd4bf", "#fbbf24"],
  },
  {
    id: "tactical",
    label: "Midnight Tactical",
    sub: "Field · electric cyan on near-black",
    swatch: ["#05070d", "#00f0ff", "#3b6eea"],
  },
  {
    id: "graphite",
    label: "Graphite Intelligence",
    sub: "Terminal · amber on graphite",
    swatch: ["#18181b", "#f59e0b", "#ef4444"],
  },
  {
    id: "ivory",
    label: "Ivory Briefing",
    sub: "Light theme · clean white workspace with blue accents",
    swatch: ["#ffffff", "#e2e8f0", "#2563eb"],
  },
];

const DEFAULT_NOTIFS = [
  { key: "sms", label: "Critical alerts (SMS)", on: true },
  { key: "digest", label: "AI predictions digest (daily)", on: true },
  { key: "weapon", label: "CCTV weapon detections", on: true },
  { key: "checkin", label: "Patrol check-in delays > 15 min", on: false },
  { key: "fir", label: "New FIR in assigned district", on: true },
];

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { session } = useSession();
  const [notifs, setNotifs] = useState(DEFAULT_NOTIFS);
  const toggle = (key: string) =>
    setNotifs((prev) =>
      prev.map((n) => {
        if (n.key !== key) return n;
        toast.success(`${n.label} · ${!n.on ? "enabled" : "muted"}`);
        return { ...n, on: !n.on };
      }),
    );
  return (
    <div className="space-y-8 pb-10 max-w-4xl">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Personalisation
        </div>
        <h1 className="font-display text-3xl font-bold mt-1">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure command-center preferences and notification routing
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-bold">Theme</h2>
        <p className="text-xs text-muted-foreground">
          Four professional command-center themes. Switch anytime and keep
          either a dark operations view or a clean white briefing view.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {themes.map((t) => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`rounded-xl border p-5 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-glow"
                    : "border-border bg-surface hover:border-primary/30"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-1">
                    {t.swatch.map((s) => (
                      <div
                        key={s}
                        className="size-8 rounded-md border border-border"
                        style={{ background: s }}
                      />
                    ))}
                  </div>
                  {active && (
                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <Check className="size-3.5" />
                    </div>
                  )}
                </div>
                <div className="font-display font-bold">{t.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t.sub}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-bold">Notifications</h2>
        <div className="rounded-xl border border-border bg-surface divide-y divide-border">
          {notifs.map((r) => (
            <button
              type="button"
              key={r.key}
              onClick={() => toggle(r.key)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/40 text-left"
            >
              <span className="text-sm">{r.label}</span>
              <div
                className={`h-6 w-11 rounded-full p-0.5 transition-colors ${r.on ? "bg-primary" : "bg-muted"}`}
              >
                <div
                  className={`size-5 rounded-full bg-background transition-transform ${r.on ? "translate-x-5" : ""}`}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display font-bold">Officer profile</h2>
        <div className="rounded-xl border border-border bg-surface p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Name
            </div>
            <div className="text-sm font-semibold mt-1">
              {session?.name ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Role
            </div>
            <div className="mt-1">
              {session?.role ? (
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${roleBadgeClass[session.role]}`}
                >
                  {roleLabel[session.role]}
                </span>
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Badge
            </div>
            <div className="text-sm font-semibold mt-1 font-mono">
              {session?.badge ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-muted-foreground">
              Station
            </div>
            <div className="text-sm font-semibold mt-1">
              {session?.station ?? "—"}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
