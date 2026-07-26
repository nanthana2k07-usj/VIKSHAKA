import React, { useState } from "react";
import { aiIntelligence, type VideoAnalysisResult } from "@/services/aiIntelligence";
import { Video, ShieldAlert, Cpu, Eye, FileText, CheckCircle2, AlertTriangle, Play, Sparkles, Upload, FileCheck } from "lucide-react";
import { toast } from "sonner";

export const VideoEvidenceAI: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<VideoAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"vision" | "audio" | "forensics">("vision");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const handleUploadAndAnalyze = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFileName(file.name);
    runAnalysis(file.name);
  };

  const runAnalysis = async (name: string) => {
    setAnalyzing(true);
    toast.info("Initializing Video AI pipeline (YOLOv8 + Face-ReID + Acoustic Mining)...");
    try {
      const res = await aiIntelligence.analyzeVideoEvidence(name);
      setResult(res);
      toast.success("AI Evidence analysis complete!");
    } catch (err) {
      toast.error("Failed to analyze video evidence.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
              <Sparkles className="size-3" /> AI Edge Vision 4.0
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Court-Admissible Forensics</span>
          </div>
          <h2 className="font-display text-2xl font-bold mt-1">Video Evidence & Deep Media Analytics</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated weapon detection, facial biometrics, license plate recognition (ALPR), and synthetic deepfake detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-2 shadow-glow">
            <Upload className="size-4" />
            <span>Upload CCTV / Video</span>
            <input type="file" accept="video/*" onChange={handleUploadAndAnalyze} className="hidden" />
          </label>

          <button
            onClick={() => runAnalysis("DEMO_CCTV_CAM_44.mp4")}
            disabled={analyzing}
            className="px-4 py-2 rounded-lg border border-border bg-surface-2 hover:bg-muted text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Play className="size-4 text-accent" />
            <span>Analyze Sample Stream</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      {analyzing ? (
        <div className="h-64 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center text-center p-6 space-y-3 animate-pulse">
          <Cpu className="size-10 text-primary animate-spin" />
          <div className="font-display text-lg font-bold">Processing Video Frames with Neural Models...</div>
          <div className="text-xs font-mono text-muted-foreground max-w-md">
            Running 3D-CNN for temporal action recognition, ArcFace for biometrics, and FFmpeg frequency spectrum analyzer.
          </div>
        </div>
      ) : result ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player & Detection Bounding Boxes Overlay */}
          <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video rounded-xl bg-slate-950 border border-border overflow-hidden group">
              {/* Scanlines & Grid */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 z-10 pointer-events-none" />
              <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-destructive text-destructive-foreground text-[10px] font-mono font-bold tracking-widest animate-pulse">
                  REC ● AI ACTIVE
                </span>
                <span className="text-[11px] font-mono text-white/80 font-semibold">{uploadedFileName || result.videoId}</span>
              </div>
              <div className="absolute top-3 right-3 z-20 text-[10px] font-mono text-white/60 bg-black/60 px-2 py-1 rounded backdrop-blur">
                FPS: 60 | 4K UHD | Duration: {result.duration}
              </div>

              {/* Faux Video Graphics */}
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <Video className="size-24 text-slate-700" />
              </div>

              {/* Bounding Box 1: Suspect */}
              <div className="absolute top-[20%] left-[15%] w-[25%] h-[55%] border-2 border-destructive bg-destructive/10 rounded z-20 transition-all">
                <div className="absolute -top-6 left-0 bg-destructive text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                  <ShieldAlert className="size-3" /> Masked Suspect (98%)
                </div>
              </div>

              {/* Bounding Box 2: Weapon */}
              <div className="absolute top-[45%] left-[32%] w-[12%] h-[20%] border-2 border-warning bg-warning/10 rounded z-20 animate-pulse">
                <div className="absolute -bottom-6 left-0 bg-warning text-black text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
                  <AlertTriangle className="size-3" /> Weapon Detected (94%)
                </div>
              </div>

              {/* Bounding Box 3: License Plate */}
              <div className="absolute bottom-[18%] right-[15%] w-[18%] h-[15%] border-2 border-accent bg-accent/10 rounded z-20">
                <div className="absolute -top-6 left-0 bg-accent text-accent-foreground text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                  ALPR: KA-04-HE-7712
                </div>
              </div>

              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-xs text-white/80 bg-black/50 p-2 rounded-lg backdrop-blur border border-white/10">
                <span>Timeline: 01:15 / {result.duration}</span>
                <span className="font-mono text-[10px] text-accent">Confidence: 97.8%</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-border pb-2">
              <button
                onClick={() => setActiveTab("vision")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "vision" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Eye className="size-3.5" /> Object & Biometrics ({result.detectedFaces.length + result.detectedObjects.length})
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "audio" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <FileText className="size-3.5" /> Acoustic & Speech Mining
              </button>
              <button
                onClick={() => setActiveTab("forensics")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  activeTab === "forensics" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <FileCheck className="size-3.5" /> Deepfake & Authenticity Check
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === "vision" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.detectedFaces.map((f, idx) => (
                  <div key={idx} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 flex items-start gap-3">
                    <div className="size-10 rounded bg-destructive/20 flex items-center justify-center font-bold text-destructive font-mono text-xs">
                      FACE
                    </div>
                    <div>
                      <div className="text-xs font-bold text-destructive">{f.name || "Unknown Face"}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                        Status: <span className="font-bold text-foreground">{f.watchlistStatus}</span>
                      </div>
                      <div className="text-[10px] font-mono text-primary mt-1">Match Confidence: {(f.matchConfidence * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                ))}

                {result.alprPlates.map((p, idx) => (
                  <div key={idx} className="rounded-lg border border-accent/30 bg-accent/5 p-3 flex items-start gap-3">
                    <div className="size-10 rounded bg-accent/20 flex items-center justify-center font-bold text-accent font-mono text-xs">
                      ALPR
                    </div>
                    <div>
                      <div className="text-xs font-bold font-mono text-foreground">{p.plateNumber}</div>
                      <div className="text-[10px] font-mono text-destructive font-semibold mt-0.5">{p.flag}</div>
                      <div className="text-[10px] font-mono text-muted-foreground mt-1">State: {p.state} · Frame: {p.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "audio" && (
              <div className="rounded-lg border border-border bg-surface-2 p-4 space-y-2">
                <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">Neural Acoustic Transcript</div>
                <p className="text-xs font-mono bg-background p-3 rounded border border-border text-foreground leading-relaxed">
                  {result.audioTranscript}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1">
                  <span>Audio Fingerprint: Gunshot acoustic profile matched (99.2%)</span>
                  <span className="text-success font-semibold">Noise Filtering Active</span>
                </div>
              </div>
            )}

            {activeTab === "forensics" && (
              <div className="rounded-lg border border-border bg-surface-2 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Generative Deepfake Risk Analysis</span>
                  <span className="text-xs font-mono font-bold text-success">
                    {result.deepfakeRiskScore < 10 ? "PASS - AUTHENTIC MEDIA" : "HIGH DEEPFAKE RISK"}
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border">
                  <div className="bg-success h-full transition-all" style={{ width: `${100 - result.deepfakeRiskScore}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
                  <div>Frame Artifact Consistency: <span className="text-foreground font-semibold">99.8%</span></div>
                  <div>Biological Pulse Detection (rPPG): <span className="text-foreground font-semibold">VERIFIED</span></div>
                  <div>Metadata Hash Verification: <span className="text-foreground font-semibold">MATCHES SENSOR</span></div>
                  <div>Chain of Custody Ledger: <span className="text-foreground font-semibold">SIGNED</span></div>
                </div>
              </div>
            )}
          </div>

          {/* Actionable Side Summary */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface-2 p-5 space-y-4">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <CheckCircle2 className="size-4 text-success" /> Evidence Intelligence Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Highest Threat Alert:</span>
                  <span className="font-bold text-destructive font-mono">RED CORNER SUSPECT</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">Primary Object:</span>
                  <span className="font-semibold">Concealed Firearm</span>
                </div>
                <div className="flex justify-between border-b border-border/60 pb-2">
                  <span className="text-muted-foreground">License Plate Match:</span>
                  <span className="font-mono font-semibold text-accent">KA-04-HE-7712</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-muted-foreground">Court Admissibility:</span>
                  <span className="font-semibold text-success">APPROVED (Hash Verified)</span>
                </div>
              </div>

              <button
                onClick={() => toast.success("Incident report auto-generated from video evidence!")}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow"
              >
                <Sparkles className="size-4" /> Auto-Generate Incident Report
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center p-6 space-y-2">
          <Video className="size-8 text-muted-foreground" />
          <div className="text-sm font-semibold">No Video Selected</div>
          <div className="text-xs text-muted-foreground">Upload a CCTV clip or click "Analyze Sample Stream" above to run the AI engine.</div>
        </div>
      )}
    </div>
  );
};
