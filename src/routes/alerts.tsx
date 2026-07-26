import { createFileRoute } from "@tanstack/react-router";
import {
  alerts as seed,
  officers,
  patrols,
  type Alert as SeedAlert,
} from "@/lib/mock-data";
import { useMemo, useState } from "react";
import {
  ShieldAlert,
  Bell,
  CheckCircle2,
  Filter,
  ArrowRight,
  Users,
  Radio,
  TriangleAlert,
  FileText,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alert Triage · VIKSHAKA" },
      {
        name: "description",
        content:
          "Streamlined alert triage board — acknowledge, dispatch, escalate and resolve in real time.",
      },
      { property: "og:title", content: "Alert Triage · VIKSHAKA" },
      {
        property: "og:description",
        content: "Live triage board for critical, high and medium alerts.",
      },
    ],
  }),
  component: AlertsPage,
});

type Stage = "new" | "investigating" | "resolved";
interface TriageAlert extends SeedAlert {
  stage: Stage;
  assignedTo?: string;
}
interface InvestigationResult {
  fileName: string;
  summary: string;
  crimePattern: string;
  investigationAngles: string[];
  evidenceChecklist: string[];
  linkedAlert: string;
}

const sevBadge: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-accent/10 text-accent border-accent/30",
  low: "bg-primary/10 text-primary border-primary/30",
};
const sevBorder: Record<string, string> = {
  critical: "border-l-destructive",
  high: "border-l-warning",
  medium: "border-l-accent",
  low: "border-l-primary",
};

function AlertsPage() {
  const { session } = useSession();
  const [items, setItems] = useState<TriageAlert[]>(() =>
    seed.map((a) => ({
      ...a,
      stage:
        a.severity === "critical"
          ? "new"
          : a.severity === "high"
            ? "investigating"
            : "new",
      assignedTo: a.officer,
    })),
  );
  const [sevFilter, setSevFilter] = useState<string>("all");
  const [investigationFile, setInvestigationFile] = useState<File | null>(null);
  const [investigationResult, setInvestigationResult] =
    useState<InvestigationResult | null>(null);

  const filtered = useMemo(
    () =>
      sevFilter === "all"
        ? items
        : items.filter((a) => a.severity === sevFilter),
    [items, sevFilter],
  );
  const byStage = (s: Stage) => filtered.filter((a) => a.stage === s);

  const move = (id: string, stage: Stage) => {
    if (!can(session?.role, "action:ack_alert")) {
      toast.error("Your role cannot triage alerts");
      return;
    }
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    toast.success(`Alert ${id} → ${stage.replace("_", " ")}`);
  };

  const assign = (id: string, officer: string) => {
    setItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, assignedTo: officer } : a)),
    );
    toast.info(`Assigned ${id} to ${officer}`);
  };

  const dispatch = (id: string) => {
    if (!can(session?.role, "action:dispatch")) {
      toast.error("Dispatch requires Officer or Commissioner clearance");
      return;
    }
    const patrol = patrols[Math.floor(Math.random() * patrols.length)];
    toast.success(`${patrol.unit} dispatched for ${id}`, {
      description: `${patrol.zone} · ${patrol.lead}`,
    });
    move(id, "investigating");
  };

  const escalate = (id: string) => {
    if (!can(session?.role, "action:escalate")) {
      toast.error("Insufficient clearance to escalate");
      return;
    }
    setItems((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, severity: "critical" as const } : a,
      ),
    );
    toast.warning(`${id} escalated to CRITICAL`);
  };

  const counts = {
    critical: items.filter((a) => a.severity === "critical").length,
    high: items.filter((a) => a.severity === "high").length,
    medium: items.filter((a) => a.severity === "medium").length,
    low: items.filter((a) => a.severity === "low").length,
  };

  const runAiInvestigation = () => {
    if (!investigationFile) {
      toast.error("Upload a case file, FIR scan, or evidence brief first");
      return;
    }

    const normalized = investigationFile.name.toLowerCase();
    const linkedAlert =
      items.find(
        (item) =>
          normalized.includes(item.id.toLowerCase()) ||
          normalized.includes(
            item.category.toLowerCase().replace(/\s+/g, "-"),
          ) ||
          normalized.includes(
            item.location
              .toLowerCase()
              .split(",")[0]
              .trim()
              .replace(/\s+/g, "-"),
          ),
      ) ?? items[0];

    const cyber =
      normalized.includes("cyber") ||
      normalized.includes("fraud") ||
      normalized.includes("deepfake");
    const violent =
      normalized.includes("weapon") ||
      normalized.includes("attack") ||
      normalized.includes("robbery");

    setInvestigationResult({
      fileName: investigationFile.name,
      linkedAlert: linkedAlert.id,
      summary: cyber
        ? "AI review indicates a digitally coordinated fraud workflow with victim targeting, remote contact points, and likely repeat execution against similar profiles."
        : violent
          ? "AI review indicates a planned physical incident with target surveillance, intimidation cues, and rapid post-offence movement."
          : "AI review indicates a multi-actor complaint requiring entity extraction, timeline reconstruction, and evidence preservation.",
      crimePattern: cyber
        ? "Pattern points to cyber-enabled deception, credential misuse, and possible campaign reuse across multiple complainants."
        : violent
          ? "Pattern points to coordinated approach, force or threat, and a short escape corridor supported by limited CCTV exposure."
          : "Pattern points to repeatable procedural abuse and overlapping actors across documents, statements, and location references.",
      investigationAngles: cyber
        ? [
            "Map payment and communication identifiers across earlier complaints.",
            "Preserve device artifacts, message headers, and account recovery traces.",
            "Link the report with any active deepfake or impersonation complaints.",
          ]
        : violent
          ? [
              "Pull CCTV in the 30 minutes before and after the incident.",
              "Cross-check vehicle, weapon, or suspect descriptors against open alerts.",
              "Prioritize witness statement sequencing and route reconstruction.",
            ]
          : [
              "Extract named entities from the upload and resolve duplicates.",
              "Build a timeline from the narrative and compare against existing alerts.",
              "Preserve hardcopy metadata and scan quality for evidentiary use.",
            ],
      evidenceChecklist: cyber
        ? [
            "Victim device images",
            "Call/message logs",
            "Payment instrument trail",
            "Platform account identifiers",
          ]
        : violent
          ? [
              "Scene photographs",
              "CCTV clips",
              "Witness statements",
              "Vehicle or weapon references",
            ]
          : [
              "Uploaded scan",
              "Complainant details",
              "Supporting annexures",
              "Timeline references",
            ],
    });

    toast.success(`AI investigation completed for ${investigationFile.name}`, {
      description: `Linked to alert ${linkedAlert.id}`,
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Live Command
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">Alert Triage</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} alerts · {byStage("new").length} new ·{" "}
            {byStage("investigating").length} investigating ·{" "}
            {byStage("resolved").length} resolved
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={sevFilter}
            onChange={(e) => setSevFilter(e.target.value)}
            className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs"
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map((k) => (
          <div
            key={k}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div
              className={`text-[10px] font-mono uppercase tracking-widest ${sevBadge[k].split(" ")[1]}`}
            >
              {k}
            </div>
            <div className="font-display text-3xl font-bold mt-1">
              {counts[k]}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Column
          title="New"
          stage="new"
          icon={Bell}
          count={byStage("new").length}
          accent="text-destructive"
        >
          {byStage("new").map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onMove={move}
              onAssign={assign}
              onDispatch={dispatch}
              onEscalate={escalate}
            />
          ))}
        </Column>
        <Column
          title="Investigating"
          stage="investigating"
          icon={Radio}
          count={byStage("investigating").length}
          accent="text-warning"
        >
          {byStage("investigating").map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onMove={move}
              onAssign={assign}
              onDispatch={dispatch}
              onEscalate={escalate}
            />
          ))}
        </Column>
        <Column
          title="Resolved"
          stage="resolved"
          icon={CheckCircle2}
          count={byStage("resolved").length}
          accent="text-success"
        >
          {byStage("resolved").map((a) => (
            <AlertCard
              key={a.id}
              a={a}
              onMove={move}
              onAssign={assign}
              onDispatch={dispatch}
              onEscalate={escalate}
            />
          ))}
        </Column>
      </div>

      <section className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
              AI Investigation
            </div>
            <h2 className="font-display text-xl font-bold mt-1">
              Upload case file for detailed investigation analysis
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              After triage, upload a case note, FIR scan, or evidence brief and
              generate AI summary, crime pattern assessment, investigation
              angles, and evidence checklist.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Works with PDF and image uploads
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="rounded-xl border border-border bg-surface-2 p-4 space-y-3">
            <label className="block">
              <input
                type="file"
                accept="image/*,application/pdf,.txt"
                className="hidden"
                onChange={(e) =>
                  setInvestigationFile(e.target.files?.[0] ?? null)
                }
              />
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center cursor-pointer hover:border-primary/40">
                <Upload className="size-5 mx-auto text-primary" />
                <div className="mt-2 text-sm font-semibold">
                  {investigationFile
                    ? investigationFile.name
                    : "Choose case file"}
                </div>
                <div className="text-[11px] text-muted-foreground mt-1">
                  Upload charge brief, FIR scan, witness note, or supporting
                  evidence packet.
                </div>
              </div>
            </label>
            <button
              onClick={runAiInvestigation}
              className="w-full px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              Run AI investigation
            </button>
          </div>

          <div className="rounded-xl border border-border bg-surface-2 p-4">
            {investigationResult ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-primary">
                      Investigation output
                    </div>
                    <div className="text-sm font-semibold">
                      {investigationResult.fileName}
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-surface p-3 text-sm leading-relaxed">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                    Detailed summary
                  </div>
                  {investigationResult.summary}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <InsightCard
                    title="Crime pattern"
                    value={investigationResult.crimePattern}
                  />
                  <InsightCard
                    title="Linked alert"
                    value={investigationResult.linkedAlert}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <ListCard
                    title="Investigation angles"
                    items={investigationResult.investigationAngles}
                  />
                  <ListCard
                    title="Evidence checklist"
                    items={investigationResult.evidenceChecklist}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full rounded-lg border border-dashed border-border bg-surface flex items-center justify-center p-6 text-center text-sm text-muted-foreground">
                AI investigation output appears here after you upload a case
                file.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  function Column({
    title,
    icon: Icon,
    count,
    accent,
    children,
  }: {
    title: string;
    stage: Stage;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    accent: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="rounded-xl border border-border bg-surface flex flex-col min-h-[500px]">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`size-4 ${accent}`} />
            <h3 className="font-display font-bold text-sm">{title}</h3>
          </div>
          <span
            className={`text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted ${accent}`}
          >
            {count}
          </span>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[70vh]">
          {count === 0 ? (
            <div className="text-center text-[11px] font-mono text-muted-foreground uppercase tracking-widest py-8">
              No alerts
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    );
  }
}

function InsightCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="text-sm mt-2 leading-relaxed">{value}</div>
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 space-y-2">
        {items.map((item) => (
          <div key={item} className="text-sm flex gap-2">
            <span className="text-primary">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertCard({
  a,
  onMove,
  onAssign,
  onDispatch,
  onEscalate,
}: {
  a: {
    id: string;
    time: string;
    severity: string;
    category: string;
    title: string;
    location: string;
    assignedTo?: string;
    stage: Stage;
  };
  onMove: (id: string, s: Stage) => void;
  onAssign: (id: string, o: string) => void;
  onDispatch: (id: string) => void;
  onEscalate: (id: string) => void;
}) {
  const [assignOpen, setAssignOpen] = useState(false);
  return (
    <div
      className={`rounded-lg border border-border bg-surface-2/60 hover:border-primary/30 border-l-4 ${sevBorder[a.severity]} p-3`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${sevBadge[a.severity]}`}
        >
          {a.severity}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {a.time}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          {a.id}
        </span>
      </div>
      <div className="text-xs font-semibold leading-snug">{a.title}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        {a.location} · {a.category}
      </div>
      <div className="text-[10px] mt-1.5 flex items-center gap-1 text-muted-foreground">
        <Users className="size-2.5" />
        {a.assignedTo ?? "unassigned"}
      </div>

      {assignOpen && (
        <select
          autoFocus
          onBlur={() => setAssignOpen(false)}
          onChange={(e) => {
            onAssign(a.id, e.target.value);
            setAssignOpen(false);
          }}
          className="mt-2 w-full bg-background border border-border rounded text-[10px] py-1 px-1.5"
        >
          <option value="">Assign to…</option>
          {officers.map((o) => (
            <option key={o.id} value={`${o.rank.split(" ")[0]} ${o.name}`}>
              {o.rank} {o.name}
            </option>
          ))}
        </select>
      )}

      <div className="mt-2 grid grid-cols-2 gap-1">
        {a.stage === "new" && (
          <>
            <button
              onClick={() => onMove(a.id, "investigating")}
              className="px-2 py-1 rounded bg-primary text-primary-foreground text-[10px] font-mono uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="size-2.5" />
              Ack
            </button>
            <button
              onClick={() => onDispatch(a.id)}
              className="px-2 py-1 rounded border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center justify-center gap-1"
            >
              <Radio className="size-2.5" />
              Dispatch
            </button>
          </>
        )}
        {a.stage === "investigating" && (
          <>
            <button
              onClick={() => onMove(a.id, "resolved")}
              className="px-2 py-1 rounded bg-success text-primary-foreground text-[10px] font-mono uppercase tracking-widest hover:opacity-90 flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="size-2.5" />
              Resolve
            </button>
            <button
              onClick={() => onEscalate(a.id)}
              className="px-2 py-1 rounded border border-destructive/30 text-destructive text-[10px] font-mono uppercase tracking-widest hover:bg-destructive/10 flex items-center justify-center gap-1"
            >
              <TriangleAlert className="size-2.5" />
              Escalate
            </button>
          </>
        )}
        {a.stage === "resolved" && (
          <button
            onClick={() => onMove(a.id, "investigating")}
            className="col-span-2 px-2 py-1 rounded border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center justify-center gap-1"
          >
            <ArrowRight className="size-2.5" />
            Reopen
          </button>
        )}
        <button
          onClick={() => setAssignOpen((v) => !v)}
          className="col-span-2 px-2 py-1 rounded border border-border text-[10px] font-mono uppercase tracking-widest hover:bg-muted flex items-center justify-center gap-1"
        >
          <ShieldAlert className="size-2.5" />
          Assign officer
        </button>
      </div>
    </div>
  );
}
