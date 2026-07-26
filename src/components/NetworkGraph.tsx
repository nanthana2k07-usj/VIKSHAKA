import { criminals, networkEdges } from "@/lib/mock-data";

// Deterministic force-free radial layout.
const nodes = criminals.map((c, i) => {
  const angle = (i / criminals.length) * Math.PI * 2;
  const r = 200;
  return { ...c, x: 300 + Math.cos(angle) * r, y: 300 + Math.sin(angle) * r };
});

const threatColor: Record<string, string> = {
  extreme: "var(--destructive)",
  high: "var(--warning)",
  moderate: "var(--accent)",
  low: "var(--primary)",
};

export function NetworkGraph() {
  const idx = new Map(nodes.map(n => [n.id, n]));
  return (
    <div className="w-full h-full rounded-xl border border-border bg-background grid-bg overflow-hidden relative">
      <svg viewBox="0 0 600 600" className="w-full h-full">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted-foreground)" />
          </marker>
        </defs>

        {/* Edges */}
        {networkEdges.map((e, i) => {
          const a = idx.get(e.from);
          const b = idx.get(e.to);
          if (!a || !b) return null;
          return (
            <g key={i}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke="var(--muted-foreground)"
                strokeOpacity={0.15 + e.weight * 0.15}
                strokeWidth={e.weight}
                markerEnd="url(#arrow)"
              />
              <text
                x={(a.x + b.x) / 2} y={(a.y + b.y) / 2}
                fontSize="9" fill="var(--muted-foreground)"
                fontFamily="var(--font-mono)" textAnchor="middle"
              >
                {e.label}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(n => (
          <g key={n.id} transform={`translate(${n.x} ${n.y})`}>
            <circle r="26" fill={threatColor[n.threatLevel]} opacity="0.15" />
            <circle r="20" fill="var(--surface)" stroke={threatColor[n.threatLevel]} strokeWidth="2" />
            <text y="4" textAnchor="middle" fontSize="10" fill="var(--foreground)" fontFamily="var(--font-mono)" fontWeight="700">
              {n.id.replace("C-", "")}
            </text>
            <text y="42" textAnchor="middle" fontSize="10" fill="var(--foreground)" fontFamily="var(--font-sans)">
              {n.alias === "—" ? n.name.split(" ")[0] : n.alias}
            </text>
            <text y="54" textAnchor="middle" fontSize="8" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">
              {n.gang ?? "solo"}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
