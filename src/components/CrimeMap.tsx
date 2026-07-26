import { hotspots, type Hotspot } from "@/lib/mock-data";

// Very simple India-shape SVG with hotspots plotted by lat/lng.
// We map lat 8..37 → y, lng 68..97 → x within the viewBox.

const VB_W = 800;
const VB_H = 900;
const LNG_MIN = 68;
const LNG_MAX = 97;
const LAT_MIN = 8;
const LAT_MAX = 37;

function project(h: Hotspot) {
  const x = ((h.lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * VB_W;
  const y = VB_H - ((h.lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * VB_H;
  return { x, y };
}

const riskColor: Record<Hotspot["risk"], string> = {
  critical: "var(--destructive)",
  elevated: "var(--warning)",
  moderate: "var(--accent)",
  low: "var(--primary)",
};

const riskRadius: Record<Hotspot["risk"], number> = {
  critical: 20,
  elevated: 16,
  moderate: 13,
  low: 10,
};

interface Props {
  onSelect?: (h: Hotspot) => void;
  selectedId?: string;
  compact?: boolean;
}

export function CrimeMap({ onSelect, selectedId, compact }: Props) {
  return (
    <div className={`relative w-full h-full grid-bg rounded-xl overflow-hidden border border-border bg-background`}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full">
        {/* India outline — simplified stylised shape */}
        <defs>
          <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--surface-2)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="var(--surface)" stopOpacity="0.9" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Stylised India polygon */}
        <path
          d="M 240 90 L 360 60 L 470 90 L 560 130 L 620 200 L 700 260 L 720 340 L 700 420 L 660 500 L 620 570 L 560 640 L 500 720 L 440 800 L 380 840 L 340 810 L 300 720 L 260 640 L 220 560 L 180 470 L 160 380 L 150 300 L 170 220 L 200 150 Z"
          fill="url(#landGrad)"
          stroke="var(--border)"
          strokeWidth="2"
        />

        {/* Latitude/longitude grid */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <line
            key={`h${i}`}
            x1="0" x2={VB_W}
            y1={(VB_H / 7) * i} y2={(VB_H / 7) * i}
            stroke="var(--foreground)" strokeOpacity="0.03" strokeDasharray="4 8"
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6].map(i => (
          <line
            key={`v${i}`}
            y1="0" y2={VB_H}
            x1={(VB_W / 7) * i} x2={(VB_W / 7) * i}
            stroke="var(--foreground)" strokeOpacity="0.03" strokeDasharray="4 8"
          />
        ))}

        {/* Hotspot pins */}
        {hotspots.map(h => {
          const { x, y } = project(h);
          const r = riskRadius[h.risk];
          const color = riskColor[h.risk];
          const selected = selectedId === h.id;
          return (
            <g
              key={h.id}
              transform={`translate(${x} ${y})`}
              className="cursor-pointer"
              onClick={() => onSelect?.(h)}
            >
              <circle r={r} fill={color} opacity="0.15" filter="url(#glow)" />
              <circle r={r * 0.6} fill={color} opacity="0.35">
                <animate attributeName="r" values={`${r * 0.6};${r};${r * 0.6}`} dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.35;0.05;0.35" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r={selected ? 6 : 4} fill={color} stroke="var(--background)" strokeWidth="1.5" />
              {!compact && (
                <text x={r + 6} y="4" fontSize="11" fill="var(--foreground)" fontFamily="var(--font-mono)">
                  {h.area}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 text-[10px] font-mono uppercase tracking-widest bg-surface/90 backdrop-blur border border-border rounded-md px-3 py-2">
        {(["critical", "elevated", "moderate", "low"] as const).map(r => (
          <div key={r} className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: riskColor[r] }} />
            <span className="text-muted-foreground">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
