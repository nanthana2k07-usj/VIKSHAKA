import { createFileRoute } from "@tanstack/react-router";
import { officers, type Officer } from "@/lib/mock-data";
import { db, type DbCase } from "@/lib/database";
import { useEffect, useMemo, useState } from "react";
import {
  Download,
  FileText,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
  X,
  Database,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { downloadCSV } from "@/lib/exports";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/cases")({
  head: () => ({
    meta: [
      { title: "Cases & Records · VIKSHAKA" },
      {
        name: "description",
        content: "Central case registry with real-time persistent synthetic database, FIRs, IPC sections, and AI intake.",
      },
      { property: "og:title", content: "Cases & Records · VIKSHAKA" },
      {
        property: "og:description",
        content: "Search, assign, and expand case records with FIR uploads and synthetic database persistence.",
      },
    ],
  }),
  component: CasesPage,
});

type CaseRecord = DbCase & {
  ipc?: string;
  assignedOfficerId?: string;
  assignmentNote?: string;
};

const priBg: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  medium: "bg-accent/10 text-accent border-accent/30",
  low: "bg-primary/10 text-primary border-primary/30",
};

const statBg: Record<string, string> = {
  open: "bg-warning/10 text-warning border-warning/30",
  investigating: "bg-primary/10 text-primary border-primary/30",
  resolved: "bg-success/10 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
};

function CasesPage() {
  const { session } = useSession();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [showNew, setShowNew] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  // Subscribe to real-time synthetic database updates
  useEffect(() => {
    const update = () => {
      const dbCases = db.getCases().map((c) => ({
        ...c,
        ipc: c.category.includes("Robbery") ? "IPC 392, 397" : c.category.includes("Cyber") ? "IT Act 66C, IPC 420" : "IPC 302, 120B",
      }));
      setCases(dbCases);
    };

    update();
    const unsubscribe = db.subscribe(update);
    return () => unsubscribe();
  }, []);

  const filtered = useMemo(() => {
    return cases.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.severity !== priority) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          c.id.toLowerCase().includes(s) ||
          c.title.toLowerCase().includes(s) ||
          c.category.toLowerCase().includes(s) ||
          c.district.toLowerCase().includes(s) ||
          c.assignedOfficer.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [cases, priority, q, status]);

  const selected = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? null,
    [cases, selectedCaseId],
  );

  const handleNewCaseSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const category = String(form.get("category") ?? "Armed Incident").trim();
    const district = String(form.get("district") ?? "Bengaluru South").trim();
    const summary = String(form.get("summary") ?? "").trim();
    const severity = String(form.get("severity") ?? "high") as any;

    const created = db.addCase({
      title,
      category,
      severity,
      status: "open",
      assignedOfficer: session?.name ? `Officer ${session.name}` : "Comm. Ravi Shankar (IPS)",
      district,
      state: "Karnataka",
      lat: 12.9716,
      lng: 77.5946,
      summary,
      evidenceCount: 1,
      suspects: ["Unknown Suspect"],
    });

    setShowNew(false);
    toast.success(`Synthetic Database Record Created: ${created.id}`, {
      description: "Record saved to real-time synthetic database store.",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-success/10 text-success border border-success/20 flex items-center gap-1">
              <Database className="size-3" /> Real-time Synthetic DB Connected
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">Cases & Real-Time Database Registry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {cases.length} persistent database records · {cases.filter((c) => c.status === "investigating").length} active investigations
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => db.resetToDefaults()}
            className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Reset Database
          </button>
          <button
            onClick={() => setShowNew(true)}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 shadow"
          >
            <Plus className="size-3.5" /> File New Record
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search synthetic database records by ID, title, officer, district..."
            className="w-full bg-surface-2 border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
          />
        </div>
        <Filter className="size-4 text-muted-foreground" />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs"
        >
          <option value="all">All statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3">Case Title & Summary</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Investigating Officer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className="hover:bg-muted/40 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-mono text-xs text-primary font-bold whitespace-nowrap">
                    {c.id}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-foreground">{c.title}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">
                      {c.summary}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{c.category}</td>
                  <td className="px-4 py-3 text-xs">
                    {c.district}
                    <div className="text-[10px] text-muted-foreground">{c.state}</div>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium">{c.assignedOfficer}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${statBg[c.status] || statBg.open}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${priBg[c.severity] || priBg.medium}`}>
                      {c.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Record Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleNewCaseSubmit}
            className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-primary font-bold">Synthetic DB Ingestion</span>
                <h3 className="font-display font-bold text-lg">Add Real-Time Incident Record</h3>
              </div>
              <button type="button" onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase text-muted-foreground">Title</label>
                <input name="title" required placeholder="Armed Heist at Indiranagar" className="w-full mt-1 bg-surface-2 border border-border rounded-lg p-2.5 text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground">Category</label>
                  <input name="category" required placeholder="Armed Robbery" className="w-full mt-1 bg-surface-2 border border-border rounded-lg p-2.5 text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-muted-foreground">Severity</label>
                  <select name="severity" className="w-full mt-1 bg-surface-2 border border-border rounded-lg p-2.5 text-sm">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-muted-foreground">Summary & Facts</label>
                <textarea name="summary" required rows={3} placeholder="Suspect fled on foot towards North Alley..." className="w-full mt-1 bg-surface-2 border border-border rounded-lg p-2.5 text-sm font-mono" />
              </div>
            </div>

            <button type="submit" className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-glow">
              <Database className="size-4" /> Save Record to Real-Time Database
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
