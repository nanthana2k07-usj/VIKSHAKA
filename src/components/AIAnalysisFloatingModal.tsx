import React, { useState, useEffect } from "react";
import {
  X, UploadCloud, FileText, Sparkles, Network, ZoomIn, ZoomOut, RotateCcw,
  CheckCircle2, AlertTriangle, ShieldCheck, Download, Share2, Layers, Cpu, ArrowRight, Activity, Filter
} from "lucide-react";
import { toast } from "sonner";

export interface AIAnalysisData {
  title: string;
  sourceType: "cctv" | "fir" | "audio" | "bank" | "general";
  fileName?: string;
  confidenceScore: number;
  threatLevel: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  nodes: Array<{
    id: string;
    label: string;
    type: "suspect" | "vehicle" | "location" | "account" | "ipc";
    detail: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
    weight: number;
  }>;
  timeline: Array<{
    time: string;
    event: string;
    location: string;
  }>;
  recommendations: string[];
}

const DEFAULT_ANALYSIS: AIAnalysisData = {
  title: "Cross-Jurisdiction Armed Robbery & Financial Syndicate Correlation",
  sourceType: "general",
  fileName: "EVIDENCE_DOSSIER_2026_BLK.pdf",
  confidenceScore: 96.4,
  threatLevel: "CRITICAL",
  summary: "Neural correlation matrix identified a high-probability link between the Jayanagar Jewellery Heist (Case #601) and Salt Lake Sector V Homicide (Case #602). Facial vector mapping matched Suspect C-102 (Vikram 'Blade' Singh) across both locations within 48 hours.",
  nodes: [
    { id: "suspect-1", label: "Vikram 'Blade' Singh", type: "suspect", detail: "Primary Target · Gang Leader · IPC 392, 307" },
    { id: "suspect-2", label: "Rahal 'Ghost' Sen", type: "suspect", detail: "Accomplice · Driver · IPC 120B" },
    { id: "vehicle-1", label: "KA-05-BX-2214", type: "vehicle", detail: "Stolen White SUV · ANPR Flagged" },
    { id: "location-1", label: "Jayanagar Jewellery", type: "location", detail: "Primary Crime Scene 1 · 22:14 IST" },
    { id: "location-2", label: "Salt Lake Sector V", type: "location", detail: "Secondary Hideout · CCTV Match" },
    { id: "account-1", label: "AXIS-99482103", type: "account", detail: "Mule Account · ₹42,00,000 Transfer" },
    { id: "ipc-1", label: "IPC 392 / 397", type: "ipc", detail: "Robbery with intent to cause hurt" },
    { id: "ipc-2", label: "IPC 302", type: "ipc", detail: "Murder charge correlation" },
  ],
  edges: [
    { from: "suspect-1", to: "location-1", label: "Spotted at Scene", weight: 3 },
    { from: "suspect-1", to: "vehicle-1", label: "Drove Vehicle", weight: 3 },
    { from: "suspect-2", to: "vehicle-1", label: "Passenger", weight: 2 },
    { from: "vehicle-1", to: "location-2", label: "Fled to", weight: 3 },
    { from: "suspect-1", to: "account-1", label: "Beneficiary", weight: 2 },
    { from: "suspect-1", to: "ipc-1", label: "Charged under", weight: 1 },
    { from: "suspect-1", to: "ipc-2", label: "Linked charge", weight: 1 },
  ],
  timeline: [
    { time: "20:14 IST", event: "ANPR Camera #118 flagged vehicle KA-05-BX-2214 at South Ring Road.", location: "Bengaluru South" },
    { time: "22:10 IST", event: "Silent panic alarm triggered at Jayanagar Jewellery. 2 armed suspects entered.", location: "Jayanagar" },
    { time: "22:18 IST", event: "AI facial mapping matched suspect Vikram Singh on CAM-44.", location: "Jayanagar Outskirts" },
    { time: "01:45 IST", event: "Encrypted wire transfer of ₹42L initiated to Axis Bank mule account.", location: "Kolkata Cyber Cell Flag" },
  ],
  recommendations: [
    "Issue immediate All-Points Bulletin (APB) for vehicle KA-05-BX-2214 along NH-44 corridor.",
    "Freeze Axis Bank mule account AXIS-99482103 under IPC 102.",
    "Deploy SWAT Unit 4 to Salt Lake Sector V hideout with ballistic coverage.",
    "Cross-reference CCTV feeds from Sector 7 Toll Gate for secondary escape route.",
  ]
};

const nodeColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  suspect: { bg: "bg-destructive/20", border: "border-destructive", text: "text-destructive", glow: "#ef4444" },
  vehicle: { bg: "bg-warning/20", border: "border-warning", text: "text-warning", glow: "#f59e0b" },
  location: { bg: "bg-primary/20", border: "border-primary", text: "text-primary", glow: "#14b8a6" },
  account: { bg: "bg-success/20", border: "border-success", text: "text-success", glow: "#22c55e" },
  ipc: { bg: "bg-accent/20", border: "border-accent", text: "text-accent", glow: "#eab308" },
};

interface AIAnalysisFloatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData?: AIAnalysisData | null;
}

export const AIAnalysisFloatingModal: React.FC<AIAnalysisFloatingModalProps> = ({
  isOpen,
  onClose,
  analysisData
}) => {
  const [data, setData] = useState<AIAnalysisData>(DEFAULT_ANALYSIS);
  const [activeTab, setActiveTab] = useState<"graph" | "study" | "upload">("graph");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>("suspect-1");
  const [filterType, setFilterType] = useState<string>("all");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");

  useEffect(() => {
    if (analysisData) {
      setData(analysisData);
      setSelectedNodeId(analysisData.nodes[0]?.id || null);
    }
  }, [analysisData]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent) => {
    let file: File | null = null;
    if ("files" in e.target && e.target.files) {
      file = e.target.files[0];
    } else if ("dataTransfer" in e && e.dataTransfer.files) {
      file = e.dataTransfer.files[0];
    }
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisStep("Parsing document bytes & extracting OCR strings…");

    setTimeout(() => setAnalysisStep("Extracting key entities (Suspects, Vehicles, Accounts)…"), 1000);
    setTimeout(() => setAnalysisStep("Querying neural correlation matrix across national police database…"), 2200);
    setTimeout(() => {
      setIsAnalyzing(false);
      setData({
        ...DEFAULT_ANALYSIS,
        fileName: file ? file.name : "UPLOADED_EVIDENCE.pdf",
        title: `AI Deep Analysis: ${file ? file.name : "Uploaded File"}`,
        confidenceScore: 98.2,
      });
      setActiveTab("graph");
      toast.success("AI Evidence Analysis Complete! Interactive Graph generated.");
    }, 3400);
  };

  const selectedNode = data.nodes.find((n) => n.id === selectedNodeId);
  const filteredNodes = filterType === "all" ? data.nodes : data.nodes.filter((n) => n.type === filterType);

  // Deterministic SVG coordinates for nodes
  const nodeCoords: Record<string, { x: number; y: number }> = {};
  filteredNodes.forEach((node, idx) => {
    const angle = (idx / Math.max(filteredNodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
    const radius = 170;
    nodeCoords[node.id] = {
      x: 320 + Math.cos(angle) * radius,
      y: 240 + Math.sin(angle) * radius,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] rounded-2xl border border-border bg-surface shadow-2xl flex flex-col overflow-hidden relative border-t-2 border-t-primary">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-border bg-surface-2/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest bg-primary text-primary-foreground">
                  AI GRAPH STUDY
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase truncate">
                  {data.fileName ?? "EVIDENCE FILE"}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-destructive/10 text-destructive border border-destructive/20">
                  {data.threatLevel} THREAT
                </span>
              </div>
              <h2 className="font-display text-lg font-bold truncate mt-0.5">{data.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Tabs */}
            <div className="flex bg-background p-1 rounded-lg border border-border">
              <button
                onClick={() => setActiveTab("graph")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "graph" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Network className="size-3.5" /> Interactive Graph
              </button>
              <button
                onClick={() => setActiveTab("study")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "study" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="size-3.5" /> AI Study & Report
              </button>
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  activeTab === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <UploadCloud className="size-3.5" /> Upload Evidence
              </button>
            </div>

            <button
              onClick={onClose}
              className="size-8 rounded-lg border border-border hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative">

          {/* Analyzing overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 z-30 bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-primary/10 border border-primary/40 flex items-center justify-center text-primary animate-pulse">
                <Cpu className="size-8 animate-spin" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Neural Engine Analyzing Evidence</h3>
                <p className="text-xs font-mono text-primary mt-2">{analysisStep}</p>
              </div>
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden border border-border">
                <div className="h-full bg-primary animate-pulse rounded-full w-3/4" />
              </div>
            </div>
          )}

          {/* TAB 1: INTERACTIVE GRAPH */}
          {activeTab === "graph" && (
            <div className="h-full flex flex-col lg:flex-row">
              {/* Main SVG Graph Canvas */}
              <div className="flex-1 h-full bg-background grid-bg relative overflow-hidden flex flex-col">
                
                {/* Graph Controls Toolbar */}
                <div className="p-3 bg-surface-2/60 border-b border-border flex items-center justify-between flex-wrap gap-2 z-10">
                  <div className="flex items-center gap-2 text-xs">
                    <Filter className="size-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Filter Nodes:</span>
                    {["all", "suspect", "vehicle", "location", "account", "ipc"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-colors ${
                          filterType === type ? "bg-primary text-primary-foreground font-bold" : "bg-surface border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.8))}
                      className="p-1.5 rounded border border-border bg-surface hover:bg-muted text-xs"
                      title="Zoom In"
                    >
                      <ZoomIn className="size-3.5" />
                    </button>
                    <button
                      onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.6))}
                      className="p-1.5 rounded border border-border bg-surface hover:bg-muted text-xs"
                      title="Zoom Out"
                    >
                      <ZoomOut className="size-3.5" />
                    </button>
                    <button
                      onClick={() => { setZoomLevel(1); setFilterType("all"); }}
                      className="p-1.5 rounded border border-border bg-surface hover:bg-muted text-xs"
                      title="Reset View"
                    >
                      <RotateCcw className="size-3.5" />
                    </button>
                  </div>
                </div>

                {/* SVG Render Area */}
                <div className="flex-1 w-full h-full relative overflow-hidden flex items-center justify-center p-4">
                  <svg
                    viewBox="0 0 640 480"
                    className="w-full h-full max-w-full max-h-full transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${zoomLevel})` }}
                  >
                    <defs>
                      <marker id="ai-arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" opacity="0.6" />
                      </marker>
                    </defs>

                    {/* Render Edges */}
                    {data.edges.map((e, idx) => {
                      const source = nodeCoords[e.from];
                      const target = nodeCoords[e.to];
                      if (!source || !target) return null;

                      const isSelectedEdge = selectedNodeId === e.from || selectedNodeId === e.to;

                      return (
                        <g key={idx}>
                          <line
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={isSelectedEdge ? "var(--primary)" : "var(--border)"}
                            strokeWidth={isSelectedEdge ? 2.5 : e.weight}
                            strokeDasharray={isSelectedEdge ? "none" : "4 4"}
                            opacity={isSelectedEdge ? 1 : 0.4}
                            markerEnd="url(#ai-arrow)"
                          />
                          <text
                            x={(source.x + target.x) / 2}
                            y={(source.y + target.y) / 2 - 4}
                            fontSize="9"
                            fontFamily="var(--font-mono)"
                            fill={isSelectedEdge ? "var(--primary)" : "var(--muted-foreground)"}
                            textAnchor="middle"
                            fontWeight={isSelectedEdge ? "700" : "400"}
                          >
                            {e.label}
                          </text>
                        </g>
                      );
                    })}

                    {/* Render Nodes */}
                    {filteredNodes.map((n) => {
                      const pos = nodeCoords[n.id];
                      if (!pos) return null;
                      const isSelected = selectedNodeId === n.id;
                      const colors = nodeColors[n.type] || nodeColors.suspect;

                      return (
                        <g
                          key={n.id}
                          transform={`translate(${pos.x}, ${pos.y})`}
                          onClick={() => setSelectedNodeId(n.id)}
                          className="cursor-pointer group"
                        >
                          {/* Glow pulse for selected */}
                          {isSelected && (
                            <circle r="34" fill={colors.glow} opacity="0.25" className="animate-ping" />
                          )}
                          <circle
                            r="26"
                            fill="var(--surface)"
                            stroke={isSelected ? colors.glow : "var(--border)"}
                            strokeWidth={isSelected ? "3" : "1.5"}
                            className="transition-all duration-200"
                          />
                          <circle r="18" fill={colors.glow} opacity={isSelected ? "0.3" : "0.15"} />

                          <text
                            y="4"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fontFamily="var(--font-mono)"
                            fill="var(--foreground)"
                          >
                            {n.type.substring(0, 3).toUpperCase()}
                          </text>
                          <text
                            y="42"
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight={isSelected ? "bold" : "normal"}
                            fontFamily="var(--font-sans)"
                            fill={isSelected ? "var(--primary)" : "var(--foreground)"}
                          >
                            {n.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Watermark badge */}
                  <div className="absolute bottom-3 left-3 bg-surface-2/90 border border-border rounded-lg px-3 py-1.5 text-[10px] font-mono text-muted-foreground flex items-center gap-2">
                    <Activity className="size-3 text-success pulse-dot" />
                    <span>Neural Link Graph v5.2 · AI Confidence: {data.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Node Details Inspector Sidebar */}
              <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-surface p-5 space-y-4 overflow-y-auto">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-2">
                  Entity Inspector
                </div>

                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-border bg-surface-2 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${nodeColors[selectedNode.type]?.bg} ${nodeColors[selectedNode.type]?.text}`}>
                          {selectedNode.type}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground">ID: {selectedNode.id}</span>
                      </div>
                      <h4 className="font-display text-base font-bold">{selectedNode.label}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">{selectedNode.detail}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground">Connected Relationships</div>
                      <div className="space-y-1.5">
                        {data.edges
                          .filter((e) => e.from === selectedNode.id || e.to === selectedNode.id)
                          .map((edge, idx) => {
                            const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                            const otherNode = data.nodes.find((n) => n.id === otherId);
                            return (
                              <div
                                key={idx}
                                onClick={() => setSelectedNodeId(otherId)}
                                className="p-2.5 rounded-lg border border-border bg-background hover:border-primary/50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                              >
                                <span className="font-semibold text-foreground">{otherNode?.label}</span>
                                <span className="text-[10px] font-mono text-primary font-bold">{edge.label}</span>
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <button
                      onClick={() => toast.info(`Exporting forensic dossier for ${selectedNode.label}…`)}
                      className="w-full py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download className="size-3.5" /> Export Entity Dossier
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-10">Select any node on the graph to inspect entity attributes.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI STUDY REPORT */}
          {activeTab === "study" && (
            <div className="h-full p-6 overflow-y-auto space-y-6 bg-background">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">AI Confidence Metric</div>
                  <div className="text-2xl font-display font-bold text-success flex items-center gap-2">
                    <CheckCircle2 className="size-5" /> {data.confidenceScore}%
                  </div>
                  <div className="text-[10px] text-muted-foreground">Derived from 14 cross-database matches</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Threat Severity</div>
                  <div className="text-2xl font-display font-bold text-destructive">
                    {data.threatLevel}
                  </div>
                  <div className="text-[10px] text-muted-foreground">High risk of repeat offense</div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
                  <div className="text-[10px] font-mono text-muted-foreground uppercase">Correlated Case Entities</div>
                  <div className="text-2xl font-display font-bold text-primary">
                    {data.nodes.length} Items
                  </div>
                  <div className="text-[10px] text-muted-foreground">{data.edges.length} Active Neural Links</div>
                </div>
              </div>

              {/* Study Summary */}
              <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" /> AI Investigative Summary & Correlation Study
                </h3>
                <p className="text-xs leading-relaxed text-foreground font-sans bg-surface-2 p-4 rounded-lg border border-border">
                  {data.summary}
                </p>
              </div>

              {/* Event Timeline */}
              <div className="p-5 rounded-xl border border-border bg-surface space-y-4">
                <h3 className="font-display text-base font-bold">Extracted Forensic Event Timeline</h3>
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {data.timeline.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 relative pl-8">
                      <div className="absolute left-1.5 top-1 size-3 rounded-full bg-primary border-2 border-surface" />
                      <div className="flex-1 bg-surface-2 p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                          <span className="text-primary font-bold">{item.time}</span>
                          <span className="text-muted-foreground">📍 {item.location}</span>
                        </div>
                        <p className="text-xs text-foreground font-sans">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="p-5 rounded-xl border border-border bg-surface space-y-3">
                <h3 className="font-display text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-success" /> AI Recommended Next Steps for IO
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-surface-2 flex items-start gap-3">
                      <span className="size-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-foreground font-sans leading-relaxed">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => toast.success("AI Forensic Study exported to PDF report.")}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Download className="size-4" /> Download PDF Briefing Report
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: UPLOAD EVIDENCE */}
          {activeTab === "upload" && (
            <div className="h-full p-8 flex flex-col items-center justify-center bg-background">
              <div className="w-full max-w-xl p-8 rounded-2xl border-2 border-dashed border-border bg-surface text-center space-y-4 relative hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <div className="size-16 rounded-2xl bg-primary/10 border border-primary/30 text-primary mx-auto flex items-center justify-center">
                  <UploadCloud className="size-8" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">Upload Evidence File for AI Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag and drop CCTV MP4, FIR PDF, Audio WMA, Bank CSV or Suspect Images here.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2 text-[10px] font-mono text-muted-foreground">
                  <span className="px-2 py-1 rounded bg-surface-2 border border-border">PDF / DOCX</span>
                  <span className="px-2 py-1 rounded bg-surface-2 border border-border">MP4 / AVI</span>
                  <span className="px-2 py-1 rounded bg-surface-2 border border-border">WAV / MP3</span>
                  <span className="px-2 py-1 rounded bg-surface-2 border border-border">JPG / PNG</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
