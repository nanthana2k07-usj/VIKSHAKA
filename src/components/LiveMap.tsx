import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN ?? "";

const MOCK_INCIDENTS = [
  { id: "inc-1", lng: 77.5946, lat: 12.9716, title: "Armed robbery alert" },
  { id: "inc-2", lng: 77.6090, lat: 12.9833, title: "Suspicious vehicle reported" },
  { id: "inc-3", lng: 77.6200, lat: 12.9352, title: "Patrol assistance requested" },
];

function createMarker(
  map: mapboxgl.Map,
  lng: number,
  lat: number,
  title: string,
) {
  const el = document.createElement("div");
  el.className = "marker";
  el.style.width = "24px";
  el.style.height = "24px";
  el.style.backgroundImage =
    'url("data:image/svg+xml,%3Csvg fill=\'%23ff0000\' viewBox=\'0 0 24 24\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z\'/%3E%3C/svg%3E")';
  el.style.backgroundSize = "contain";
  el.style.backgroundRepeat = "no-repeat";
  el.style.cursor = "pointer";

  new mapboxgl.Marker(el)
    .setLngLat([lng, lat])
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(title))
    .addTo(map);
}

export default function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  // Fixed: Added missing refs
  const placedMarkerIds = useRef<Set<string>>(new Set());
  const timeoutIds = useRef<number[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [77.5946, 12.9716],
      zoom: 11,
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl());

    MOCK_INCIDENTS.forEach((incident, index) => {
      if (!mapInstance.current) return;

      const id = window.setTimeout(() => {
        if (!mapInstance.current) return;

        createMarker(
          mapInstance.current,
          incident.lng,
          incident.lat,
          incident.title,
        );

        placedMarkerIds.current.add(incident.id);
      }, index * 800);

      timeoutIds.current.push(id);
    });

    const intervalId = window.setInterval(() => {
      if (!mapInstance.current) return;

      const available = MOCK_INCIDENTS.filter(
        (inc) => !placedMarkerIds.current.has(inc.id),
      );

      const pool = available.length > 0 ? available : MOCK_INCIDENTS;

      const incident = pool[Math.floor(Math.random() * pool.length)];

      createMarker(
        mapInstance.current,
        incident.lng,
        incident.lat,
        incident.title,
      );

      placedMarkerIds.current.add(incident.id);
    }, 8000);

    return () => {
      window.clearInterval(intervalId);

      timeoutIds.current.forEach((id) => window.clearTimeout(id));
      timeoutIds.current = [];

      placedMarkerIds.current.clear();

      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-border bg-surface-2 p-6 text-center">
        <div className="space-y-2">
          <div className="text-xs font-mono uppercase tracking-widest text-warning">
            Mapbox token required
          </div>
          <p className="text-sm text-muted-foreground">
            Add <code>VITE_MAPBOX_TOKEN</code> to enable the live map feed in
            this panel.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-full w-full" />;
}