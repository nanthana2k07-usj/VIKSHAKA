// Seeded mock data for VIKSHAKA AI Crime Intelligence Platform
// Deterministic — same values every render so the demo is stable.

export type Priority = "critical" | "high" | "medium" | "low";
export type CaseStatus = "open" | "investigating" | "closed" | "cold";

export interface Case {
  id: string;
  fir: string;
  title: string;
  ipc: string;
  crimeType: string;
  district: string;
  state: string;
  status: CaseStatus;
  priority: Priority;
  suspect: string;
  officer: string;
  reportedAt: string;
  updatedAt: string;
  summary: string;
}

export interface Criminal {
  id: string;
  name: string;
  alias: string;
  age: number;
  district: string;
  gang: string | null;
  charges: string[];
  status: "at_large" | "arrested" | "under_watch" | "released";
  threatLevel: "extreme" | "high" | "moderate" | "low";
  lastSeen: string;
  linkedCases: number;
}

export interface Hotspot {
  id: string;
  area: string;
  district: string;
  state: string;
  lat: number;
  lng: number;
  incidents30d: number;
  risk: "critical" | "elevated" | "moderate" | "low";
  primaryCrime: string;
}

export interface CctvFeed {
  id: string;
  location: string;
  district: string;
  status: "online" | "offline" | "alert";
  lastAlert?: string;
  aiTag?: string;
}

export interface Alert {
  id: string;
  time: string;
  severity: Priority;
  category: string;
  title: string;
  location: string;
  officer?: string;
}

export interface Officer {
  id: string;
  name: string;
  rank: string;
  badge: string;
  station: string;
  status: "on_duty" | "patrol" | "off_duty" | "responding";
  casesResolved: number;
  performance: number;
}

export interface Patrol {
  id: string;
  unit: string;
  zone: string;
  officers: number;
  lead: string;
  status: "active" | "en_route" | "standby" | "responding";
  checkpoints: number;
  progress: number;
}

// ─── Cases ─────────────────────────────────────────────────────
export const cases: Case[] = [
  { id: "VK-BLR-2024-0421", fir: "FIR/2024/00421", title: "Armed robbery at Jayanagar jewellery store", ipc: "IPC 392, 397", crimeType: "Armed Robbery", district: "Bengaluru South", state: "Karnataka", status: "investigating", priority: "critical", suspect: "Ravi 'Bull' Naidu + 2 associates", officer: "Insp. Anjali Rao", reportedAt: "2026-07-18 02:14", updatedAt: "2026-07-22 19:40", summary: "Three masked assailants breached rear service door at 02:04 IST. Estimated ₹1.4 Cr taken. Silver hatchback KA-05-BX-2214 recovered abandoned near Bommanahalli." },
  { id: "VK-DEL-2024-0910", fir: "FIR/2024/00910", title: "Cyber fraud ring — pan-India OTP scam", ipc: "IPC 420, IT Act 66C", crimeType: "Cyber Fraud", district: "New Delhi", state: "Delhi", status: "investigating", priority: "high", suspect: "Sundar Halwai (kingpin), 6 mules identified", officer: "ACP Kabir Verma", reportedAt: "2026-07-11 09:22", updatedAt: "2026-07-22 14:11", summary: "Ring operating from Jamtara cluster with ₹3.2 Cr losses across 8 states. Financial trail leads to 14 accounts frozen." },
  { id: "VK-MUM-2024-0287", fir: "FIR/2024/00287", title: "Chain snatching series — Bandra West", ipc: "IPC 379, 356", crimeType: "Theft", district: "Bandra", state: "Maharashtra", status: "open", priority: "high", suspect: "Two on Bajaj Pulsar (MH-02 series)", officer: "Insp. Farah Sheikh", reportedAt: "2026-07-20 18:47", updatedAt: "2026-07-22 09:15", summary: "9th incident in 21 days along Turner Road corridor. Same modus: rear-passenger pickpocket, 19:00-21:30 window." },
  { id: "VK-HYD-2024-0154", fir: "FIR/2024/00154", title: "Narcotics seizure — Banjara Hills raid", ipc: "NDPS 21, 29", crimeType: "Narcotics", district: "Banjara Hills", state: "Telangana", status: "closed", priority: "critical", suspect: "Nikhil 'Dolo' Reddy (arrested)", officer: "DCP Meera Krishnan", reportedAt: "2026-07-05 03:11", updatedAt: "2026-07-19 16:30", summary: "412g MDMA, 1.8kg hashish, ₹28L cash recovered. 3 arrested, chargesheet filed 2026-07-19." },
  { id: "VK-KOL-2024-0603", fir: "FIR/2024/00603", title: "Homicide — Salt Lake Sector V", ipc: "IPC 302, 201", crimeType: "Homicide", district: "Bidhannagar", state: "West Bengal", status: "investigating", priority: "critical", suspect: "Unknown (male, ~35)", officer: "Insp. Debjit Ghosh", reportedAt: "2026-07-21 04:32", updatedAt: "2026-07-22 20:05", summary: "Body found near canal service road. Preliminary autopsy: blunt-force trauma. CCTV coverage limited; ANPR sweep active." },
  { id: "VK-CHN-2024-0338", fir: "FIR/2024/00338", title: "Vehicle theft syndicate — T. Nagar", ipc: "IPC 379, 411", crimeType: "Auto Theft", district: "T. Nagar", state: "Tamil Nadu", status: "investigating", priority: "medium", suspect: "Ganesan Motor Works crew", officer: "Insp. Priya Selvam", reportedAt: "2026-07-14 11:20", updatedAt: "2026-07-22 12:00", summary: "18 two-wheelers stolen in 40 days. Chop-shop suspected in Ambattur. Two frames matched by chassis rehash." },
  { id: "VK-PUN-2024-0117", fir: "FIR/2024/00117", title: "Corporate embezzlement — Hinjewadi Phase 3", ipc: "IPC 409, 420", crimeType: "White Collar", district: "Pune", state: "Maharashtra", status: "open", priority: "medium", suspect: "CFO Anish Malhotra", reportedAt: "2026-07-19 15:00", updatedAt: "2026-07-22 10:20", officer: "ACP Rohan Kulkarni", summary: "₹12.4 Cr routed through shell entities in Mauritius. ED cooperation requested." },
  { id: "VK-JAI-2024-0092", fir: "FIR/2024/00092", title: "Antique smuggling — Amber Fort perimeter", ipc: "IPC 411, Ant. Act 25", crimeType: "Smuggling", district: "Jaipur", state: "Rajasthan", status: "cold", priority: "low", suspect: "Unknown network", officer: "Insp. Vikram Rathore", reportedAt: "2026-06-04 08:11", updatedAt: "2026-07-01 09:00", summary: "17th-century artefacts flagged at Zurich auction. Chain of custody broken 2026-05." },
  { id: "VK-AHM-2024-0511", fir: "FIR/2024/00511", title: "Fake currency circulation — Bapunagar", ipc: "IPC 489B, 489C", crimeType: "Counterfeit", district: "Ahmedabad", state: "Gujarat", status: "investigating", priority: "high", suspect: "Iqbal Sheth + courier ring", officer: "Insp. Nandini Patel", reportedAt: "2026-07-16 22:00", updatedAt: "2026-07-22 17:35", summary: "₹47L FICN seized in two raids. Printing plates traced to Malda transit." },
  { id: "VK-LKO-2024-0074", fir: "FIR/2024/00074", title: "Land-grab syndicate — Gomti Nagar Extn.", ipc: "IPC 420, 467, 471", crimeType: "Property Fraud", district: "Lucknow", state: "Uttar Pradesh", status: "investigating", priority: "medium", suspect: "3 revenue officials, 2 developers", officer: "SP Aditya Singh", reportedAt: "2026-07-09 10:45", updatedAt: "2026-07-21 15:00", summary: "Forged khasra entries on 14 plots. State vigilance cell involved." },
  { id: "VK-BLR-2024-0430", fir: "FIR/2024/00430", title: "Cybercrime — deepfake extortion", ipc: "IT Act 66E, IPC 384", crimeType: "Cyber Fraud", district: "Whitefield", state: "Karnataka", status: "open", priority: "high", suspect: "Overseas VoIP number", officer: "Insp. Anjali Rao", reportedAt: "2026-07-22 06:30", updatedAt: "2026-07-22 21:12", summary: "6 victims in tech corridor. AI-generated video used to extort ₹40L. TRAI notice raised." },
  { id: "VK-DEL-2024-0921", fir: "FIR/2024/00921", title: "Attempted homicide — Karol Bagh", ipc: "IPC 307, 34", crimeType: "Violent", district: "Central Delhi", state: "Delhi", status: "investigating", priority: "critical", suspect: "Local goon 'Rocky' Sharma", officer: "ACP Kabir Verma", reportedAt: "2026-07-22 22:14", updatedAt: "2026-07-22 23:40", summary: "Victim stable, ICU. Weapon (country pistol) recovered. Two suspects fled on motorcycle." },
];

// ─── Criminals ─────────────────────────────────────────────────
export const criminals: Criminal[] = [
  { id: "C-9012", name: "Ravi Naidu", alias: "The Bull", age: 38, district: "Bengaluru South", gang: "Naidu Ring", charges: ["IPC 392", "IPC 397", "Arms Act 25"], status: "at_large", threatLevel: "extreme", lastSeen: "Bommanahalli, 2026-07-18", linkedCases: 7 },
  { id: "C-8814", name: "Sundar Halwai", alias: "Sunny Bhai", age: 44, district: "Jamtara (JH)", gang: "OTP Cartel", charges: ["IPC 420", "IT Act 66C", "IT Act 66D"], status: "under_watch", threatLevel: "high", lastSeen: "Karmatanr, 2026-07-19", linkedCases: 21 },
  { id: "C-7623", name: "Nikhil Reddy", alias: "Dolo", age: 31, district: "Banjara Hills", gang: null, charges: ["NDPS 21", "NDPS 29"], status: "arrested", threatLevel: "high", lastSeen: "Chanchalguda Jail", linkedCases: 4 },
  { id: "C-9430", name: "Iqbal Sheth", alias: "Chotu", age: 51, district: "Bapunagar", gang: "Malda Print", charges: ["IPC 489B", "IPC 489C"], status: "at_large", threatLevel: "high", lastSeen: "Vatva, 2026-07-14", linkedCases: 9 },
  { id: "C-6612", name: "Rocky Sharma", alias: "Rocky", age: 29, district: "Central Delhi", gang: "KB Boys", charges: ["IPC 307", "IPC 302", "Arms Act 25"], status: "at_large", threatLevel: "extreme", lastSeen: "Karol Bagh, 2026-07-22", linkedCases: 6 },
  { id: "C-5501", name: "Farida Begum", alias: "Madam F", age: 47, district: "Kamathipura", gang: "Begum Circle", charges: ["ITPA 3", "IPC 370"], status: "under_watch", threatLevel: "moderate", lastSeen: "Grant Road, 2026-07-20", linkedCases: 12 },
  { id: "C-8801", name: "Anish Malhotra", alias: "—", age: 43, district: "Pune", gang: null, charges: ["IPC 409", "IPC 420"], status: "released", threatLevel: "low", lastSeen: "Koregaon Park, 2026-07-22", linkedCases: 1 },
  { id: "C-9902", name: "Vikas 'Vicky' Yadav", alias: "Vicky", age: 33, district: "Ghaziabad", gang: "Vicky Group", charges: ["IPC 302", "IPC 120B"], status: "at_large", threatLevel: "extreme", lastSeen: "Loni Border, 2026-07-15", linkedCases: 11 },
];

// ─── Hotspots ──────────────────────────────────────────────────
// Approximate lat/lng in India, plus a normalized 0..1 x/y for the SVG map.
export const hotspots: Hotspot[] = [
  { id: "H1", area: "Jayanagar 4th Block", district: "Bengaluru South", state: "Karnataka", lat: 12.93, lng: 77.58, incidents30d: 42, risk: "critical", primaryCrime: "Armed Robbery" },
  { id: "H2", area: "Karol Bagh Market", district: "Central Delhi", state: "Delhi", lat: 28.65, lng: 77.19, incidents30d: 61, risk: "critical", primaryCrime: "Assault" },
  { id: "H3", area: "Bandra Turner Rd", district: "Mumbai Suburban", state: "Maharashtra", lat: 19.06, lng: 72.83, incidents30d: 38, risk: "elevated", primaryCrime: "Chain Snatching" },
  { id: "H4", area: "Salt Lake Sector V", district: "Bidhannagar", state: "West Bengal", lat: 22.58, lng: 88.43, incidents30d: 24, risk: "elevated", primaryCrime: "Homicide" },
  { id: "H5", area: "T. Nagar Ranganathan", district: "Chennai", state: "Tamil Nadu", lat: 13.04, lng: 80.23, incidents30d: 29, risk: "moderate", primaryCrime: "Auto Theft" },
  { id: "H6", area: "Bapunagar", district: "Ahmedabad", state: "Gujarat", lat: 23.03, lng: 72.65, incidents30d: 33, risk: "elevated", primaryCrime: "Counterfeit" },
  { id: "H7", area: "Gomti Nagar Extn.", district: "Lucknow", state: "Uttar Pradesh", lat: 26.85, lng: 81.00, incidents30d: 17, risk: "moderate", primaryCrime: "Property Fraud" },
  { id: "H8", area: "Banjara Hills Rd 12", district: "Hyderabad", state: "Telangana", lat: 17.42, lng: 78.44, incidents30d: 21, risk: "moderate", primaryCrime: "Narcotics" },
  { id: "H9", area: "Hinjewadi Phase 3", district: "Pune", state: "Maharashtra", lat: 18.59, lng: 73.71, incidents30d: 14, risk: "low", primaryCrime: "White Collar" },
  { id: "H10", area: "Amber Fort Perimeter", district: "Jaipur", state: "Rajasthan", lat: 26.98, lng: 75.85, incidents30d: 9, risk: "low", primaryCrime: "Smuggling" },
  { id: "H11", area: "Whitefield IT Corridor", district: "Bengaluru East", state: "Karnataka", lat: 12.97, lng: 77.75, incidents30d: 26, risk: "moderate", primaryCrime: "Cyber Fraud" },
  { id: "H12", area: "Loni Border", district: "Ghaziabad", state: "Uttar Pradesh", lat: 28.75, lng: 77.28, incidents30d: 45, risk: "critical", primaryCrime: "Organised Crime" },
];

// ─── CCTV feeds ────────────────────────────────────────────────
export const cctv: CctvFeed[] = [
  { id: "CAM-042", location: "Jayanagar 4th Blk / Metro Exit", district: "Bengaluru South", status: "alert", lastAlert: "22:14", aiTag: "Suspect vehicle match" },
  { id: "CAM-118", location: "Karol Bagh Ajmal Khan Rd", district: "Central Delhi", status: "alert", lastAlert: "22:08", aiTag: "Weapon detected" },
  { id: "CAM-207", location: "Bandra Turner Rd Jct", district: "Mumbai Suburban", status: "online", aiTag: "—" },
  { id: "CAM-054", location: "Salt Lake Sector V, Gate 3", district: "Bidhannagar", status: "online", aiTag: "—" },
  { id: "CAM-311", location: "T. Nagar Ranganathan St", district: "Chennai", status: "online", aiTag: "—" },
  { id: "CAM-402", location: "Bapunagar Chowk", district: "Ahmedabad", status: "offline", aiTag: "—" },
  { id: "CAM-556", location: "Banjara Hills Rd 12", district: "Hyderabad", status: "online", aiTag: "—" },
  { id: "CAM-621", location: "Hinjewadi Phase 3 Bridge", district: "Pune", status: "online", aiTag: "—" },
  { id: "CAM-733", location: "Whitefield ITPL Main", district: "Bengaluru East", status: "alert", lastAlert: "21:47", aiTag: "Crowd density anomaly" },
  { id: "CAM-812", location: "Loni Border Checkpost", district: "Ghaziabad", status: "online", aiTag: "ANPR match" },
  { id: "CAM-901", location: "Amber Fort North Wall", district: "Jaipur", status: "online", aiTag: "—" },
  { id: "CAM-088", location: "Gomti Nagar Ring Rd", district: "Lucknow", status: "online", aiTag: "—" },
];

// ─── Alerts feed ───────────────────────────────────────────────
export const alerts: Alert[] = [
  { id: "A-9001", time: "22:14", severity: "critical", category: "Armed Incident", title: "Panic alarm — Jayanagar jewellery cluster", location: "Bengaluru South", officer: "Insp. Anjali Rao" },
  { id: "A-9000", time: "22:08", severity: "critical", category: "Weapon Detection", title: "AI flagged pistol on CAM-118", location: "Karol Bagh, Delhi", officer: "ACP Kabir Verma" },
  { id: "A-8999", time: "21:52", severity: "high", category: "Vehicle", title: "ANPR: KA-05-BX-2214 flagged near Bommanahalli", location: "Bengaluru", officer: "Insp. Anjali Rao" },
  { id: "A-8998", time: "21:47", severity: "medium", category: "Crowd", title: "Density anomaly at ITPL Main", location: "Whitefield", officer: "Insp. Anjali Rao" },
  { id: "A-8997", time: "21:20", severity: "high", category: "Cyber", title: "OTP fraud spike — 14 fresh complaints", location: "Multi-state", officer: "ACP Kabir Verma" },
  { id: "A-8996", time: "20:44", severity: "medium", category: "Patrol", title: "PCR-44 delayed check-in at Hebbal", location: "Bengaluru North", officer: "SI Manoj Bhat" },
  { id: "A-8995", time: "20:10", severity: "low", category: "Info", title: "Forensic report uploaded — VK-BLR-2024-0421", location: "FSL Rohini", officer: "System" },
  { id: "A-8994", time: "19:55", severity: "high", category: "Snatching", title: "9th chain snatching — Turner Road corridor", location: "Bandra West", officer: "Insp. Farah Sheikh" },
];

// ─── Officers ──────────────────────────────────────────────────
export const officers: Officer[] = [
  { id: "O-101", name: "Ravi Shankar", rank: "Commissioner (IPS)", badge: "IPS-BLR-114", station: "BLR HQ", status: "on_duty", casesResolved: 218, performance: 94 },
  { id: "O-102", name: "Anjali Rao", rank: "Inspector", badge: "KA-4412", station: "Jayanagar PS", status: "responding", casesResolved: 61, performance: 88 },
  { id: "O-103", name: "Kabir Verma", rank: "ACP", badge: "DL-2201", station: "Karol Bagh PS", status: "on_duty", casesResolved: 149, performance: 91 },
  { id: "O-104", name: "Farah Sheikh", rank: "Inspector", badge: "MH-3390", station: "Bandra PS", status: "patrol", casesResolved: 74, performance: 86 },
  { id: "O-105", name: "Meera Krishnan", rank: "DCP", badge: "TS-5501", station: "Banjara Hills", status: "on_duty", casesResolved: 132, performance: 92 },
  { id: "O-106", name: "Debjit Ghosh", rank: "Inspector", badge: "WB-7712", station: "Bidhannagar PS", status: "responding", casesResolved: 48, performance: 84 },
  { id: "O-107", name: "Priya Selvam", rank: "Inspector", badge: "TN-2298", station: "T. Nagar PS", status: "patrol", casesResolved: 55, performance: 82 },
  { id: "O-108", name: "Rohan Kulkarni", rank: "ACP", badge: "MH-8801", station: "Hinjewadi PS", status: "on_duty", casesResolved: 118, performance: 89 },
];

// ─── Patrols ───────────────────────────────────────────────────
export const patrols: Patrol[] = [
  { id: "P-01", unit: "PCR-42", zone: "Jayanagar Sector 4", officers: 4, lead: "Insp. Anjali Rao", status: "responding", checkpoints: 8, progress: 62 },
  { id: "P-02", unit: "PCR-44", zone: "Hebbal Flyover", officers: 3, lead: "SI Manoj Bhat", status: "active", checkpoints: 6, progress: 40 },
  { id: "P-03", unit: "PCR-17", zone: "Turner Rd, Bandra W", officers: 5, lead: "Insp. Farah Sheikh", status: "active", checkpoints: 10, progress: 74 },
  { id: "P-04", unit: "PCR-88", zone: "Karol Bagh Market", officers: 6, lead: "ACP Kabir Verma", status: "responding", checkpoints: 12, progress: 88 },
  { id: "P-05", unit: "PCR-23", zone: "Salt Lake Sec V", officers: 4, lead: "Insp. Debjit Ghosh", status: "en_route", checkpoints: 7, progress: 15 },
  { id: "P-06", unit: "PCR-09", zone: "Banjara Hills Rd 12", officers: 3, lead: "SI Karthik Reddy", status: "active", checkpoints: 6, progress: 55 },
  { id: "P-07", unit: "PCR-56", zone: "Loni Border", officers: 8, lead: "SI Yashwant Kumar", status: "standby", checkpoints: 5, progress: 0 },
  { id: "P-08", unit: "PCR-31", zone: "T. Nagar", officers: 4, lead: "Insp. Priya Selvam", status: "active", checkpoints: 9, progress: 33 },
];

// ─── Trends ────────────────────────────────────────────────────
export const trend7d = [
  { day: "Wed", label: "Jul 16", incidents: 62, resolved: 48 },
  { day: "Thu", label: "Jul 17", incidents: 74, resolved: 55 },
  { day: "Fri", label: "Jul 18", incidents: 89, resolved: 61 },
  { day: "Sat", label: "Jul 19", incidents: 112, resolved: 73 },
  { day: "Sun", label: "Jul 20", incidents: 98, resolved: 79 },
  { day: "Mon", label: "Jul 21", incidents: 81, resolved: 68 },
  { day: "Tue", label: "Jul 22", incidents: 94, resolved: 71 },
];

export const crimeMix = [
  { type: "Theft", count: 312 },
  { type: "Assault", count: 187 },
  { type: "Cyber Fraud", count: 244 },
  { type: "Narcotics", count: 96 },
  { type: "Homicide", count: 18 },
  { type: "White Collar", count: 71 },
  { type: "Vehicle", count: 128 },
];

// ─── Criminal network edges (for graph) ────────────────────────
export const networkEdges: Array<{ from: string; to: string; weight: number; label: string }> = [
  { from: "C-9012", to: "C-9430", weight: 3, label: "arms supply" },
  { from: "C-9012", to: "C-6612", weight: 2, label: "co-accused" },
  { from: "C-6612", to: "C-9902", weight: 4, label: "gang alliance" },
  { from: "C-8814", to: "C-7623", weight: 1, label: "financial trail" },
  { from: "C-8814", to: "C-9430", weight: 2, label: "mule courier" },
  { from: "C-5501", to: "C-8814", weight: 1, label: "known associate" },
  { from: "C-9902", to: "C-9012", weight: 2, label: "shared safe-house" },
  { from: "C-7623", to: "C-5501", weight: 1, label: "past cellmate" },
];

// ─── KPIs ──────────────────────────────────────────────────────
export const kpis = {
  activeCases: cases.filter(c => c.status !== "closed").length,
  criticalAlerts: alerts.filter(a => a.severity === "critical").length,
  cctvOnline: cctv.filter(c => c.status !== "offline").length,
  cctvTotal: cctv.length,
  officersDeployed: officers.filter(o => o.status !== "off_duty").length,
  officersTotal: officers.length,
};

// ─── Evidence & Forensics ──────────────────────────────────────
export interface EvidenceItem {
  id: string;
  caseId: string;
  type: "physical" | "digital" | "forensic" | "cctv";
  description: string;
  collectedAt: string;
  collectedBy: string;
  location: string;
  status: "in_custody" | "in_analysis" | "released" | "sealed";
  chainOfCustody: number;
}

export const evidenceItems: EvidenceItem[] = [
  { id: "EV-2401", caseId: "VK-BLR-2024-0421", type: "physical", description: "Silver hatchback KA-05-BX-2214 — recovered vehicle", collectedAt: "2026-07-18 04:22", collectedBy: "Insp. Anjali Rao", location: "FSL Bengaluru", status: "in_analysis", chainOfCustody: 4 },
  { id: "EV-2402", caseId: "VK-BLR-2024-0421", type: "cctv", description: "CAM-042 rear service door footage (02:04–02:18 IST)", collectedAt: "2026-07-18 03:10", collectedBy: "SI Manoj Bhat", location: "Jayanagar PS", status: "sealed", chainOfCustody: 2 },
  { id: "EV-2403", caseId: "VK-DEL-2024-0910", type: "digital", description: "14 frozen bank account transaction logs", collectedAt: "2026-07-12 11:00", collectedBy: "ACP Kabir Verma", location: "Cyber Cell Delhi", status: "in_custody", chainOfCustody: 3 },
  { id: "EV-2404", caseId: "VK-DEL-2024-0921", type: "forensic", description: "Country pistol — ballistics match pending", collectedAt: "2026-07-22 23:15", collectedBy: "ACP Kabir Verma", location: "FSL Rohini", status: "in_analysis", chainOfCustody: 5 },
  { id: "EV-2405", caseId: "VK-HYD-2024-0154", type: "physical", description: "412g MDMA, 1.8kg hashish — sealed exhibits", collectedAt: "2026-07-05 04:00", collectedBy: "DCP Meera Krishnan", location: "Banjara Hills PS", status: "sealed", chainOfCustody: 6 },
  { id: "EV-2406", caseId: "VK-AHM-2024-0511", type: "forensic", description: "FICN printing plates — latent print analysis", collectedAt: "2026-07-17 01:30", collectedBy: "Insp. Nandini Patel", location: "FSL Gandhinagar", status: "in_analysis", chainOfCustody: 3 },
  { id: "EV-2407", caseId: "VK-KOL-2024-0603", type: "forensic", description: "Autopsy report — blunt-force trauma confirmation", collectedAt: "2026-07-21 10:00", collectedBy: "Insp. Debjit Ghosh", location: "Bidhannagar PS", status: "in_custody", chainOfCustody: 2 },
  { id: "EV-2408", caseId: "VK-BLR-2024-0430", type: "digital", description: "Deepfake video samples + VoIP call metadata", collectedAt: "2026-07-22 08:00", collectedBy: "Insp. Anjali Rao", location: "Cyber Cell BLR", status: "in_analysis", chainOfCustody: 4 },
];

// ─── Dispatch log ────────────────────────────────────────────────
export interface DispatchEntry {
  id: string;
  time: string;
  unit: string;
  priority: Priority;
  incident: string;
  location: string;
  status: "dispatched" | "en_route" | "on_scene" | "completed" | "standby";
  eta?: string;
  officer: string;
}

export const dispatchLog: DispatchEntry[] = [
  { id: "D-501", time: "22:14", unit: "PCR-42", priority: "critical", incident: "Armed robbery response — Jayanagar", location: "Bengaluru South", status: "en_route", eta: "4 min", officer: "Insp. Anjali Rao" },
  { id: "D-502", time: "22:08", unit: "PCR-88", priority: "critical", incident: "Weapon detection — CAM-118", location: "Karol Bagh, Delhi", status: "on_scene", officer: "ACP Kabir Verma" },
  { id: "D-503", time: "21:52", unit: "ANPR-07", priority: "high", incident: "Vehicle intercept — KA-05-BX-2214", location: "Bommanahalli", status: "completed", officer: "Insp. Anjali Rao" },
  { id: "D-504", time: "21:20", unit: "PCR-44", priority: "high", incident: "Delayed check-in follow-up", location: "Hebbal Flyover", status: "on_scene", officer: "SI Manoj Bhat" },
  { id: "D-505", time: "20:44", unit: "PCR-23", priority: "medium", incident: "Homicide scene cordon — Salt Lake", location: "Bidhannagar", status: "en_route", eta: "12 min", officer: "Insp. Debjit Ghosh" },
  { id: "D-506", time: "20:10", unit: "PCR-17", priority: "medium", incident: "Chain snatching patrol sweep", location: "Bandra West", status: "dispatched", eta: "8 min", officer: "Insp. Farah Sheikh" },
  { id: "D-507", time: "19:30", unit: "PCR-56", priority: "low", incident: "Border checkpoint reinforcement", location: "Loni Border", status: "standby", officer: "SI Yashwant Kumar" },
];

// ─── Intelligence Briefings ────────────────────────────────────
export interface Briefing {
  id: string;
  title: string;
  classification: "restricted" | "confidential" | "internal";
  author: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  readTime: string;
}

export const briefings: Briefing[] = [
  { id: "IB-301", title: "Weekly Crime Pattern Analysis — Karnataka Zone", classification: "restricted", author: "Crime Analytics Unit", publishedAt: "2026-07-22 06:00", summary: "42% spike in armed robbery across Bengaluru South. Jayanagar cluster shows repeat MO matching Naidu Ring profile.", tags: ["Pattern Analysis", "Karnataka"], readTime: "8 min" },
  { id: "IB-302", title: "OTP Fraud Cartel — Multi-State Intelligence Dossier", classification: "confidential", author: "Cyber Crime Division", publishedAt: "2026-07-21 14:30", summary: "Sundar Halwai network expanded to 6 new mule accounts. Financial trail links to Jamtara cluster with ₹3.2 Cr losses.", tags: ["Cyber", "Organised Crime"], readTime: "12 min" },
  { id: "IB-303", title: "Criminal Network Graph Update — Q3 2026", classification: "internal", author: "Intelligence Bureau Liaison", publishedAt: "2026-07-20 09:00", summary: "New alliance edge detected between C-9012 and C-9902. Shared safe-house in Ghaziabad corridor flagged.", tags: ["Networks", "Gangs"], readTime: "6 min" },
  { id: "IB-304", title: "Predictive Hotspot Forecast — Delhi NCR", classification: "restricted", author: "AI Predictive Unit", publishedAt: "2026-07-19 18:00", summary: "Karol Bagh and Loni Border projected elevated risk through Jul 28. Recommend increased PCR presence 19:00–23:00.", tags: ["Predictive", "Delhi"], readTime: "5 min" },
  { id: "IB-305", title: "Forensic Backlog Status — Northern Region", classification: "internal", author: "FSL Coordination", publishedAt: "2026-07-18 11:00", summary: "14 pending ballistics analyses. EV-2404 country pistol match expected within 48 hours.", tags: ["Forensics", "Operations"], readTime: "4 min" },
];

// ─── Audit trail ─────────────────────────────────────────────────
export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  module: string;
  detail: string;
  ip: string;
}

export const auditLog: AuditEntry[] = [
  { id: "AU-7001", timestamp: "2026-07-22 22:14", actor: "Insp. Anjali Rao", role: "Officer", action: "DISPATCH", module: "Dispatch Center", detail: "PCR-42 dispatched to Jayanagar armed robbery", ip: "10.42.18.7" },
  { id: "AU-7002", timestamp: "2026-07-22 22:08", actor: "ACP Kabir Verma", role: "Officer", action: "ACK_ALERT", module: "Alerts", detail: "Critical alert A-9000 acknowledged — weapon detection", ip: "10.42.19.2" },
  { id: "AU-7003", timestamp: "2026-07-22 21:45", actor: "Ravi Shankar", role: "Commissioner", action: "EXPORT", module: "Reports", detail: "Crime report CSV exported — 12 records", ip: "10.42.1.1" },
  { id: "AU-7004", timestamp: "2026-07-22 20:30", actor: "Analyst Priya M.", role: "Analyst", action: "VIEW", module: "Criminal Networks", detail: "Network graph accessed — C-9012 cluster", ip: "10.42.22.5" },
  { id: "AU-7005", timestamp: "2026-07-22 19:15", actor: "Insp. Anjali Rao", role: "Officer", action: "CREATE_FIR", module: "Cases", detail: "New FIR VK-BLR-2024-0430 — deepfake extortion", ip: "10.42.18.7" },
  { id: "AU-7006", timestamp: "2026-07-22 18:00", actor: "System", role: "System", action: "AUTO", module: "Evidence Vault", detail: "Chain of custody updated — EV-2404 transferred to FSL Rohini", ip: "127.0.0.1" },
  { id: "AU-7007", timestamp: "2026-07-22 16:22", actor: "Insp. Debjit Ghosh", role: "Officer", action: "ASSIGN", module: "Patrol", detail: "PCR-23 assigned to Salt Lake homicide cordon", ip: "10.42.33.8" },
  { id: "AU-7008", timestamp: "2026-07-22 14:00", actor: "Ravi Shankar", role: "Commissioner", action: "SETTINGS", module: "Settings", detail: "Notification preferences updated", ip: "10.42.1.1" },
];
