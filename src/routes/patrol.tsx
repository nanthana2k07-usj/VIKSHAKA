import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { patrols, officers, cases, type Patrol, type Case } from "@/lib/mock-data";
import { Car, MapPin, Users, ShieldCheck, X, CheckCircle2, Fingerprint, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/patrol")({
  head: () => ({
    meta: [
      { title: "Patrol Management · VIKSHAKA" },
      { name: "description", content: "Manage patrol units, checkpoints, and beat officers in real-time." },
      { property: "og:title", content: "Patrol Management · VIKSHAKA" },
      { property: "og:description", content: "Deploy, track and reassign patrol units across zones." },
    ],
  }),
  component: PatrolPage,
});

const statusBg: Record<string,string> = {
  active: "bg-success/10 text-success border-success/30",
  responding: "bg-destructive/10 text-destructive border-destructive/30",
  en_route: "bg-warning/10 text-warning border-warning/30",
  standby: "bg-muted text-muted-foreground border-border",
};

interface Assignment {
  id: string;
  unit: string;
  caseId: string;
  caseTitle: string;
  officer: string;
  badge: string;
  otp: string;
  verifiedAt: string;
}

const STORE = "vk.patrol.assignments.v1";

function loadAssignments(): Assignment[] {
  try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
}

function PatrolPage() {
  const { session } = useSession();
  const allowed = can(session?.role, "action:dispatch");
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignFor, setAssignFor] = useState<Patrol | null>(null);

  useEffect(() => { setAssignments(loadAssignments()); }, []);

  const assignedByUnit = useMemo(() => {
    const m = new Map<string, Assignment>();
    for (const a of assignments) m.set(a.unit, a);
    return m;
  }, [assignments]);

  const commitAssignment = (a: Assignment) => {
    const next = [a, ...assignments.filter(x => x.unit !== a.unit)];
    setAssignments(next);
    try { localStorage.setItem(STORE, JSON.stringify(next)); } catch {}
  };

  const doAction = (label: string, unit: string) => {
    if (!allowed) { toast.error("Dispatch requires Officer clearance"); return; }
    toast.success(`${label} · ${unit}`);
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Field Operations</div>
        <h1 className="font-display text-3xl font-bold mt-1">Patrol Management</h1>
        <p className="text-sm text-muted-foreground mt-1">{patrols.length} units in field · {patrols.filter(p=>p.status==="responding").length} responding · {patrols.reduce((s,p)=>s+p.officers,0)} officers deployed · {assignments.length} verified assignments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {patrols.map(p => {
          const assigned = assignedByUnit.get(p.unit);
          return (
            <div key={p.id} className="rounded-xl border border-border bg-surface p-5 reveal">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Car className="size-5 text-primary"/>
                  </div>
                  <div>
                    <div className="font-display font-bold text-lg">{p.unit}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="size-3"/>{p.zone}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${statusBg[p.status]}`}>{p.status.replace("_"," ")}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="rounded-lg bg-surface-2 p-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Officers</div>
                  <div className="font-display text-lg font-bold flex items-center gap-1"><Users className="size-3.5"/>{p.officers}</div>
                </div>
                <div className="rounded-lg bg-surface-2 p-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Checkpoints</div>
                  <div className="font-display text-lg font-bold">{p.checkpoints}</div>
                </div>
                <div className="rounded-lg bg-surface-2 p-2">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Lead</div>
                  <div className="text-xs font-semibold truncate mt-1">{p.lead}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Route progress</span>
                  <span className="text-[10px] font-mono text-primary">{p.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${p.progress}%` }}/>
                </div>
              </div>

              {assigned ? (
                <div className="mt-4 rounded-lg border border-success/30 bg-success/5 p-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-success">
                    <ShieldCheck className="size-3.5" /> Verified assignment
                  </div>
                  <div className="mt-1 text-xs font-semibold truncate">{assigned.caseId} · {assigned.caseTitle}</div>
                  <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                    by {assigned.officer} · badge {assigned.badge} · OTP {assigned.otp} · {new Date(assigned.verifiedAt).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-border p-3 text-[11px] text-muted-foreground">
                  No case linked to this unit. Use verified assignment to link a case.
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => { if (!allowed) { toast.error("Dispatch requires Officer clearance"); return; } setAssignFor(p); }}
                  className="flex-1 min-w-[140px] py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="size-3.5" /> {assigned ? "Reassign case" : "Assign to case"}
                </button>
                <button onClick={() => doAction("Dispatch update sent to", p.unit)} className="flex-1 min-w-[120px] py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Dispatch update</button>
                <button onClick={() => doAction("Reassign initiated for", p.unit)} className="flex-1 min-w-[100px] py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Reassign unit</button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-surface reveal">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-bold">Officers on shift</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-2">
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3">Officer</th>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Cases resolved</th>
                <th className="px-4 py-3">Performance</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {officers.map(o => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{o.name}</td>
                  <td className="px-4 py-3 text-xs">{o.rank}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.badge}</td>
                  <td className="px-4 py-3 text-xs">{o.station}</td>
                  <td className="px-4 py-3 text-xs">{o.casesResolved}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${o.performance}%` }}/>
                      </div>
                      <span className="text-[10px] font-mono">{o.performance}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-mono uppercase px-2 py-1 rounded border ${statusBg[o.status] ?? "bg-muted text-muted-foreground border-border"}`}>{o.status.replace("_"," ")}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {assignFor && (
        <AssignModal
          patrol={assignFor}
          officerName={session?.name ?? "Duty Officer"}
          officerBadge={session?.badge ?? ""}
          onClose={() => setAssignFor(null)}
          onConfirm={(a) => { commitAssignment(a); setAssignFor(null); toast.success(`Case ${a.caseId} assigned to ${a.unit}`, { description: `Verified · OTP ${a.otp}` }); }}
        />
      )}
    </div>
  );
}

function AssignModal({ patrol, officerName, officerBadge, onClose, onConfirm }: {
  patrol: Patrol;
  officerName: string;
  officerBadge: string;
  onClose: () => void;
  onConfirm: (a: Assignment) => void;
}) {
  const openCases = useMemo(() => cases.filter(c => c.status !== "closed"), []);
  const [caseId, setCaseId] = useState<string>(openCases[0]?.id ?? "");
  const [badgeInput, setBadgeInput] = useState("");
  const [otp, setOtp] = useState("");
  const [issuedOtp] = useState(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [step, setStep] = useState<1 | 2>(1);
  const selected: Case | undefined = openCases.find(c => c.id === caseId);

  const badgeOk = officerBadge && badgeInput.trim().toUpperCase() === officerBadge.trim().toUpperCase();

  const proceed = () => {
    if (!selected) { toast.error("Pick a case"); return; }
    if (!badgeOk) { toast.error("Badge number does not match your session"); return; }
    setStep(2);
  };

  const confirm = () => {
    if (otp.trim() !== issuedOtp) { toast.error("Invalid OTP"); return; }
    if (!selected) return;
    onConfirm({
      id: `A-${Date.now()}`,
      unit: patrol.unit,
      caseId: selected.id,
      caseTitle: selected.title,
      officer: officerName,
      badge: officerBadge,
      otp: issuedOtp,
      verifiedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            <h3 className="font-display font-bold">Verified case assignment · {patrol.unit}</h3>
          </div>
          <button onClick={onClose} className="size-8 rounded-md hover:bg-muted flex items-center justify-center"><X className="size-4" /></button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest">
            <span className={`px-2 py-1 rounded border ${step === 1 ? "bg-primary text-primary-foreground border-primary" : "bg-success/10 text-success border-success/30"}`}>1 · Case & Badge</span>
            <span className="text-muted-foreground">→</span>
            <span className={`px-2 py-1 rounded border ${step === 2 ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"}`}>2 · OTP</span>
          </div>

          {step === 1 && (
            <>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Select case to assign</label>
                <select
                  value={caseId}
                  onChange={e => setCaseId(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-sm"
                >
                  {openCases.map(c => (
                    <option key={c.id} value={c.id}>{c.id} · {c.title} · {c.priority.toUpperCase()}</option>
                  ))}
                </select>
                {selected && (
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    FIR {selected.fir} · {selected.district}, {selected.state} · Officer of record: {selected.officer}
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Fingerprint className="size-3" /> Enter your badge to verify identity
                </label>
                <input
                  value={badgeInput}
                  onChange={e => setBadgeInput(e.target.value)}
                  placeholder={officerBadge || "e.g. KA-4412"}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-sm font-mono"
                />
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  Session badge: <span className="text-foreground">{officerBadge || "—"}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={onClose} className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Cancel</button>
                <button onClick={proceed} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90">Continue</button>
              </div>
            </>
          )}

          {step === 2 && selected && (
            <>
              <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-primary">
                  <KeyRound className="size-3" /> One-time verification code
                </div>
                <div className="mt-1 font-mono text-2xl font-bold tracking-[0.4em]">{issuedOtp}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">Dummy OTP shown for demo. In production this is delivered to the officer's registered device.</div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Enter OTP to sign assignment</label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="4-digit code"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-surface-2 text-lg font-mono tracking-[0.4em] text-center"
                />
              </div>

              <div className="rounded-lg bg-surface-2 p-3 text-[11px] space-y-0.5">
                <div><span className="text-muted-foreground">Unit:</span> <span className="font-semibold">{patrol.unit}</span> · {patrol.zone}</div>
                <div><span className="text-muted-foreground">Case:</span> <span className="font-semibold">{selected.id}</span> — {selected.title}</div>
                <div><span className="text-muted-foreground">Officer:</span> {officerName} · badge {officerBadge}</div>
              </div>

              <div className="flex justify-between gap-2 pt-2">
                <button onClick={() => setStep(1)} className="px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted">Back</button>
                <button onClick={confirm} className="px-4 py-2 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5" /> Confirm assignment
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
