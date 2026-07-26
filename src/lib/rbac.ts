export type Role = "commissioner" | "officer" | "analyst";

export type Action =
  | "view:dashboard"
  | "view:hotspots"
  | "view:cctv"
  | "view:cases"
  | "view:networks"
  | "view:analysis"
  | "view:patrol"
  | "view:dispatch"
  | "view:evidence"
  | "view:alerts"
  | "view:briefings"
  | "view:reports"
  | "view:audit"
  | "view:settings"
  | "action:dispatch"
  | "action:ack_alert"
  | "action:assign_officer"
  | "action:export_report"
  | "action:generate_report"
  | "action:create_fir"
  | "action:resolve_alert"
  | "action:escalate";

const commissioner: Action[] = [
  "view:dashboard","view:hotspots","view:cctv","view:cases","view:networks","view:analysis",
  "view:patrol","view:dispatch","view:evidence","view:alerts","view:briefings","view:reports","view:audit","view:settings",
  "action:dispatch","action:ack_alert","action:assign_officer","action:export_report","action:generate_report","action:create_fir","action:resolve_alert","action:escalate",
];
const officer: Action[] = [
  "view:dashboard","view:hotspots","view:cctv","view:cases","view:patrol","view:dispatch","view:evidence","view:alerts","view:briefings","view:reports","view:audit",
  "action:dispatch","action:ack_alert","action:assign_officer","action:export_report","action:create_fir","action:resolve_alert","action:escalate",
];
const analyst: Action[] = [
  "view:dashboard","view:hotspots","view:networks","view:analysis","view:cases","view:evidence","view:briefings","view:reports","view:audit",
  "action:export_report","action:generate_report",
];

const map: Record<Role, Action[]> = { commissioner, officer, analyst };

export function can(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return map[role].includes(action);
}

export const roleLabel: Record<Role, string> = {
  commissioner: "Commissioner",
  officer: "Officer",
  analyst: "Analyst",
};

export const roleBadgeClass: Record<Role, string> = {
  commissioner: "bg-primary/15 text-primary border-primary/30",
  officer: "bg-accent/15 text-accent border-accent/30",
  analyst: "bg-warning/15 text-warning border-warning/30",
};
