import React, { useState, useEffect } from "react";
import { aiIntelligence, type StructuredAIReport, type OSINTThreatItem } from "@/services/aiIntelligence";
import { Mic, MicOff, Sparkles, Globe, AlertTriangle, ShieldCheck, Cpu, ArrowRight, RefreshCw, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const AIIntelligenceModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<"dictation" | "osint">("dictation");

  // Dictation state
  const [isDictating, setIsDictating] = useState(false);
  const [dictationText, setDictationText] = useState(
    "Patrol unit 12 reporting from MG Road junction. Suspect fled on foot wearing black hoodie carrying concealed firearm. Abandoned vehicle KA-01-MJ-8821 near north alley."
  );
  const [generatedReport, setGeneratedReport] = useState<StructuredAIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // OSINT state
  const [osintItems, setOsintItems] = useState<OSINTThreatItem[]>([]);
  const [loadingOsint, setLoadingOsint] = useState(false);

  useEffect(() => {
    loadOsint();
  }, []);

  const loadOsint = async () => {
    setLoadingOsint(true);
    try {
      const items = await aiIntelligence.fetchOSINTThreats();
      setOsintItems(items);
    } catch (e) {
      toast.error("Failed to update OSINT feeds");
    } finally {
      setLoadingOsint(false);
    }
  };

  const handleMicToggle = () => {
    if (!isDictating) {
      setIsDictating(true);
      toast.info("Voice dictation active. Speak field notes now...");
    } else {
      setIsDictating(false);
      toast.success("Voice dictation stopped.");
    }
  };

  const handleGenerateReport = async () => {
    if (!dictationText.trim()) {
      toast.error("Please enter or dictate field notes first.");
      return;
    }
    setIsGenerating(true);
    try {
      const report = await aiIntelligence.generateStructuredReport({
        dictationText,
        incidentType: "Armed Incident & Suspect Pursuit",
        location: "MG Road Junction",
      });
      setGeneratedReport(report);
      toast.success("Structured report generated with NLP!");
    } catch (e) {
      toast.error("Report generation failed.");
    } fontally: {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-6">
      {/* Module Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-accent/10 text-accent border border-accent/20 flex items-center gap-1">
              <Cpu className="size-3" /> Core AI Intelligence Engine
            </span>
            <span className="text-[10px] font-mono text-muted-foreground uppercase">NLP 5.0 + OSINT Crawler</span>
          </div>
          <h2 className="font-display text-2xl font-bold mt-1">Autonomous AI & OSINT Intelligence Hub</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Voice-to-text legal report generation, mass open-source threat scanning, and automated cross-jurisdiction entity correlation.
          </p>
        </div>

        {/* Sub-tab selection */}
        <div className="flex gap-2 bg-surface-2 p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveSubTab("dictation")}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === "dictation" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Mic className="size-4" /> AI Voice Dictation & Reports
          </button>
          <button
            onClick={() => setActiveSubTab("osint")}
            className={`px-4 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === "osint" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="size-4" /> OSINT Threat Intelligence ({osintItems.length})
          </button>
        </div>
      </div>

      {/* Dictation Tab */}
      {activeSubTab === "dictation" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Field Input / Voice Mic */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Spoken Field Notes / Raw Input</label>
              <button
                onClick={handleMicToggle}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                  isDictating ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-surface-2 hover:bg-muted text-foreground border border-border"
                }`}
              >
                {isDictating ? <MicOff className="size-4" /> : <Mic className="size-4 text-primary" />}
                <span>{isDictating ? "Listening..." : "Dictate Field Notes"}</span>
              </button>
            </div>

            <textarea
              value={dictationText}
              onChange={(e) => setDictationText(e.target.value)}
              rows={6}
              placeholder="Speak or type field observations here..."
              className="w-full bg-surface-2 border border-border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-primary/50 leading-relaxed"
            />

            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="size-4 animate-spin" /> Structuring via NLP Engine...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" /> Generate Structured Legal Report <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          {/* AI Structured Output */}
          <div className="space-y-4">
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">NLP Structuring Result</label>
            {generatedReport ? (
              <div className="rounded-xl border border-primary/30 bg-surface-2 p-5 space-y-4 reveal">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-success font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3" /> Legal Standard Verified
                    </span>
                    <h3 className="font-display font-bold text-base mt-0.5">{generatedReport.title}</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 rounded bg-primary/10 text-primary font-bold">
                    Score: {generatedReport.confidenceScore}%
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Executive Summary</div>
                  <p className="text-xs text-foreground bg-background/50 p-3 rounded-lg border border-border">{generatedReport.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-background/40 p-3 rounded-lg border border-border">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Extracted Suspects</div>
                    <div className="text-xs font-semibold mt-1 text-destructive">{generatedReport.keyEntities.suspects.join(", ")}</div>
                  </div>
                  <div className="bg-background/40 p-3 rounded-lg border border-border">
                    <div className="text-[10px] font-mono text-muted-foreground uppercase">Extracted Vehicles</div>
                    <div className="text-xs font-semibold mt-1 font-mono text-accent">{generatedReport.keyEntities.vehicles.join(", ")}</div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Recommended Tactical Actions</div>
                  <ul className="text-xs space-y-1">
                    {generatedReport.recommendedActions.map((act, i) => (
                      <li key={i} className="flex items-center gap-2 text-foreground">
                        <span className="size-1.5 rounded-full bg-primary" /> {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-64 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center p-6 space-y-2">
                <Sparkles className="size-8 text-muted-foreground" />
                <div className="text-sm font-semibold">Structured Report Preview</div>
                <div className="text-xs text-muted-foreground">Click "Generate Structured Legal Report" to transform raw notes into court-compliant documentation.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* OSINT Tab */}
      {activeSubTab === "osint" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Live OSINT Social Media & DarkWeb Ingestion Stream
            </span>
            <button
              onClick={loadOsint}
              disabled={loadingOsint}
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center gap-2"
            >
              <RefreshCw className={`size-3.5 ${loadingOsint ? "animate-spin" : ""}`} /> Refresh Ingestion Stream
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {osintItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-4 space-y-3 bg-surface-2 transition-all ${
                  item.sentiment === "critical" ? "border-destructive/50 bg-destructive/5" : "border-warning/40 bg-warning/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-background border border-border font-bold">
                    {item.source}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    item.sentiment === "critical" ? "bg-destructive text-white" : "bg-warning text-black"
                  }`}>
                    THREAT SCORE: {item.threatScore}/100
                  </span>
                </div>

                <div className="text-xs font-mono font-bold text-foreground">{item.author}</div>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">{item.content}</p>

                {item.geolocation && (
                  <div className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-1 rounded border border-accent/20">
                    📍 {item.geolocation.area}
                  </div>
                )}

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.keywords.map((kw, i) => (
                    <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
