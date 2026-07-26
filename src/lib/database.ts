/**
 * VIKSHAKA Synthetic Real-Time Database & Backend Store
 * Replaces static mock data with a reactive, persistent synthetic database store
 * with real-time record generation, filtering, and CRUD operations.
 */

export interface DbCase {
  id: string;
  title: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "open" | "investigating" | "resolved" | "closed";
  assignedOfficer: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  reportedAt: string;
  updatedAt: string;
  summary: string;
  evidenceCount: number;
  suspects: string[];
}

export interface DbCctvFeed {
  id: string;
  location: string;
  district: string;
  status: "online" | "alert" | "offline";
  aiTag?: string;
  lastAlert?: string;
  fps: number;
  resolution: string;
  streamUrl?: string;
}

export interface DbHotspot {
  id: string;
  area: string;
  district: string;
  state: string;
  risk: "critical" | "elevated" | "moderate" | "low";
  incidents30d: number;
  primaryCrime: string;
  lat: number;
  lng: number;
  lastIncidentTime: string;
}

export interface DbOsintThreat {
  id: string;
  source: "Telegram" | "Twitter/X" | "DarkWeb" | "News" | "Reddit";
  author: string;
  content: string;
  timestamp: string;
  sentiment: "critical" | "warning" | "neutral";
  threatScore: number;
  keywords: string[];
  area: string;
  lat: number;
  lng: number;
}

export interface DbPatrolUnit {
  id: string;
  callsign: string;
  officerInCharge: string;
  district: string;
  status: "patrolling" | "dispatched" | "busy" | "offline";
  vitals: { heartRate: number; stressLevel: "normal" | "elevated" | "high"; holsterStatus: "holstered" | "unholstered" };
  fuelLevel: number;
  lat: number;
  lng: number;
}

const STORAGE_KEY = "vikshaka_db_v2";

// Initial synthetic seed data
const SEED_CASES: DbCase[] = [
  {
    id: "VK-2026-9041",
    title: "Armed Robbery at Indiranagar Jewellery Vault",
    category: "Armed Robbery",
    severity: "critical",
    status: "investigating",
    assignedOfficer: "Comm. Ravi Shankar (IPS)",
    district: "Bengaluru South",
    state: "Karnataka",
    lat: 12.9784,
    lng: 77.6408,
    reportedAt: "2026-07-25T14:20:00Z",
    updatedAt: "2026-07-25T17:45:00Z",
    summary: "3 armed suspects entered using stolen KA-04-HE-7712 SUV. Fled toward 100ft road.",
    evidenceCount: 7,
    suspects: ["Vikram 'Viper' Malhotra", "Unidentified Male #2"],
  },
  {
    id: "VK-2026-8812",
    title: "Deepfake Financial Extortion Syndicate",
    category: "Cyber Crime",
    severity: "high",
    status: "open",
    assignedOfficer: "ACP Priya Nair",
    district: "Karol Bagh",
    state: "Delhi NCR",
    lat: 28.6518,
    lng: 77.1906,
    reportedAt: "2026-07-24T11:00:00Z",
    updatedAt: "2026-07-25T10:15:00Z",
    summary: "Generative AI video clips used to blackmail high-net-worth executives across NCR.",
    evidenceCount: 14,
    suspects: ["Shadow Network Node-9"],
  },
  {
    id: "VK-2026-7734",
    title: "Commercial Syndicate Cargo Theft",
    category: "Organised Crime",
    severity: "medium",
    status: "investigating",
    assignedOfficer: "Ins. Suresh Kumar",
    district: "Chennai Port Zone",
    state: "Tamil Nadu",
    lat: 13.0827,
    lng: 80.2707,
    reportedAt: "2026-07-23T09:30:00Z",
    updatedAt: "2026-07-25T12:00:00Z",
    summary: "Container breach containing high-value electronics near port gate 4.",
    evidenceCount: 5,
    suspects: ["Harbor Gang B"],
  },
];

const SEED_HOTSPOTS: DbHotspot[] = [
  {
    id: "hs-1",
    area: "MG Road & 100ft Junction",
    district: "Bengaluru South",
    state: "Karnataka",
    risk: "critical",
    incidents30d: 48,
    primaryCrime: "Armed Assault & Robbery",
    lat: 12.9754,
    lng: 77.6081,
    lastIncidentTime: "12 mins ago",
  },
  {
    id: "hs-2",
    area: "Karol Bagh Market Belt",
    district: "Central Delhi",
    state: "Delhi NCR",
    risk: "critical",
    incidents30d: 56,
    primaryCrime: "Extortion & Snatching",
    lat: 28.6518,
    lng: 77.1906,
    lastIncidentTime: "24 mins ago",
  },
  {
    id: "hs-3",
    area: "Jayanagar 4th Block",
    district: "Bengaluru South",
    state: "Karnataka",
    risk: "elevated",
    incidents30d: 32,
    primaryCrime: "Vehicle Theft (ALPR flagged)",
    lat: 12.925,
    lng: 77.5938,
    lastIncidentTime: "1 hour ago",
  },
  {
    id: "hs-4",
    area: "Marine Drive Promenade",
    district: "South Mumbai",
    state: "Maharashtra",
    risk: "moderate",
    incidents30d: 19,
    primaryCrime: "Civil Unrest Assembly",
    lat: 18.9438,
    lng: 72.823,
    lastIncidentTime: "3 hours ago",
  },
];

const SEED_CCTV: DbCctvFeed[] = [
  { id: "CAM-BLR-101", location: "MG Road Metro Gate 2", district: "Bengaluru South", status: "alert", aiTag: "WEAPON DETECTED (94%)", lastAlert: "2 mins ago", fps: 60, resolution: "4K UHD" },
  { id: "CAM-BLR-102", location: "Indiranagar 100ft Signal", district: "Bengaluru South", status: "alert", aiTag: "STOLEN PLATE: KA-04-HE-7712", lastAlert: "14 mins ago", fps: 60, resolution: "4K UHD" },
  { id: "CAM-DEL-201", location: "Karol Bagh Main Intersection", district: "Central Delhi", status: "online", aiTag: "Normal crowd density", fps: 30, resolution: "1080p" },
  { id: "CAM-MUM-304", location: "Marine Drive Gateway North", district: "South Mumbai", status: "online", aiTag: "Civil assembly monitor", fps: 60, resolution: "4K UHD" },
  { id: "CAM-BLR-105", location: "Jayanagar Complex Alley 3", district: "Bengaluru South", status: "offline", aiTag: "—", fps: 0, resolution: "N/A" },
];

const SEED_PATROLS: DbPatrolUnit[] = [
  { id: "pcr-101", callsign: "VIKRAM-1", officerInCharge: "Ins. Rajesh Gowda", district: "Bengaluru South", status: "dispatched", vitals: { heartRate: 98, stressLevel: "elevated", holsterStatus: "holstered" }, fuelLevel: 82, lat: 12.9750, lng: 77.6080 },
  { id: "pcr-102", callsign: "VIKRAM-2", officerInCharge: "Sub-Ins. Amit Patil", district: "Bengaluru South", status: "patrolling", vitals: { heartRate: 74, stressLevel: "normal", holsterStatus: "holstered" }, fuelLevel: 94, lat: 12.9260, lng: 77.5940 },
  { id: "pcr-204", callsign: "CHETAK-4", officerInCharge: "Ins. Vikram Rathore", district: "Central Delhi", status: "patrolling", vitals: { heartRate: 80, stressLevel: "normal", holsterStatus: "holstered" }, fuelLevel: 68, lat: 28.6520, lng: 77.1910 },
];

class SyntheticDatabase {
  private cases: DbCase[] = [];
  private hotspots: DbHotspot[] = [];
  private cctv: DbCctvFeed[] = [];
  private osint: DbOsintThreat[] = [];
  private patrols: DbPatrolUnit[] = [];
  private listeners: Set<() => void> = new Set();
  private timer: any = null;

  constructor() {
    this.loadFromStorage();
    this.startRealtimeSimulation();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cases = parsed.cases || SEED_CASES;
        this.hotspots = parsed.hotspots || SEED_HOTSPOTS;
        this.cctv = parsed.cctv || SEED_CCTV;
        this.patrols = parsed.patrols || SEED_PATROLS;
        this.osint = parsed.osint || [];
        return;
      }
    } catch (e) {
      console.warn("Storage parse error, seeding initial data");
    }

    this.cases = [...SEED_CASES];
    this.hotspots = [...SEED_HOTSPOTS];
    this.cctv = [...SEED_CCTV];
    this.patrols = [...SEED_PATROLS];
    this.saveToStorage();
  }

  private saveToStorage() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cases: this.cases,
          hotspots: this.hotspots,
          cctv: this.cctv,
          patrols: this.patrols,
          osint: this.osint,
        })
      );
    } catch (e) {
      console.error("Storage save failed", e);
    }
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((cb) => cb());
  }

  // --- Real-time Background Incident Stream Generator ---
  private startRealtimeSimulation() {
    if (this.timer || typeof window === "undefined") return;

    this.timer = setInterval(() => {
      // 1. Randomly update patrol officer heart rates / telemetry
      this.patrols = this.patrols.map((p) => {
        const hrDelta = Math.floor(Math.random() * 7) - 3;
        const newHr = Math.min(130, Math.max(65, p.vitals.heartRate + hrDelta));
        return {
          ...p,
          vitals: {
            ...p.vitals,
            heartRate: newHr,
            stressLevel: newHr > 105 ? "high" : newHr > 90 ? "elevated" : "normal",
          },
        };
      });

      // 2. Occasionally generate a new synthetic OSINT alert
      if (Math.random() > 0.6) {
        const id = `osint-gen-${Date.now()}`;
        const newOsint: DbOsintThreat = {
          id,
          source: Math.random() > 0.5 ? "Telegram" : "Twitter/X",
          author: `@user_${Math.floor(Math.random() * 9000 + 1000)}`,
          content: `Real-time AI Scan: Threat activity detected near ${this.hotspots[Math.floor(Math.random() * this.hotspots.length)].area}`,
          timestamp: "Just now",
          sentiment: Math.random() > 0.5 ? "critical" : "warning",
          threatScore: Math.floor(Math.random() * 30 + 70),
          keywords: ["surveillance", "unrest", "alert"],
          area: "Bengaluru South",
          lat: 12.97 + (Math.random() - 0.5) * 0.05,
          lng: 77.60 + (Math.random() - 0.5) * 0.05,
        };
        this.osint = [newOsint, ...this.osint.slice(0, 15)];
      }

      this.notify();
    }, 5000);
  }

  // --- CRUD API API Methods ---

  public getCases(): DbCase[] {
    return this.cases;
  }

  public addCase(c: Omit<DbCase, "id" | "reportedAt" | "updatedAt">): DbCase {
    const newCase: DbCase = {
      ...c,
      id: `VK-2026-${Math.floor(Math.random() * 9000 + 1000)}`,
      reportedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.cases = [newCase, ...this.cases];
    this.notify();
    return newCase;
  }

  public updateCaseStatus(id: string, status: DbCase["status"]) {
    this.cases = this.cases.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c));
    this.notify();
  }

  public getHotspots(): DbHotspot[] {
    return this.hotspots;
  }

  public getCctvFeeds(): DbCctvFeed[] {
    return this.cctv;
  }

  public getPatrols(): DbPatrolUnit[] {
    return this.patrols;
  }

  public dispatchPatrol(callsign: string, area: string) {
    this.patrols = this.patrols.map((p) => (p.callsign === callsign ? { ...p, status: "dispatched" } : p));
    this.notify();
  }

  public getOsintThreats(): DbOsintThreat[] {
    return this.osint.length > 0 ? this.osint : [
      {
        id: "osint-init-1",
        source: "Telegram",
        author: "@shadow_alert",
        content: "High risk gathering planned near MG Road sector at 21:00 hrs.",
        timestamp: "2 mins ago",
        sentiment: "critical",
        threatScore: 94,
        keywords: ["MG Road", "unrest"],
        area: "Bengaluru South",
        lat: 12.9754,
        lng: 77.6081,
      },
    ];
  }

  public resetToDefaults() {
    this.cases = [...SEED_CASES];
    this.hotspots = [...SEED_HOTSPOTS];
    this.cctv = [...SEED_CCTV];
    this.patrols = [...SEED_PATROLS];
    this.osint = [];
    this.notify();
  }
}

export const db = new SyntheticDatabase();
