import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LeafletCrimeMap } from "@/components/LeafletCrimeMap";
import LiveMap from "@/components/LiveMap";
import { db, type DbHotspot } from "@/lib/database";
import {
  MapPin, TrendingUp, AlertTriangle, Layers, Radio, Sparkles, Video, Car, Search, Download,
  X, CheckCircle2, ShieldAlert, Cpu, Eye, ArrowRight, Activity, ShieldCheck, Zap, Navigation, Plane, Volume2, Shield
} from "lucide-react";
import { useSession } from "@/lib/auth";
import { can } from "@/lib/rbac";

export const Route = createFileRoute("/hotspots")({
  head: () => ({
    meta: [
      { title: "Crime Hotspots & DFR Drone Command · VIKSHAKA" },
      { name: "description", content: "Geospatial crime hotspot map, CRT tactical dispatch, autonomous DFR drone launcher, and acoustic gunshot sensors." },
      { property: "og:title", content: "Crime Hotspots & DFR Drone Command · VIKSHAKA" },
      { property: "og:description", content: "Geospatial hotspot map, DFR drone launch, acoustic triangulation, and CRT dispatch." },
    ],
  }),
  component: HotspotsPage,
});

export interface CrtUnit {
  id: string;
  callsign: string;
  commander: string;
  specialization: "Rapid Response" | "Tactical Intervention" | "Perimeter Containment" | "K9 & Narcotics";
  status: "ready" | "dispatched" | "on_scene" | "busy";
  vitals: { heartRate: number; stress: string };
  location: string;
  lat: number;
  lng: number;
  assignedHotspotId?: string;
  dispatchProtocol?: string;
  etaMinutes?: number;
}

const riskBg: Record<DbHotspot["risk"], string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  elevated: "bg-warning/10 text-warning border-warning/30",
  moderate: "bg-accent/10 text-accent border-accent/30",
  low: "bg-primary/10 text-primary border-primary/30",
};

export function HotspotsPage() {
  const { session } = useSession();
  const [hotspotsList, setHotspotsList] = useState<DbHotspot[]>([]);
  const [selected, setSelected] = useState<DbHotspot | null>(null);
  const [mapEngine, setMapEngine] = useState<"leaflet" | "live_mapbox">("leaflet");
  
  // Interactive Filters & AI Forecast Modes
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [timeHorizon, setTimeHorizon] = useState<"now" | "2h" | "12h" | "24h">("now");
  const [isPredictiveRiskMode, setIsPredictiveRiskMode] = useState(false);

  // New Features State
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [droneProgress, setDroneProgress] = useState(0);
  const [blockadeRadius, setBlockadeRadius] = useState<"500m" | "1km" | "3km">("1km");
  const [showAcousticSensors, setShowAcousticSensors] = useState(false);

  // CRT (Crime Response Team) Workflow State
  const [crtUnits, setCrtUnits] = useState<CrtUnit[]>([
    {
      id: "crt-1",
      callsign: "CRT-ALPHA-1",
      commander: "Capt. Vikram Rathore (CRT Lead)",
      specialization: "Rapid Response",
      status: "ready",
      vitals: { heartRate: 72, stress: "normal" },
      location: "Bengaluru South HQ",
      lat: 12.9716,
      lng: 77.5946,
    },
    {
      id: "crt-2",
      callsign: "CRT-BRAVO-TACTICAL",
      commander: "Inspector Suresh Naik",
      specialization: "Tactical Intervention",
      status: "ready",
      vitals: { heartRate: 81, stress: "normal" },
      location: "Indiranagar Station",
      lat: 12.9784,
      lng: 77.6408,
    },
    {
      id: "crt-3",
      callsign: "CRT-DELTA-CONTAINMENT",
      commander: "Sub-Inspector Ananya Roy",
      specialization: "Perimeter Containment",
      status: "ready",
      vitals: { heartRate: 78, stress: "normal" },
      location: "Central Delhi Outpost",
      lat: 28.6518,
      lng: 77.1906,
    },
  ]);

  const [isCrtModalOpen, setIsCrtModalOpen] = useState(false);
  const [selectedCrtUnit, setSelectedCrtUnit] = useState<CrtUnit | null>(null);
  const [selectedProtocol, setSelectedProtocol] = useState<string>("Rapid Intervention & Containment");
  const [activeDispatchLog, setActiveDispatchLog] = useState<{ crtName: string; area: string; protocol: string; eta: number } | null>(null);
  const [isCameraFeedOpen, setIsCameraFeedOpen] = useState(false);

  // Sync real-time database
  useEffect(() => {
    const update = () => {
      const dbHotspots = db.getHotspots();
      setHotspotsList(dbHotspots);
      if (!selected && dbHotspots.length > 0) {
        setSelected(dbHotspots[0]);
      }
    };

    update();
    const unsub = db.subscribe(update);
    return () => unsub();
  }, []);

  const total30d = hotspotsList.reduce((s, h) => s + h.incidents30d, 0);
  const criticalCount = hotspotsList.filter((h) => h.risk === "critical").length;

  // Filtered hotspots list
  const filteredHotspots = hotspotsList.filter((h) => {
    const matchesSearch = h.area.toLowerCase().includes(searchQuery.toLowerCase()) || h.district.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === "all" || h.risk === riskFilter;
    return matchesSearch && matchesRisk;
  });

  // Calculate distance & ETA between selected hotspot and CRT unit
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Autonomous DFR Drone Dispatch Feature
  const handleLaunchDrone = () => {
    if (!selected) return;
    setIsDroneActive(true);
    setDroneProgress(15);
    toast.success(`AUTONOMOUS DFR DRONE SENTINEL-9 LAUNCHED`, {
      description: `Targeting ${selected.area}. 4K Thermal Stream broadcasting to command console. Arrival in 45s.`,
    });

    const interval = setInterval(() => {
      setDroneProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 20;
      });
    }, 1000);
  };

  // CRT Dispatch Workflow Execution
  const executeCrtDispatch = () => {
    if (!selected || !selectedCrtUnit) return;
    if (!can(session?.role, "action:dispatch")) {
      toast.error("Dispatch requires Officer clearance");
      return;
    }

    const dist = calculateDistanceKm(selected.lat, selected.lng, selectedCrtUnit.lat, selectedCrtUnit.lng);
    const calculatedEta = Math.max(3, Math.round(dist * 2.5));

    setCrtUnits((prev) =>
      prev.map((u) =>
        u.id === selectedCrtUnit.id
          ? {
              ...u,
              status: "dispatched",
              assignedHotspotId: selected.id,
              dispatchProtocol: selectedProtocol,
              etaMinutes: calculatedEta,
              vitals: { heartRate: 98, stress: "elevated" },
            }
          : u
      )
    );

    db.dispatchPatrol(selectedCrtUnit.callsign, selected.area);

    setActiveDispatchLog({
      crtName: selectedCrtUnit.callsign,
      area: selected.area,
      protocol: selectedProtocol,
      eta: calculatedEta,
    });

    setIsCrtModalOpen(false);
    toast.success(`CRT COMMAND DISPATCH EXECUTED`, {
      description: `${selectedCrtUnit.callsign} dispatched to ${selected.area} under protocol '${selectedProtocol}'. ETA: ${calculatedEta} mins`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Geospatial Action Bar */}
      <div className="flex items-end justify-between flex-wrap gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-1 font-bold">
              <Zap className="size-3" /> CRT Command Center & Spatial Feed
            </span>
            {isPredictiveRiskMode && (
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent/20 text-accent border border-accent/40 animate-pulse">
                🔮 AI 24H SPATIAL FORECAST ACTIVE
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold mt-1">Crime Hotspots & Autonomous DFR Drone Command</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {hotspotsList.length} tracked hotspots · {total30d} incidents in last 30 days · {criticalCount} critical risk zones
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Horizon Selector */}
          <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-border">
            {(["now", "2h", "12h", "24h"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeHorizon(t)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                  timeHorizon === t ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "now" ? "Real-time" : `+${t}`}
              </button>
            ))}
          </div>

          {/* DFR Autonomous Drone Launch Button */}
          <button
            onClick={handleLaunchDrone}
            className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 shadow-glow hover:opacity-90 transition-all"
          >
            <Plane className="size-3.5" /> Launch Autonomous DFR Drone
          </button>

          {/* Acoustic Sensor Toggle */}
          <button
            onClick={() => {
              setShowAcousticSensors(!showAcousticSensors);
              toast.info(showAcousticSensors ? "Acoustic sensor overlay hidden." : "Acoustic Gunshot & Sound Triangulation Array Active!");
            }}
            className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showAcousticSensors ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface hover:bg-muted text-foreground"
            }`}
          >
            <Volume2 className="size-3.5" /> Acoustic Triangulation
          </button>

          {/* Map Engine Switcher */}
          <div className="flex gap-1 p-1 rounded-lg bg-surface-2 border border-border">
            <button
              onClick={() => setMapEngine("leaflet")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mapEngine === "leaflet" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" /> Heatmap Layer
            </button>
            <button
              onClick={() => setMapEngine("live_mapbox")}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition-all ${
                mapEngine === "live_mapbox" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Radio className="size-3.5 text-destructive animate-pulse" /> Live Mapbox Feed
            </button>
          </div>
        </div>
      </div>

      {/* DFR DRONE AIRBORNE STATUS BANNER */}
      {isDroneActive && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 flex items-center justify-between gap-4 reveal shadow-xl">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/40 animate-pulse">
              <Plane className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-primary font-bold tracking-widest">
                AUTONOMOUS DFR DRONE SENTINEL-9 AIRBORNE
              </div>
              <div className="text-sm font-bold text-foreground">
                Cruising at 120m Altitude ➔ En Route to {selected?.area}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-36 bg-surface-2 rounded-full h-2 overflow-hidden border border-border">
              <div className="bg-primary h-full transition-all" style={{ width: `${droneProgress}%` }} />
            </div>
            <span className="font-mono text-xs font-bold text-primary">{droneProgress}% Flight Target</span>
            <button onClick={() => setIsDroneActive(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Recall Drone
            </button>
          </div>
        </div>
      )}

      {/* ACOUSTIC GUNSHOT SENSOR TRIANGULATION ARRAY */}
      {showAcousticSensors && (
        <div className="rounded-xl border border-accent/40 bg-accent/5 p-4 flex items-center justify-between gap-4 reveal shadow-lg">
          <div className="flex items-center gap-3">
            <Volume2 className="size-6 text-accent animate-pulse" />
            <div>
              <div className="text-[10px] font-mono uppercase text-accent font-bold tracking-widest">
                ACOUSTIC TRIANGULATION ARRAY ACTIVE (12 SENSORS ONLINE)
              </div>
              <div className="text-xs font-mono text-foreground mt-0.5">
                Sensor #104: 114dB Gunshot Pattern Triangulated at {selected?.area} (Accuracy: 12 meters)
              </div>
            </div>
          </div>
          <span className="px-3 py-1 rounded bg-accent text-accent-foreground font-mono text-xs font-bold">
            114 dB DETECTED
          </span>
        </div>
      )}

      {/* Main Map & CRT Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Canvas */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface p-4 h-[620px] relative overflow-hidden flex flex-col">
          {mapEngine === "leaflet" ? (
            <LeafletCrimeMap onSelect={(h: any) => setSelected(h)} selectedId={selected?.id} />
          ) : (
            <div className="w-full h-full rounded-lg overflow-hidden relative">
              <LiveMap />
              <div className="absolute top-3 left-3 bg-black/80 backdrop-blur px-3 py-1.5 rounded-md border border-white/10 text-white font-mono text-[10px] flex items-center gap-2">
                <span className="size-2 rounded-full bg-success pulse-dot" />
                <span>LIVE WEBSOCKET SPATIAL STREAM · MAPBOX PLATFORM</span>
              </div>
            </div>
          )}

          {/* Active CRT Dispatch Overlay Banner */}
          {activeDispatchLog && (
            <div className="absolute bottom-6 left-6 right-6 bg-surface/95 backdrop-blur-md p-4 rounded-xl border-2 border-primary/60 text-xs flex items-center justify-between z-20 reveal shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/40 animate-pulse">
                  <Navigation className="size-5" />
                </div>
                <div>
                  <div className="font-mono text-[10px] text-primary uppercase font-bold tracking-wider">
                    CRT COMMAND DISPATCH ACTIVE
                  </div>
                  <div className="font-bold text-foreground text-sm">
                    {activeDispatchLog.crtName} ➔ {activeDispatchLog.area}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    Protocol: {activeDispatchLog.protocol} · Channel 4 Encrypted
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground font-mono font-bold text-xs animate-pulse">
                  ETA {activeDispatchLog.eta} MINS
                </span>
                <button
                  onClick={() => setActiveDispatchLog(null)}
                  className="text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Controls: CRT Command & Hotspot Selector */}
        <div className="space-y-4">
          
          {/* CRT Tactical Control Card for Selected Zone */}
          {selected && (
            <div className="rounded-xl border border-border bg-surface p-5 reveal space-y-4 shadow-lg">
              <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="size-3 text-primary" /> CRT Spatial Inspector
                  </div>
                  <h3 className="font-display font-bold text-lg mt-0.5">{selected.area}</h3>
                  <div className="text-xs text-muted-foreground">{selected.district}, {selected.state}</div>
                </div>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded border font-bold ${riskBg[selected.risk]}`}>
                  {selected.risk}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-surface-2 p-3 border border-border">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">30-Day Incidents</div>
                  <div className="font-display text-2xl font-bold mt-1 text-primary">{selected.incidents30d}</div>
                </div>
                <div className="rounded-lg bg-surface-2 p-3 border border-border">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">Primary Crime</div>
                  <div className="text-xs font-semibold mt-1 text-foreground leading-tight">{selected.primaryCrime}</div>
                </div>
              </div>

              {/* Perimeter Blockade Calculator */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                  <span>Automated Blockade Radius</span>
                  <span className="text-primary font-bold">{blockadeRadius} Containment</span>
                </div>
                <div className="flex gap-1">
                  {(["500m", "1km", "3km"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setBlockadeRadius(r);
                        toast.info(`Perimeter containment set to ${r} radius around ${selected.area}`);
                      }}
                      className={`flex-1 py-1 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                        blockadeRadius === r ? "bg-primary text-primary-foreground" : "bg-surface-2 border border-border text-muted-foreground"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* CRT Dispatch Trigger Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setIsCrtModalOpen(true)}
                  className="flex-1 py-3 rounded-xl bg-destructive text-destructive-foreground text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-glow"
                >
                  <Zap className="size-4" /> Initiate CRT Tactical Dispatch
                </button>
                <button
                  onClick={() => setIsCameraFeedOpen(true)}
                  className="py-3 px-3 rounded-xl border border-border bg-surface-2 hover:bg-muted text-xs font-semibold text-foreground flex items-center gap-1.5 transition-colors"
                  title="View Live CCTV Feed"
                >
                  <Video className="size-4 text-primary" /> CCTV
                </button>
              </div>
            </div>
          )}

          {/* Search & All Hotspots List */}
          <div className="rounded-xl border border-border bg-surface reveal flex flex-col">
            <div className="p-4 border-b border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm">All Hotspot Zones ({filteredHotspots.length})</h3>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">by risk level</span>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search zone name or district…"
                  className="w-full bg-surface-2 border border-border rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-primary/50"
                />
              </div>

              {/* Risk Filter Buttons */}
              <div className="flex gap-1 overflow-x-auto pb-1">
                {["all", "critical", "elevated", "moderate", "low"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold transition-colors ${
                      riskFilter === r ? "bg-primary text-primary-foreground" : "bg-surface-2 border border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[220px] overflow-y-auto divide-y divide-border">
              {filteredHotspots.map((h) => (
                <button
                  key={h.id}
                  onClick={() => setSelected(h)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted/40 transition-colors flex items-center gap-3 ${
                    selected?.id === h.id ? "bg-muted/40 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <MapPin className={`size-4 shrink-0 ${riskBg[h.risk].split(" ")[1]}`} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold truncate">{h.area}</div>
                    <div className="text-[10px] font-mono text-muted-foreground truncate">{h.district}</div>
                  </div>
                  <span className="font-mono text-xs font-bold">{h.incidents30d} inc</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* CRT COMMAND STATUS BOARD */}
      <div className="rounded-xl border border-border bg-surface p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">Active Force Assets</div>
            <h2 className="font-display text-xl font-bold mt-0.5">Crime Response Team (CRT) Tactical Status Board</h2>
          </div>
          <span className="text-xs font-mono px-3 py-1 rounded bg-success/10 text-success border border-success/30 font-bold">
            CRT Units Available: {crtUnits.filter((u) => u.status === "ready").length}/{crtUnits.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crtUnits.map((unit) => (
            <div
              key={unit.id}
              className={`rounded-xl border p-4 space-y-3 bg-surface-2 transition-all ${
                unit.status === "dispatched" ? "border-primary/50 bg-primary/5 shadow-glow" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-primary" /> {unit.callsign}
                </span>
                <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded border ${
                  unit.status === "dispatched" ? "bg-primary text-primary-foreground" : "bg-success/10 text-success border-success/30"
                }`}>
                  {unit.status === "dispatched" ? "DISPATCHED" : "READY / STANDBY"}
                </span>
              </div>

              <div className="text-xs font-semibold text-muted-foreground">{unit.commander}</div>
              <div className="text-[11px] font-mono text-accent">Specialization: {unit.specialization}</div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                <div className="bg-background/50 p-2 rounded border border-border">
                  <div className="text-muted-foreground">Heart Rate</div>
                  <div className="font-bold text-foreground">{unit.vitals.heartRate} BPM</div>
                </div>
                <div className="bg-background/50 p-2 rounded border border-border">
                  <div className="text-muted-foreground">Base Location</div>
                  <div className="font-bold text-foreground truncate">{unit.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CRT TACTICAL DISPATCH PROTOCOL */}
      {isCrtModalOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-destructive font-bold uppercase tracking-widest flex items-center gap-1">
                  <Zap className="size-3" /> TACTICAL RESPONSE OVERRIDE
                </span>
                <h3 className="font-display text-xl font-bold mt-0.5">CRT Dispatch for {selected.area}</h3>
                <div className="text-xs text-muted-foreground">{selected.district} · Risk Level: {selected.risk.toUpperCase()}</div>
              </div>
              <button
                onClick={() => setIsCrtModalOpen(false)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Step 1: Select CRT Unit */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground font-bold">1. Select CRT Unit:</label>
              <div className="space-y-2">
                {crtUnits.map((unit) => {
                  const dist = calculateDistanceKm(selected.lat, selected.lng, unit.lat, unit.lng);
                  const eta = Math.max(3, Math.round(dist * 2.5));
                  const isSelected = selectedCrtUnit?.id === unit.id;

                  return (
                    <div
                      key={unit.id}
                      onClick={() => setSelectedCrtUnit(unit)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                        isSelected ? "border-primary bg-primary/10 shadow-glow" : "border-border bg-surface-2 hover:bg-muted"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-2">
                          <Car className="size-4 text-primary" /> {unit.callsign}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{unit.commander} · {unit.specialization}</div>
                      </div>
                      <div className="text-right font-mono">
                        <div className="text-primary font-bold">{dist} km away</div>
                        <div className="text-[10px] text-muted-foreground">EST. ETA {eta} MINS</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Choose Protocol */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-muted-foreground font-bold">2. Select Response Protocol:</label>
              <select
                value={selectedProtocol}
                onChange={(e) => setSelectedProtocol(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs focus:outline-none focus:border-primary"
              >
                <option value="Rapid Intervention & Containment">Rapid Intervention & Containment Protocol</option>
                <option value="Armed Suspect Neutralization">Armed Suspect Neutralization Protocol</option>
                <option value="Perimeter Lockdown & ANPR Sweep">Perimeter Lockdown & ANPR Sweep Protocol</option>
                <option value="Hostage & Special Tactical Entry">Hostage & Special Tactical Entry Protocol</option>
              </select>
            </div>

            {/* Execute Button */}
            <button
              onClick={executeCrtDispatch}
              disabled={!selectedCrtUnit}
              className="w-full py-3.5 rounded-xl bg-destructive text-destructive-foreground font-bold text-xs flex items-center justify-center gap-2 shadow-glow hover:opacity-90 transition-all disabled:opacity-50"
            >
              <Zap className="size-4" /> AUTHORIZE CRT DISPATCH & ALERT COMMAND
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Live CCTV Feed Inspector */}
      {isCameraFeedOpen && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Video className="size-5 text-primary" />
                <div>
                  <h3 className="font-display text-lg font-bold">{selected.area} — CAM-44 Live Telemetry</h3>
                  <span className="text-[10px] font-mono text-success flex items-center gap-1">
                    <span className="size-2 rounded-full bg-success pulse-dot" /> STREAMING HD 1080P @ 60FPS
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsCameraFeedOpen(false)}
                className="size-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl bg-slate-950 border border-border overflow-hidden flex items-center justify-center">
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded font-mono text-[10px] text-white">
                CAM-44 · {selected.district} · AI MOTION DETECTOR ACTIVE
              </div>
              <div className="text-center space-y-2">
                <Radio className="size-10 text-primary mx-auto animate-pulse" />
                <div className="text-xs font-mono text-muted-foreground">LIVE OPTICAL FEED STREAMING</div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  toast.success("CCTV snapshot captured and saved to evidence dossier!");
                  setIsCameraFeedOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
              >
                Capture Snapshot & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
