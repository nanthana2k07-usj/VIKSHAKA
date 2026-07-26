import React from "react";
import { Sparkles, Network, ArrowRight, ShieldAlert, Cpu, Eye, CheckCircle2, Car, DollarSign } from "lucide-react";
import { toast } from "sonner";
import type { AIAnalysisData } from "./AIAnalysisFloatingModal";

export interface AIInvestigationAlertItem {
  id: string;
  title: string;
  category: "Pattern Match" | "Facial Match" | "Financial Anomaly" | "ANPR Tracking";
  severity: "critical" | "high" | "medium";
  confidence: number;
  time: string;
  description: string;
  locations: string[];
  ipc: string;
  graphData: AIAnalysisData;
}

const ALERTS_DATA: AIInvestigationAlertItem[] = [
  {
    id: "AI-ALERT-101",
    title: "Cross-District Jewellery Heist Pattern Match",
    category: "Pattern Match",
    severity: "critical",
    confidence: 96.4,
    time: "4 mins ago",
    description: "Neural correlation algorithm matched MO, weapon signatures, and getaway timing across 3 recent cases in Jayanagar & Salt Lake.",
    locations: ["Bengaluru South", "Salt Lake Sector V"],
    ipc: "IPC 392, 397",
    graphData: {
      title: "AI Study: Cross-District Jewellery Heist Pattern",
      sourceType: "general",
      fileName: "SERIAL_HEIST_CORRELATION_MATRIX.pdf",
      confidenceScore: 96.4,
      threatLevel: "CRITICAL",
      summary: "AI multi-modal analysis matched weapon recoil vectors, entry technique, and vehicle exit timing with 96.4% statistical confidence.",
      nodes: [
        { id: "s1", label: "Vikram 'Blade' Singh", type: "suspect", detail: "Serial Heist Mastermind · IPC 392" },
        { id: "v1", label: "KA-05-BX-2214", type: "vehicle", detail: "Getaway White SUV" },
        { id: "l1", label: "Jayanagar Jewellery", type: "location", detail: "Target Location 1" },
        { id: "l2", label: "Salt Lake Sector V", type: "location", detail: "Target Location 2" },
        { id: "ipc1", label: "IPC 397", type: "ipc", detail: "Robbery with deadly weapon" },
      ],
      edges: [
        { from: "s1", to: "l1", label: "Heist Lead", weight: 3 },
        { from: "s1", to: "v1", label: "Escaped in", weight: 3 },
        { from: "v1", to: "l2", label: "Tracked to", weight: 2 },
        { from: "s1", to: "ipc1", label: "Statute", weight: 1 },
      ],
      timeline: [
        { time: "22:10 IST", event: "Alarm triggered at Jayanagar store.", location: "Bengaluru South" },
        { time: "22:18 IST", event: "ANPR CAM-44 captured getaway SUV.", location: "Outer Ring Road" },
      ],
      recommendations: [
        "Seal highway toll plazas along NH-44.",
        "Alert Sector V patrol units for immediate intercept.",
      ]
    }
  },
  {
    id: "AI-ALERT-102",
    title: "CCTV Facial Match: Wanted Gang Leader Spotted",
    category: "Facial Match",
    severity: "critical",
    confidence: 94.8,
    time: "12 mins ago",
    description: "CAM-118 at Karol Bagh Metro Station flagged facial biometric vector match for suspect Rahul 'Ghost' Sen.",
    locations: ["Karol Bagh, Delhi"],
    ipc: "IPC 302, 120B",
    graphData: {
      title: "AI Study: Facial Match Vector CAM-118",
      sourceType: "cctv",
      fileName: "CAM118_BIOMETRIC_VECTOR.mp4",
      confidenceScore: 94.8,
      threatLevel: "CRITICAL",
      summary: "Biometric distance analysis matched facial landmarks against Central Criminal Database within 0.04s.",
      nodes: [
        { id: "s2", label: "Rahul 'Ghost' Sen", type: "suspect", detail: "Wanted Homicide Suspect" },
        { id: "l3", label: "Karol Bagh Metro", type: "location", detail: "Spotted at Platform 2" },
        { id: "ipc2", label: "IPC 302", type: "ipc", detail: "Murder charge" },
      ],
      edges: [
        { from: "s2", to: "l3", label: "Spotted", weight: 3 },
        { from: "s2", to: "ipc2", label: "Wanted for", weight: 2 },
      ],
      timeline: [
        { time: "20:46 IST", event: "Facial match captured by CCTV CAM-118.", location: "Karol Bagh Metro" },
      ],
      recommendations: [
        "Dispatch Metro Security & Local PCR Van immediately.",
      ]
    }
  },
  {
    id: "AI-ALERT-103",
    title: "Illicit Crypto Mule Account Transfer Flagged",
    category: "Financial Anomaly",
    severity: "high",
    confidence: 91.2,
    time: "28 mins ago",
    description: "Automated Banking OSINT detector intercepted ₹42L rapid structuring transfer linked to shell syndicate.",
    locations: ["Kolkata Cyber Cell"],
    ipc: "IPC 420, IT Act 66D",
    graphData: {
      title: "AI Study: Shell Mule Financial Trace",
      sourceType: "bank",
      fileName: "CYBER_FINANCIAL_TRACE.csv",
      confidenceScore: 91.2,
      threatLevel: "HIGH",
      summary: "Rapid money layering identified across 4 non-resident accounts in under 12 minutes.",
      nodes: [
        { id: "a1", label: "Axis Mule 9948", type: "account", detail: "Mule Account" },
        { id: "a2", label: "HDFC Shell 1002", type: "account", detail: "Intermediate Account" },
        { id: "ipc3", label: "IT Act 66D", type: "ipc", detail: "Cyber Fraud" },
      ],
      edges: [
        { from: "a1", to: "a2", label: "Wire ₹42L", weight: 3 },
        { from: "a1", to: "ipc3", label: "Violated", weight: 1 },
      ],
      timeline: [
        { time: "20:18 IST", event: "Automated transaction alert triggered.", location: "Kolkata" },
      ],
      recommendations: [
        "Send Section 91 CrPC notice to bank manager for immediate debit freeze.",
      ]
    }
  }
];

interface AIInvestigationAlertsProps {
  onLaunchGraph: (data: AIAnalysisData) => void;
}

export const AIInvestigationAlerts: React.FC<AIInvestigationAlertsProps> = ({ onLaunchGraph }) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 space-y-4 reveal border-l-4 border-l-primary">
      <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Cpu className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-base font-bold">AI Autonomous Investigation Alerts</span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-primary text-primary-foreground">
                LIVE DETECTOR
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Real-time neural pattern recognition, facial vector correlation, and financial anomaly detection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
          <span className="size-2 rounded-full bg-success pulse-dot" />
          <span>3 Neural Models Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ALERTS_DATA.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl border bg-surface-2/70 hover:bg-surface-2 transition-all flex flex-col justify-between space-y-3 group ${
              item.severity === "critical" ? "border-destructive/40 hover:border-destructive" : "border-warning/30 hover:border-warning"
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-background border border-border text-muted-foreground font-bold">
                  {item.category}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">{item.time}</span>
              </div>

              <h4 className="font-display text-xs font-bold leading-snug group-hover:text-primary transition-colors">
                {item.title}
              </h4>

              <p className="text-[11px] text-muted-foreground leading-relaxed font-sans line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono pt-1">
                <span className="text-primary font-bold">AI Confidence: {item.confidence}%</span>
                <span className="text-muted-foreground">{item.ipc}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 flex items-center gap-2">
              <button
                onClick={() => onLaunchGraph(item.graphData)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-primary text-primary-foreground font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow hover:opacity-90 transition-opacity"
              >
                <Network className="size-3.5" /> AI Graph Study <ArrowRight className="size-3" />
              </button>
              <button
                onClick={() => toast.success(`Unit dispatched for ${item.title}`)}
                className="py-1.5 px-2.5 rounded-lg border border-border hover:bg-muted text-[11px] font-semibold text-foreground transition-colors"
                title="Dispatch Officer"
              >
                Dispatch
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
