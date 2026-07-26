import { createFileRoute } from "@tanstack/react-router";
import { NetworkGraph } from "@/components/NetworkGraph";
import { criminals, networkEdges } from "@/lib/mock-data";
import { Network as NetIcon, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/networks")({
  head: () => ({
    meta: [
      { title: "Criminal Networks · VIKSHAKA" },
      { name: "description", content: "Force-directed graph of known criminal associations, gang links, and repeat co-offenders." },
      { property: "og:title", content: "Criminal Networks · VIKSHAKA" },
      { property: "og:description", content: "Interactive criminal association graph for police intelligence." },
    ],
  }),
  component: NetworksPage,
});

const threatBg: Record<string, string> = {
  extreme: "bg-destructive/10 text-destructive border-destructive/30",
  high: "bg-warning/10 text-warning border-warning/30",
  moderate: "bg-accent/10 text-accent border-accent/30",
  low: "bg-primary/10 text-primary border-primary/30",
};

function NetworksPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Link Analysis</div>
        <h1 className="font-display text-3xl font-bold mt-1">Criminal Networks</h1>
        <p className="text-sm text-muted-foreground mt-1">{criminals.length} tracked persons · {networkEdges.length} known associations · {new Set(criminals.map(c => c.gang).filter(Boolean)).size} organised groups</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-4 h-[600px]">
          <NetworkGraph />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface reveal">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-display font-bold text-sm">Known persons of interest</h3>
            </div>
            <div className="max-h-[560px] overflow-y-auto divide-y divide-border">
              {[...criminals].sort((a,b) => b.linkedCases - a.linkedCases).map(c => (
                <div key={c.id} className="p-4 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">{c.id}</span>
                        {c.status === "at_large" && <AlertTriangle className="size-3 text-destructive" />}
                      </div>
                      <div className="text-sm font-semibold mt-0.5">{c.name} <span className="text-muted-foreground font-normal">"{c.alias}"</span></div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">{c.district} · {c.gang ?? "solo"} · {c.linkedCases} cases</div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.charges.map(ch => (
                          <span key={ch} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{ch}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded border ${threatBg[c.threatLevel]} shrink-0`}>
                      {c.threatLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 reveal">
        <div className="flex items-center gap-2 mb-4">
          <NetIcon className="size-4 text-primary" />
          <h3 className="font-display font-bold">Known associations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-2">From</th>
                <th className="px-3 py-2">To</th>
                <th className="px-3 py-2">Relation</th>
                <th className="px-3 py-2 text-right">Strength</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {networkEdges.map((e, i) => {
                const a = criminals.find(c => c.id === e.from);
                const b = criminals.find(c => c.id === e.to);
                return (
                  <tr key={i} className="hover:bg-muted/40">
                    <td className="px-3 py-2"><span className="font-mono text-xs text-muted-foreground">{e.from}</span> {a?.alias}</td>
                    <td className="px-3 py-2"><span className="font-mono text-xs text-muted-foreground">{e.to}</span> {b?.alias}</td>
                    <td className="px-3 py-2 text-muted-foreground">{e.label}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-0.5">
                        {[1,2,3,4].map(n => (
                          <span key={n} className={`h-4 w-1 rounded ${n <= e.weight ? "bg-primary" : "bg-muted"}`} />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
