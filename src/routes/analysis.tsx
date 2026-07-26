import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { trend7d, crimeMix, cases, hotspots } from "@/lib/mock-data";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, RadialBarChart, RadialBar } from "recharts";
import { Brain, TrendingUp, AlertCircle, Cpu, Video, BarChart3 } from "lucide-react";
import { VideoEvidenceAI } from "@/components/VideoEvidenceAI";
import { AIIntelligenceModule } from "@/components/AIIntelligenceModule";

export const Route = createFileRoute("/analysis")({
  head: () => ({
    meta: [
      { title: "AI Crime Analysis & Forensics · VIKSHAKA" },
      { name: "description", content: "Predictive analytics, trend decomposition, AI video evidence, and OSINT intelligence." },
      { property: "og:title", content: "AI Crime Analysis · VIKSHAKA" },
      { property: "og:description", content: "Predictive crime analytics and media forensics for command decisions." },
    ],
  }),
  component: AnalysisPage,
});

const COLORS = ["var(--primary)", "var(--accent)", "var(--warning)", "var(--destructive)", "var(--success)", "#a58bff", "#f472b6"];

function AnalysisPage() {
  const [activeView, setActiveView] = useState<"analytics" | "ai_hub" | "video_evidence">("analytics");

  const stateBreakdown = Object.entries(
    cases.reduce<Record<string, number>>((acc, c) => { acc[c.state] = (acc[c.state] ?? 0) + 1; return acc; }, {})
  ).map(([state, count]) => ({ state, count })).sort((a,b) => b.count - a.count);

  const riskRadial = ["critical", "elevated", "moderate", "low"].map((r, i) => ({
    name: r,
    value: hotspots.filter(h => h.risk === r).length,
    fill: COLORS[i],
  }));

  return (
    <div className="space-y-6 pb-10">
      {/* Header & Tabs */}
      <div className="flex items-end justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Predictive & Forensic Suite</div>
          <h1 className="font-display text-3xl font-bold mt-1">Intelligence & Media Forensics</h1>
          <p className="text-sm text-muted-foreground mt-1">Trained on 12,842 historical records · last retrained 6h ago · confidence 94.2%</p>
        </div>

        {/* View Switcher */}
        <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-border">
          <button
            onClick={() => setActiveView("analytics")}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === "analytics" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="size-4" /> Predictive Analytics
          </button>
          <button
            onClick={() => setActiveView("ai_hub")}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === "ai_hub" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cpu className="size-4" /> AI & OSINT Hub
          </button>
          <button
            onClick={() => setActiveView("video_evidence")}
            className={`px-3 py-2 rounded-md text-xs font-semibold flex items-center gap-2 transition-all ${
              activeView === "video_evidence" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Video className="size-4" /> Video Evidence AI
          </button>
        </div>
      </div>

      {/* VIEW 1: Analytics */}
      {activeView === "analytics" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 flex items-center gap-2">
              <Brain className="size-4 text-primary" />
              <span className="text-xs font-mono text-primary">Model: VIKSHAKA-Predict v3.6</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-5">
              <h3 className="font-display font-bold mb-1">7-day incidence vs resolution</h3>
              <p className="text-[11px] text-muted-foreground mb-4">Resolution efficiency: 74.6% · improving</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={trend7d}>
                    <defs>
                      <linearGradient id="ai" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6}/><stop offset="100%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient>
                      <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--success)" stopOpacity={0.5}/><stop offset="100%" stopColor="var(--success)" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" vertical={false}/>
                    <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={10}/>
                    <YAxis stroke="var(--muted-foreground)" fontSize={10}/>
                    <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                    <Area type="monotone" dataKey="incidents" stroke="var(--primary)" fill="url(#ai)" strokeWidth={2}/>
                    <Area type="monotone" dataKey="resolved" stroke="var(--success)" fill="url(#ar)" strokeWidth={2}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-display font-bold mb-4">Hotspot risk mix</h3>
              <div className="h-64">
                <ResponsiveContainer>
                  <RadialBarChart innerRadius="30%" outerRadius="100%" data={riskRadial} startAngle={90} endAngle={-270}>
                    <RadialBar dataKey="value" cornerRadius={4} background />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}/>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-display font-bold mb-1">Crime mix</h3>
              <p className="text-[11px] text-muted-foreground mb-4">Distribution across category</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={crimeMix} dataKey="count" nameKey="type" outerRadius={80} innerRadius={40} paddingAngle={2}>
                      {crimeMix.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 10, fontFamily: "var(--font-mono)" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-5">
              <h3 className="font-display font-bold mb-1">State-wise caseload</h3>
              <p className="text-[11px] text-muted-foreground mb-4">Open + investigating records</p>
              <div className="h-64">
                <ResponsiveContainer>
                  <BarChart data={stateBreakdown} layout="vertical">
                    <CartesianGrid stroke="var(--border)" strokeDasharray="3 6" horizontal={false}/>
                    <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10}/>
                    <YAxis type="category" dataKey="state" stroke="var(--muted-foreground)" fontSize={10} width={100}/>
                    <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8 }}/>
                    <Bar dataKey="count" fill="var(--accent)" radius={[0,4,4,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="size-5 text-primary shrink-0 mt-0.5"/>
              <div className="flex-1">
                <div className="text-[10px] font-mono uppercase tracking-widest text-primary mb-1">AI Prediction · next 72h</div>
                <h3 className="font-display font-bold text-lg">Elevated risk in Karol Bagh & Jayanagar corridors</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Based on 30-day trend, deepfake extortion pattern, and current wanted-person mobility, the model predicts a <span className="text-warning font-semibold">64% probability</span> of a repeat armed incident within 72 hours in Bengaluru South.
                  Recommended: increase PCR density between 20:00–02:00, activate ANPR blanket across BLR-05 checkpoints, brief Jayanagar SHO on the Naidu ring signature.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-surface border border-border">Confidence 88%</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-surface border border-border">Signal: pattern-match</span>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-surface border border-border">Similar: VK-BLR-2024-0421</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AI & OSINT Hub */}
      {activeView === "ai_hub" && (
        <AIIntelligenceModule />
      )}

      {/* VIEW 3: Video Evidence AI */}
      {activeView === "video_evidence" && (
        <VideoEvidenceAI />
      )}
    </div>
  );
}
