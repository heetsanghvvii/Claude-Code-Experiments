import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, FeatureCollection } from 'geojson';
import { circleRing } from '../lib/geo';
import { fmtAgo } from '../lib/clock';
import type { Fix } from '../hooks/useGeolocationSharing';

export interface MapMarker { id: string; label: string; lat: number; lng: number; accuracyM: number; recordedAtMs: number }

interface Props {
  center: { lat: number; lng: number };
  radiusM: number;
  own: Fix | null;
  /** Released runner snapshots (hunters only). Nothing else is ever invented. */
  markers: MapMarker[];
  nowMs: number;
  outside: boolean;
}

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: { osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, maxzoom: 19, attribution: '© OpenStreetMap contributors' } },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#12141c' } },
    { id: 'osm', type: 'raster', source: 'osm', paint: { 'raster-opacity': 0.75, 'raster-brightness-max': 0.7, 'raster-saturation': -0.4 } },
  ],
};

const fc = (features: Feature[]): FeatureCollection => ({ type: 'FeatureCollection', features });
const poly = (ring: [number, number][]): Feature => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } });

export default function ArenaMap({ center, radiusM, own, markers, nowMs, outside }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const ready = useRef(false);
  const dom = useRef(new Map<string, { m: maplibregl.Marker; label: HTMLElement }>());
  const followed = useRef(false);
  const [failed, setFailed] = useState<string | null>(null);

  useEffect(() => {
    if (!el.current) return;
    let m: maplibregl.Map;
    try {
      m = new maplibregl.Map({ container: el.current, style: STYLE, center: [center.lng, center.lat], zoom: 16, attributionControl: { compact: true } });
    } catch (e) {
      setFailed(e instanceof Error ? e.message : 'Map unavailable');
      return;
    }
    map.current = m;
    m.on('style.load', () => {
      m.addSource('arena', { type: 'geojson', data: fc([]) });
      m.addSource('acc', { type: 'geojson', data: fc([]) });
      m.addSource('me', { type: 'geojson', data: fc([]) });
      m.addLayer({ id: 'arena-fill', type: 'fill', source: 'arena', paint: { 'fill-color': '#b6ff3b', 'fill-opacity': 0.06 } });
      m.addLayer({ id: 'arena-line', type: 'line', source: 'arena', paint: { 'line-color': '#b6ff3b', 'line-width': 3, 'line-dasharray': [2, 2] } });
      m.addLayer({ id: 'acc-fill', type: 'fill', source: 'acc', paint: { 'fill-color': '#3bc9ff', 'fill-opacity': 0.18 } });
      m.addLayer({ id: 'acc-line', type: 'line', source: 'acc', paint: { 'line-color': '#3bc9ff', 'line-width': 1 } });
      m.addLayer({ id: 'me-dot', type: 'circle', source: 'me', paint: { 'circle-radius': 8, 'circle-color': '#3bc9ff', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } });
      ready.current = true;
      (m.getSource('arena') as maplibregl.GeoJSONSource).setData(fc([poly(circleRing(center, radiusM))]));
      m.fitBounds(boundsOf(center, radiusM), { padding: 30, animate: false });
      (el.current as HTMLElement).dataset.mapReady = '1';
    });
    m.on('error', () => undefined); // tile fetch failures (offline) must not crash the screen
    const markersMap = dom.current;
    return () => {
      ready.current = false;
      markersMap.forEach((v) => v.m.remove());
      markersMap.clear();
      m.remove();
      map.current = null;
    };
    // map is created once; props below are synced by separate effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready.current) return;
    (m.getSource('arena') as maplibregl.GeoJSONSource | undefined)?.setData(fc([poly(circleRing(center, radiusM))]));
  }, [center.lat, center.lng, radiusM]);

  useEffect(() => {
    const m = map.current;
    if (!m || !ready.current) return;
    const acc = m.getSource('acc') as maplibregl.GeoJSONSource | undefined;
    const me = m.getSource('me') as maplibregl.GeoJSONSource | undefined;
    if (!own) { acc?.setData(fc([])); me?.setData(fc([])); return; }
    acc?.setData(fc([poly(circleRing(own, Math.max(own.accuracyM, 1)))]));
    me?.setData(fc([{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [own.lng, own.lat] } }]));
  }, [own?.lat, own?.lng, own?.accuracyM, own === null]);

  // Markers for released runner snapshots (DOM markers so no glyph server is needed).
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const seen = new Set<string>();
    for (const k of markers) {
      seen.add(k.id);
      let entry = dom.current.get(k.id);
      if (!entry) {
        const wrap = document.createElement('div');
        wrap.className = 'mh-marker';
        wrap.innerHTML = '<div class="mh-marker-dot"></div><div class="mh-marker-label"></div>';
        entry = { m: new maplibregl.Marker({ element: wrap }).setLngLat([k.lng, k.lat]).addTo(m), label: wrap.querySelector('.mh-marker-label') as HTMLElement };
        dom.current.set(k.id, entry);
      }
      entry.m.setLngLat([k.lng, k.lat]);
      entry.label.textContent = `${k.label} · recorded ${fmtAgo(nowMs - k.recordedAtMs)}`;
    }
    for (const [id, e] of dom.current) if (!seen.has(id)) { e.m.remove(); dom.current.delete(id); }
  }, [markers, nowMs]);

  // Follow the player gently until they pan the map themselves.
  useEffect(() => {
    const m = map.current;
    if (!m || !own || followed.current) return;
    m.easeTo({ center: [own.lng, own.lat], duration: 600 });
  }, [own?.lat, own?.lng]);

  if (failed) return <div className="mh-map mh-map-failed" role="img" aria-label="Map unavailable">Map unavailable ({failed}). GPS and tagging still work.</div>;
  return (
    <div className={`mh-map ${outside ? 'mh-map-out' : ''}`}>
      <div ref={el} className="mh-map-canvas" data-testid="arena-map" />
      <button type="button" className="mh-recenter" onClick={() => { followed.current = false; const m = map.current; if (m) own ? m.easeTo({ center: [own.lng, own.lat], zoom: 17 }) : m.fitBounds(boundsOf(center, radiusM), { padding: 30 }); }}>
        Center
      </button>
    </div>
  );
}

function boundsOf(c: { lat: number; lng: number }, r: number): [[number, number], [number, number]] {
  const ring = circleRing(c, r, 8);
  const lngs = ring.map((p) => p[0]), lats = ring.map((p) => p[1]);
  return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}
