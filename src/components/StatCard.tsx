import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  delta?: { value: string; direction: "up" | "down"; positive?: boolean };
  icon?: LucideIcon;
  accent?: "primary" | "destructive" | "warning" | "success";
  meter?: number; // 0..100
  hint?: string;
  className?: string;
}

const accentClass = {
  primary: "text-primary",
  destructive: "text-destructive",
  warning: "text-warning",
  success: "text-success",
} as const;

export function StatCard({ label, value, delta, icon: Icon, accent = "primary", meter, hint, className }: Props) {
  return (
    <div className={`rounded-xl border border-border bg-surface p-5 reveal ${className ?? ""}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{label}</span>
        {Icon && <Icon className={`size-4 ${accentClass[accent]}`} />}
      </div>
      <div className="flex items-end justify-between gap-3">
        <span className="font-display text-3xl font-bold leading-none">{value}</span>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded ${
            delta.positive === false ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
          }`}>
            {delta.direction === "up" ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {meter !== undefined && (
        <div className="mt-3 h-1 w-full bg-muted rounded-full overflow-hidden">
          <div className={`h-full bg-primary`} style={{ width: `${meter}%` }} />
        </div>
      )}
      {hint && <div className="mt-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{hint}</div>}
    </div>
  );
}
