import { useEffect, useRef } from "react";
import { hotspots, type Hotspot } from "@/lib/mock-data";

const riskColor: Record<Hotspot["risk"], string> = {
  critical: "#ef4444",
  elevated: "#f59e0b",
  moderate: "#06b6d4",
  low: "#3b82f6",
};

const riskRadius: Record<Hotspot["risk"], number> = {
  critical: 22,
  elevated: 17,
  moderate: 13,
  low: 10,
};

interface Props {
  onSelect?: (h: Hotspot) => void;
  selectedId?: string;
}

export function LeafletCrimeMap({ onSelect, selectedId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [22.9734, 78.6569],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
        attributionControl: true,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: "abcd",
        maxZoom: 19,
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);
      layerRef.current = layer;

      hotspots.forEach(h => {
        const color = riskColor[h.risk];
        const circle = L.circleMarker([h.lat, h.lng], {
          radius: riskRadius[h.risk] / 2,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.45,
        }).addTo(layer);
        circle.bindTooltip(
          `<strong>${h.area}</strong><br/>${h.district}<br/>${h.incidents30d} incidents · ${h.risk.toUpperCase()}`,
          { direction: "top", offset: [0, -6] }
        );
        (circle as any).__hid = h.id;
        circle.on("click", () => onSelectRef.current?.(h));
      });
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // highlight selected
  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.eachLayer((l: any) => {
      const isSel = l.__hid === selectedId;
      l.setStyle?.({ weight: isSel ? 4 : 2, fillOpacity: isSel ? 0.75 : 0.45 });
    });
  }, [selectedId]);

  return <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" style={{ background: "#0b1220" }} />;
}
