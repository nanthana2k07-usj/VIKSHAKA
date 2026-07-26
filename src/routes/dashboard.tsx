import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { CrimeMap } from "@/components/CrimeMap";
import {
  FolderOpen, ShieldAlert, Video, Users, TrendingUp, ArrowRight,
  Sparkles, Radio, Shield, UploadCloud, X, CheckCircle2, AlertTriangle,
  Car, Eye, Filter, Network, RefreshCw, Cpu
} from "lucide-react";
import { alerts, cases, kpis, trend7d, crimeMix } from "@/lib/mock-data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from "recharts";
import { Link } from "@tanstack/react-router";
import { OnboardingGuide } from "@/components/OnboardingGuide";
import { DemoSimulation } from "@/components/DemoSimulation";
import { useSession } from "@/lib/auth";
import { AIVoiceBriefing } from "@/components/AIVoiceBriefing";
import { AIInvestigationAlerts } from "@/components/AIInvestigationAlerts";
import { MassEmergencyModal } from "@/components/MassEmergencyModal";
import { AIAnalysisFloatingModal, type AIAnalysisData } from "@/components/AIAnalysisFloatingModal";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Command Dashboard · VIKSHAKA" },
      { name: "description", content: "Live command dashboard: KPIs, crime trends, hotspots, alerts and AI copilot." },
      { property: "og:title", content: "Command Dashboard · VIKSHAKA" },
      { property: "og:description", content: "Live KPIs, hotspots, alerts and AI copilot for police command." },
    ],
  }),
  component: Dashboard,
});

const sevColor: Record<string, string> = {
  critical: "border-l-destructive text-destructive",
  high: "border-l-warning text-warning",
  medium: "border-l-accent text-accent",
  low: "border-l-primary text-primary",
};

export function Dashboard() {
  const { session } = useSession();

  // Modals & Floating Drawer states
  const [isRedAlertOpen, setIsRedAlertOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [selectedGraphData, setSelectedGraphData] = useState<AIAnalysisData | null>(null);

  // Interactive Filter States
  const [trendTimeframe, setTrendTimeframe] = useState<"24h" | "7d" | "30d">("7d");
  const [caseFilterTab, setCaseFilterTab] = useState<"all" | "critical" | "investigating">("all");
  const [dispatchFilter, setDispatchFilter] = useState<string>("all");
  const [selectedCaseModal, setSelectedCaseModal] = useState<any | null>(null);
  const [selectedStatModal, setSelectedStatModal] = useState<string | null>(null);
  const [isPredictiveMode, setIsPredictiveMode] = useState<boolean>(false);
  const [activeCrimeCategory, setActiveCrimeCategory] = useState<string | null>(null);

  // Filtered cases logic
  const displayedCases = cases.filter((c) => {
    if (caseFilterTab === "critical") return c.priority === "critical";
    if (caseFilterTab === "investigating") return c.status === "investigating";
    if (activeCrimeCategory) return c.title.toLowerCase().includes(activeCrimeCategory.toLowerCase());
    return true;
  });

  // Filtered dispatch alerts
  const displayedAlerts = alerts.filter((a) => {
    if (dispatchFilter === "all") return true;
    return a.severity === dispatchFilter;
  });

  const handleLaunchAIStudy = (graphData?: AIAnalysisData) => {
    if (graphData) {
      setSelectedGraphData(graphData);
    }
    setIsAiModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Welcome Header & Mass Action Bar */}
      <div className="flex items-end justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Command Overview
            </span>
            {isPredictiveMode && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/40 animate-pulse">
                🔮 AI PREDICTIVE FORECAST MODE ACTIVE
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">
            Namaste, {session?.name.split(" ")[0] ?? "Officer"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {session?.rank ?? "Commissioner"} · {session?.station ?? "HQ"} · Real-time intelligence across {new Set(cases.map((c) => c.state)).size} states · {cases.length} active cases tracked
          </p>
        </div>

        {/* Executive Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AI Predictive Mode Toggle */}
          <button
            onClick={() => {
              setIsPredictiveMode((prev) => !prev);
              toast.info(
                isPredictiveMode
                  ? "AI Crime Forecast Mode disabled."
                  : "AI 24-Hour Predictive Crime Risk Simulation activated!"
              );
            }}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPredictiveMode
                ? "bg-accent text-accent-foreground shadow-glow"
                : "border border-border bg-surface hover:bg-muted text-foreground"
            }`}
          >
            <Sparkles className="size-3.5" />
            <span>{isPredictiveMode ? "Forecast Active" : "AI Risk Simulator"}</span>
          </button>

          {/* Upload & AI Analyze */}
          <button
            onClick={() => handleLaunchAIStudy()}
            className="px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="size-3.5" />
            <span>Upload AI Study</span>
          </button>

          {/* Mass Emergency Red Alert Trigger */}
          <button
            onClick={() => setIsRedAlertOpen(true)}
            className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground font-bold text-xs flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-lg animate-pulse"
          >
            <ShieldAlert className="size-4" />
            <span>TRIGGER RED ALERT</span>
          </button>
        </div>
      </div>

      {/* Real-time AI Audio Executive Briefing */}
      <AIVoiceBriefing commanderName={session?.name.split(" ")[0]} />

      <DemoSimulation />

      <OnboardingGuide />

      {/* Clickable Interactive Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setSelectedStatModal("Active Cases Breakdown: 11 cases tracked across 9 states")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard label="Active Cases" value={kpis.activeCases} icon={FolderOpen} delta={{ value: "+4.2%", direction: "up", positive: false }} meter={72} hint="Click for breakdown" />
        </div>
        <div
          onClick={() => setSelectedStatModal("Critical Alerts Breakdown: 2 high-priority incidents in Jayanagar & Delhi")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard label="Critical Alerts" value={kpis.criticalAlerts.toString().padStart(2, "0")} icon={ShieldAlert} accent="destructive" hint="Requires immediate action" />
        </div>
        <div
          onClick={() => setSelectedStatModal("CCTV Telemetry: 11 out of 12 feeds operational (91.7% Uptime)")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard label="CCTV Feeds Online" value={`${kpis.cctvOnline}/${kpis.cctvTotal}`} icon={Video} accent="success" meter={(kpis.cctvOnline / kpis.cctvTotal) * 100} hint={`${((kpis.cctvOnline / kpis.cctvTotal) * 100).toFixed(1)}% uptime`} />
        </div>
        <div
          onClick={() => setSelectedStatModal("Officer Deployment: 8 out of 8 approved units active on Shift B")}
          className="cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <StatCard label="Officers Deployed" value={`${kpis.officersDeployed}/${kpis.officersTotal}`} icon={Users} meter={(kpis.officersDeployed / kpis.officersTotal) * 100} hint="Shift B · 22:00–06:00" />
        </div>
      </div>

      {/* AI Autonomous Investigation Alerts Center Widget */}
      <AIInvestigationAlerts onLaunchGraph={handleLaunchAIStudy} />

      {/* Trend Chart & Live Hotspots Map */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Interactive Trend Chart */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-surface p-5 reveal flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-lg">Incidence & Resolution Trend</h3>
                <span className="text-[10px] font-mono text-primary font-bold">
                  {trendTimeframe === "24h" ? "24 Hours" : trendTimeframe === "7d" ? "7 Days" : "30 Days"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Teal = Reported Incidents · Green = Resolved Cases</p>
            </div>

            {/* Timeframe selector tabs */}
            <div className="flex bg-surface-2 p-1 rounded-lg border border-border">
              {(["24h", "7d", "30d"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTrendTimeframe(tf)}
                  className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                    trendTimeframe === tf ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend7d}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--success)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} fontFamily="var(--font-mono)" />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} fontFamily="var(--font-mono)" />
                <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="incidents" stroke="var(--primary)" strokeWidth={2} fill="url(#g1)" />
                <Area type="monotone" dataKey="resolved" stroke="var(--success)" strokeWidth={2} fill="url(#g2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Hotspots Map */}
        <div className="rounded-xl border border-border bg-surface p-5 flex flex-col reveal">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-display font-bold">Live Hotspots & CCTV</h3>
              <p className="text-[11px] text-muted-foreground">Interactive sector map</p>
            </div>
            <Link to="/hotspots" className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline">
              Full Map →
            </Link>
          </div>
          <div className="flex-1 min-h-[260px]">
            <CrimeMap compact />
          </div>
        </div>
      </div>

      {/* Critical Open Cases & Live Dispatch Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Interactive Critical Open Cases */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-surface reveal flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-lg">Critical Open Cases</h3>
              <p className="text-[11px] text-muted-foreground">Click any case row to inspect dossier & dispatch</p>
            </div>

            {/* Case Filter Tabs */}
            <div className="flex bg-surface-2 p-1 rounded-lg border border-border">
              {(["all", "critical", "investigating"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCaseFilterTab(tab)}
                  className={`px-3 py-1 rounded text-[10px] font-mono uppercase font-bold transition-colors ${
                    caseFilterTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-border">
            {displayedCases.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCaseModal(c)}
                className="p-4 hover:bg-muted/40 transition-colors flex items-center gap-4 cursor-pointer group"
              >
                <div className="font-mono text-[10px] text-muted-foreground w-28 shrink-0 uppercase">
                  {c.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                    {c.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {c.ipc} · {c.district}, {c.state} · IO {c.officer}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 font-bold">
                    {c.status}
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Dispatch Feed with Action Buttons */}
        <div className="rounded-xl border border-border bg-surface reveal flex flex-col">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-display font-bold text-lg">Live Dispatch Feed</h3>
              <p className="text-[11px] text-muted-foreground">Real-time PCR Triage</p>
            </div>

            {/* Severity Filter */}
            <select
              value={dispatchFilter}
              onChange={(e) => setDispatchFilter(e.target.value)}
              className="bg-surface-2 border border-border text-[10px] font-mono uppercase rounded p-1 text-foreground"
            >
              <option value="all">ALL SEVERITIES</option>
              <option value="critical">CRITICAL ONLY</option>
              <option value="high">HIGH ONLY</option>
            </select>
          </div>

          <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
            {displayedAlerts.slice(0, 6).map((a) => (
              <div key={a.id} className={`p-3 border-l-4 ${sevColor[a.severity]?.split(" ")[0]} space-y-1.5`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground">{a.time}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${sevColor[a.severity]?.split(" ")[1]}`}>
                    {a.severity}
                  </span>
                </div>
                <div className="text-xs font-semibold leading-snug">{a.title}</div>
                <div className="text-[11px] text-muted-foreground">{a.location} · {a.officer}</div>
                <div className="pt-1 flex items-center gap-2">
                  <button
                    onClick={() => toast.success(`Unit dispatched for alert ${a.id}`)}
                    className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-mono font-bold hover:bg-primary/20"
                  >
                    DISPATCH UNIT
                  </button>
                  <button
                    onClick={() => handleLaunchAIStudy()}
                    className="px-2 py-0.5 rounded bg-surface border border-border text-[9px] font-mono text-muted-foreground hover:text-foreground"
                  >
                    AI GRAPH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filterable Crime Mix Bar Chart */}
      <div className="rounded-xl border border-border bg-surface p-5 reveal space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-display font-bold text-lg">Crime Mix Category Analysis</h3>
            <p className="text-[11px] text-muted-foreground">Click any bar to filter cases by crime type</p>
          </div>
          {activeCrimeCategory && (
            <button
              onClick={() => setActiveCrimeCategory(null)}
              className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1"
            >
              <X className="size-3" /> Clear Filter: {activeCrimeCategory}
            </button>
          )}
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={crimeMix}
              onClick={(state) => {
                if (state && state.activePayload && state.activePayload.length > 0) {
                  const cat = state.activePayload[0].payload.type;
                  setActiveCrimeCategory(cat);
                  toast.info(`Filtered dashboard cases by ${cat}`);
                }
              }}
            >
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={10} fontFamily="var(--font-mono)" />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} fontFamily="var(--font-mono)" />
              <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} className="cursor-pointer" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MODAL 1: Case Detail Inspector Modal */}
      {selectedCaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                  {selectedCaseModal.id}
                </span>
                <h3 className="font-display text-lg font-bold mt-1">{selectedCaseModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCaseModal(null)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-surface-2 border border-border">
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Statute / IPC</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedCaseModal.ipc}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Investigating Officer</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedCaseModal.officer}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Jurisdiction</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedCaseModal.district}, {selectedCaseModal.state}</div>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">Current Status</span>
                  <div className="font-semibold text-destructive mt-0.5 uppercase">{selectedCaseModal.status}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-surface-2 space-y-1">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">AI Evidence Correlation</span>
                <p className="text-xs text-foreground leading-relaxed">
                  Matched biometric & location telemetry with high confidence. Suggested next action: Issue section 91 notice.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => {
                  setSelectedCaseModal(null);
                  handleLaunchAIStudy();
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5"
              >
                <Network className="size-3.5" /> Launch AI Graph Study
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Stat Card Breakdown Modal */}
      {selectedStatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold">Stat Telemetry Breakdown</h3>
              <button
                onClick={() => setSelectedStatModal(null)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="text-xs text-foreground font-sans bg-surface-2 p-4 rounded-xl border border-border">
              {selectedStatModal}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStatModal(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Red Alert Emergency Command Dialog */}
      <MassEmergencyModal isOpen={isRedAlertOpen} onClose={() => setIsRedAlertOpen(false)} />

      {/* MODAL 4: Universal Floating AI Graph Study & Uploader Modal */}
      <AIAnalysisFloatingModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        analysisData={selectedGraphData}
      />
    </div>
  );
}
