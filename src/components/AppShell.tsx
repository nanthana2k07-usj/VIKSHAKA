import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  LayoutGrid, MapPin, Video, BarChart3, Network, FolderOpen, Car, BellRing,
  FileText, Settings, Search, ShieldCheck, Radio, Sparkles, ChevronDown, LogOut, User, UploadCloud, Sun, Database, PlusCircle,
  RadioTower, Fingerprint, BookOpen, ScrollText, Activity
} from "lucide-react";
import { toast } from "sonner";
import { CopilotDock } from "@/components/CopilotDock";
import { AIAnalysisFloatingModal, type AIAnalysisData } from "@/components/AIAnalysisFloatingModal";
import { useTheme } from "@/lib/theme";
import { useSession } from "@/lib/auth";
import { can, roleBadgeClass, roleLabel, type Action } from "@/lib/rbac";
import { alerts, patrols, kpis, dispatchLog } from "@/lib/mock-data";
import { apiClient } from "@/services/apiClient";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm: Action;
  badge?: number | string;
  badgeVariant?: "default" | "critical" | "success" | "warning";
  description?: string;
};

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

const navSections: NavSection[] = [
  {
    id: "command",
    label: "Command Center",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutGrid, perm: "view:dashboard", description: "Live KPIs & overview" },
    ],
  },
  {
    id: "intelligence",
    label: "Crime Intelligence",
    items: [
      { to: "/hotspots", label: "Crime Hotspots", icon: MapPin, perm: "view:hotspots", description: "Geospatial risk mapping" },
      { to: "/cctv", label: "CCTV Monitoring", icon: Video, perm: "view:cctv", badge: kpis.cctvOnline, badgeVariant: "success", description: "Live feeds & AI detection" },
      { to: "/analysis", label: "Crime Analysis", icon: BarChart3, perm: "view:analysis", description: "Trends & predictions" },
      { to: "/networks", label: "Criminal Networks", icon: Network, perm: "view:networks", description: "Graph intelligence" },
      { to: "/cases", label: "Cases & Records", icon: FolderOpen, perm: "view:cases", badge: kpis.activeCases, description: "FIR registry & case files" },
    ],
  },
  {
    id: "operations",
    label: "Field Operations",
    items: [
      { to: "/patrol", label: "Patrol Management", icon: Car, perm: "view:patrol", badge: patrols.filter(p => p.status !== "standby").length, badgeVariant: "success", description: "Unit deployment & beats" },
      { to: "/dispatch", label: "Dispatch Center", icon: RadioTower, perm: "view:dispatch", badge: dispatchLog.filter(d => d.status === "en_route" || d.status === "dispatched").length, badgeVariant: "warning", description: "Real-time unit dispatch" },
      { to: "/evidence", label: "Evidence Vault", icon: Fingerprint, perm: "view:evidence", badge: 8, description: "Chain of custody & forensics" },
      { to: "/alerts", label: "Alert Triage", icon: BellRing, perm: "view:alerts", badge: kpis.criticalAlerts, badgeVariant: "critical", description: "Live incident triage board" },
    ],
  },
  {
    id: "admin",
    label: "Command & Admin",
    items: [
      { to: "/briefings", label: "Intel Briefings", icon: BookOpen, perm: "view:briefings", badge: "NEW", description: "Classified intelligence reports" },
      { to: "/reports", label: "Reports", icon: FileText, perm: "view:reports", description: "Executive report generation" },
      { to: "/audit", label: "Audit Trail", icon: ScrollText, perm: "view:audit", description: "Compliance & activity log" },
      { to: "/settings", label: "Settings", icon: Settings, perm: "view:settings", description: "System preferences" },
    ],
  },
];
function NavBadge({ value, variant = "default" }: { value: number | string; variant?: NavItem["badgeVariant"] }) {
  const styles = {
    default: "bg-muted text-muted-foreground",
    critical: "bg-destructive/15 text-destructive border border-destructive/25",
    success: "bg-success/15 text-success border border-success/25",
    warning: "bg-warning/15 text-warning border border-warning/25",
  };
  return (
    <span className={`ml-auto shrink-0 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center ${styles[variant ?? "default"]}`}>
      {value}
    </span>
  );
}

function SidebarNav({ sections, isActive }: { sections: NavSection[]; isActive: (to: string) => boolean }) {
  return (
    <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
      {sections.map(section => {
        const visibleItems = section.items.filter(item => true);
        if (visibleItems.length === 0) return null;
        return (
          <div key={section.id}>
            <div className="px-3 mb-1.5 flex items-center gap-2">
              <span className="text-[9px] font-mono uppercase tracking-[0.15em] text-muted-foreground/70 font-semibold">
                {section.label}
              </span>
              <div className="flex-1 h-px bg-sidebar-border/60" />
            </div>
            <div className="space-y-0.5">
              {visibleItems.map(({ to, label, icon: Icon, badge, badgeVariant, description }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    title={description}
                    className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground border border-transparent"
                    }`}
                  >
                    <div className={`size-7 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      active ? "bg-primary/15" : "bg-sidebar-accent/50 group-hover:bg-sidebar-accent"
                    }`}>
                      <Icon className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className={`block truncate text-[13px] ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
                      {description && (
                        <span className="block truncate text-[10px] text-muted-foreground/60 mt-0.5 leading-tight hidden lg:block">
                          {description}
                        </span>
                      )}
                    </div>
                    {badge !== undefined && <NavBadge value={badge} variant={badgeVariant} />}
                    {active && badge === undefined && <span className="ml-auto size-1.5 rounded-full bg-primary pulse-dot shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function ThemeChip() {
  const { theme, setTheme } = useTheme();
  const themes = [
    { id: "bureau", label: "Bureau" },
    { id: "tactical", label: "Tactical" },
    { id: "graphite", label: "Graphite" },
    { id: "ivory", label: "White (Ivory)" },
  ] as const;
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2/60 p-1">
      {themes.map(t => (
        <button key={t.id} onClick={() => setTheme(t.id)}
          className={`px-2 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest transition-colors flex items-center gap-1 ${
            theme === t.id ? "bg-primary text-primary-foreground font-bold" : "text-muted-foreground hover:text-foreground"
          }`}>
          {t.id === "ivory" && <Sun className="size-3" />}
          {t.label}
        </button>
      ))}
    </div>
  );
}

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const critical = alerts.filter(a => a.severity === "critical").length;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} className="relative size-9 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2 flex items-center justify-center">
        <BellRing className="size-4" />
        {critical > 0 && <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">{critical}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-80 rounded-xl border border-border bg-surface shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="font-display font-bold text-sm">Live alerts</div>
            <Link to="/alerts" onClick={() => setOpen(false)} className="text-[10px] font-mono text-primary uppercase tracking-widest hover:underline">Triage →</Link>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {alerts.slice(0, 6).map(a => (
              <div key={a.id} className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground">{a.time}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
                    a.severity === "critical" ? "bg-destructive/10 text-destructive" :
                    a.severity === "high" ? "bg-warning/10 text-warning" :
                    a.severity === "medium" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                  }`}>{a.severity}</span>
                </div>
                <div className="text-xs font-semibold">{a.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{a.location}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OfficerChip() {
  const { session, signOut } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  if (!session) return null;

  const logout = () => {
    signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-border bg-surface-2/60 hover:bg-surface-2">
        <div className="size-7 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-[10px] font-bold text-primary-foreground">
          {session.avatar}
        </div>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-xs font-semibold truncate max-w-[120px]">{session.name.split(" ").slice(0, 2).join(" ")}</span>
          <span className={`text-[9px] font-mono uppercase tracking-widest ${roleBadgeClass[session.role].split(" ")[1]}`}>{roleLabel[session.role]}</span>
        </div>
        <ChevronDown className="size-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-64 rounded-xl border border-border bg-surface shadow-2xl z-50 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="text-xs font-semibold">{session.name}</div>
            <div className="text-[10px] text-muted-foreground">{session.rank} · {session.station}</div>
            <span className={`inline-flex items-center mt-2 text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${roleBadgeClass[session.role]}`}>
              {roleLabel[session.role]} access
            </span>
          </div>
          <button onClick={() => { setOpen(false); navigate({ to: "/profile" }); }}
            className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted flex items-center gap-2">
            <User className="size-3.5" /> View profile
          </button>
          <button onClick={() => { setOpen(false); navigate({ to: "/settings" }); }}
            className="w-full text-left px-4 py-2.5 text-xs hover:bg-muted flex items-center gap-2 border-t border-border">
            <Settings className="size-3.5" /> Settings
          </button>
          <button onClick={logout} className="w-full text-left px-4 py-2.5 text-xs hover:bg-destructive/10 text-destructive flex items-center gap-2 border-t border-border">
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: s => s.location.pathname });
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const { session } = useSession();
  const role = session?.role;

  const visibleSections = navSections
    .map(section => ({
      ...section,
      items: section.items.filter(n => can(role, n.perm)),
    }))
    .filter(section => section.items.length > 0);

  const visibleNav = visibleSections.flatMap(s => s.items);
  const currentAllowed = visibleNav.some(n => pathname.startsWith(n.to));

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        <div className="px-5 py-5 flex items-center gap-3 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary flex items-center justify-center shadow-glow">
              <ShieldCheck className="size-5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display font-bold text-lg tracking-tight leading-none">VIKSHAKA</div>
              <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mt-0.5">Crime Intelligence</div>
            </div>
          </Link>
        </div>

        <SidebarNav sections={visibleSections} isActive={isActive} />

        <div className="p-4 border-t border-sidebar-border space-y-3">
          <div className="rounded-lg border border-sidebar-border bg-sidebar-accent/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">Ops Status</span>
              <Activity className="size-3 text-success" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-md bg-background/40 px-2 py-1.5">
                <div className="text-[9px] font-mono text-muted-foreground">Units Active</div>
                <div className="text-sm font-bold text-success">{patrols.filter(p => p.status !== "standby").length}/{patrols.length}</div>
              </div>
              <div className="rounded-md bg-background/40 px-2 py-1.5">
                <div className="text-[9px] font-mono text-muted-foreground">Critical Alerts</div>
                <div className="text-sm font-bold text-destructive">{kpis.criticalAlerts}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <div className="size-2 rounded-full bg-success pulse-dot" />
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">Network encrypted · AES-256</span>
          </div>
          {session && (
            <Link to="/profile" className="flex items-center gap-3 px-1 hover:opacity-80">
              <div className="size-8 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-xs font-bold text-foreground">
                {session.avatar}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">{session.name}</div>
                <div className="text-[10px] font-mono text-muted-foreground truncate">{session.rank}</div>
              </div>
            </Link>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 shrink-0 flex items-center justify-between gap-4 px-6 border-b border-border glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Current Command</span>
              <span className="text-sm font-semibold truncate">{session?.district ?? "District"} · {session?.station ?? "HQ"}</span>
            </div>
            <div className="h-8 w-px bg-border hidden lg:block" />
            <div className="relative hidden md:flex items-center flex-1 max-w-md">
              <Search className="size-4 text-muted-foreground absolute left-3" />
              <input
                type="text"
                placeholder="Search cases, IPC codes, criminals, officers…"
                onKeyDown={e => { if (e.key === "Enter" && (e.target as HTMLInputElement).value) toast.info(`Searching "${(e.target as HTMLInputElement).value}"…`); }}
                className="w-full bg-surface-2/60 border border-border rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-primary/50 transition-colors"
              />
              <kbd className="absolute right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeChip />
            <button
              onClick={() => apiClient.generateSyntheticCaseRecord()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-success/40 bg-success/10 hover:bg-success/20 text-success text-xs font-semibold transition-colors"
              title="Add Real-time / Synthetic Database Record"
            >
              <PlusCircle className="size-4" />
              <span className="hidden lg:inline">+ Synthetic Record</span>
            </button>
            <button
              onClick={() => setAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold transition-colors"
            >
              <UploadCloud className="size-4" />
              <span className="hidden lg:inline">Upload & AI Analyze</span>
            </button>
            <NotificationsBell />
            <div className="text-right hidden md:block">
              <div className="text-xs font-mono">{dateStr}</div>
              <div className="text-[10px] font-mono text-primary">{timeStr} IST</div>
            </div>
            <button onClick={() => setCopilotOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
              <Sparkles className="size-4" /><span className="hidden sm:inline">Ask ARIA</span>
            </button>
            <OfficerChip />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1600px] p-6 lg:p-8">
            {!currentAllowed && role && pathname !== "/profile" ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-10 text-center max-w-lg mx-auto mt-16">
                <ShieldCheck className="size-10 text-destructive mx-auto mb-3" />
                <h2 className="font-display text-xl font-bold">Insufficient clearance</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Your role <span className="font-semibold text-foreground">{roleLabel[role]}</span> does not have access to this module.
                  Contact the workspace administrator to request elevated permissions.
                </p>
                <Link to="/dashboard" className="inline-block mt-5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  Back to dashboard
                </Link>
              </div>
            ) : children}
          </div>
        </main>
      </div>

      <CopilotDock open={copilotOpen} onOpenChange={setCopilotOpen} />
      <AIAnalysisFloatingModal isOpen={aiModalOpen} onClose={() => setAiModalOpen(false)} />

      <div className="fixed bottom-0 left-64 right-0 h-6 border-t border-border bg-sidebar/80 backdrop-blur-md flex items-center px-4 text-[10px] font-mono text-muted-foreground z-20">
        <Radio className="size-3 mr-2 text-success" />
        <span className="pulse-dot text-success mr-3">LIVE</span>
        <span>DISPATCH · PCR-42 en route Jayanagar · PCR-44 checkpoint Hebbal · ANPR match KA-05-BX-2214 · CAM-118 weapon detection resolved</span>
      </div>
    </div>
  );
}
