"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type LngLatLike } from "maplibre-gl";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, MapPin, Pause, Play, RotateCcw, X } from "lucide-react";
import type { JourneyStop } from "@/types";

// Realistic driving speed for the car. Per-segment animation time
// is computed as distance / SPEED_KMH so the visual pace matches what
// you'd actually see going this fast at zoom 18+. A long-distance
// route (e.g. 240 km Raxaul → Departure) becomes a real 3-hour
// animation; the user can press Skip-to-next-stop to fast-forward.
const SPEED_KMH = 80;

// Pause between segments when the car arrives at a stop, with the
// "Day N · <stop name>" overlay showing.
const PAUSE_AT_STOP_MS = 5_000;

// Zoom level while the camera tracks the car. 18.7 puts us as close
// as OpenFreeMap can render — just the road and the car frame, with
// any nearby buildings rising tall around the path. Beyond z19 the
// over-zoomed vector tiles start looking smeared.
const FOLLOW_ZOOM = 18.7;

// Camera tilt while tracking the car. Higher pitch = more 3D / less
// top-down. 72° is close to MapLibre's max (75°) and matches a
// chase-cam angle.
const FOLLOW_PITCH = 72;


// Tint keyframes simulating a 24-hour cycle compressed into the
// traversal duration. The car drives at street level while the
// scene cycles morning → noon → golden hour → dusk → night.
// rgba strings instead of separate colour + opacity so framer can
// interpolate them as a single animatable value.
const DAY_NIGHT_KEYFRAMES = [
  "rgba(255, 200, 150, 0.18)", // 0.00  dawn — warm rosy glow
  "rgba(255, 240, 200, 0.05)", // 0.15  early morning, almost clear
  "rgba(255, 255, 255, 0.00)", // 0.35  bright noon, no tint
  "rgba(255, 200, 130, 0.16)", // 0.55  late afternoon warmth
  "rgba(255, 130, 80, 0.30)",  // 0.75  golden-hour / dusk orange
  "rgba(40, 50, 100, 0.45)",   // 0.90  twilight indigo
  "rgba(10, 15, 45, 0.55)",    // 1.00  full night
];
const DAY_NIGHT_TIMES = [0.0, 0.15, 0.35, 0.55, 0.75, 0.9, 1.0];

import "maplibre-gl/dist/maplibre-gl.css";

// OpenFreeMap "liberty" — vector tiles + style hosted free, no API key,
// no quota. 3D building extrusions are baked into the style so we get
// elevated city blocks at high zoom that match the reference design.
const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

// Public OSRM demo endpoint. No key, rate-limited, no SLA — fine for
// a low-traffic CMS-driven site. If treks return "no route" (most do,
// since EBC/Annapurna aren't on roads), the bezier curve fallback
// kicks in per segment.
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

type LngLat = [number, number];

// Per-segment route data: coords + total real-world distance in metres.
// Distance is OSRM-reported when available, haversine-summed for the
// bezier fallback. We need per-segment distance to pace each leg at
// SPEED_KMH independently — total-route math would over-compress
// shorter legs.
type Segment = { coords: LngLat[]; distanceM: number };

// In-module cache so re-renders / fullscreen toggles don't re-fetch
// the same route. Keyed by the serialised stops list.
const routeCache = new Map<string, Segment[]>();

// Haversine distance between two [lng, lat] points, in metres. Used
// to estimate distance for bezier fallback segments where OSRM
// returned nothing.
function haversineM(a: LngLat, b: LngLat): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function polylineDistanceM(coords: LngLat[]): number {
  let d = 0;
  for (let i = 1; i < coords.length; i++) d += haversineM(coords[i - 1], coords[i]);
  return d;
}

// Bezier-smoothed polyline between two stops. Quadratic bezier with a
// perpendicular control point so the fallback bows gently instead of
// being a dead straight segment. Used when OSRM has no route (treks,
// border crossings, etc.).
function bezierSegment(a: JourneyStop, b: JourneyStop, steps = 24): Segment {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const k = 0.18 * len;
  const cx = (a.lng + b.lng) / 2 + nx * k;
  const cy = (a.lat + b.lat) / 2 + ny * k;
  const coords: LngLat[] = [];
  for (let t = 0; t <= steps; t++) {
    const u = t / steps;
    const x = (1 - u) * (1 - u) * a.lng + 2 * (1 - u) * u * cx + u * u * b.lng;
    const y = (1 - u) * (1 - u) * a.lat + 2 * (1 - u) * u * cy + u * u * b.lat;
    coords.push([x, y]);
  }
  return { coords, distanceM: polylineDistanceM(coords) };
}

async function fetchOsrmSegment(a: JourneyStop, b: JourneyStop): Promise<Segment | null> {
  const url = `${OSRM_BASE}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
  try {
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    if (!r.ok) return null;
    const j: {
      routes?: { geometry: { coordinates: LngLat[] }; distance?: number }[];
    } = await r.json();
    const route = j.routes?.[0];
    const coords = route?.geometry?.coordinates;
    if (!coords || coords.length < 2) return null;
    return {
      coords,
      // OSRM returns distance in metres. Fall back to haversine just
      // in case the field is missing on some odd response.
      distanceM: route?.distance ?? polylineDistanceM(coords),
    };
  } catch {
    return null;
  }
}

// Resolve every consecutive pair through OSRM with bezier fallback.
// Returns one Segment per stop pair so the animator can pace each leg
// at SPEED_KMH independently and pause in between.
async function resolveRoute(stops: JourneyStop[]): Promise<Segment[]> {
  if (stops.length < 2) return [];
  const key = stops.map((s) => `${s.lat.toFixed(4)},${s.lng.toFixed(4)}`).join("|");
  const hit = routeCache.get(key);
  if (hit) return hit;

  const segments = await Promise.all(
    stops.slice(0, -1).map((a, i) => fetchOsrmSegment(a, stops[i + 1])),
  );

  const out: Segment[] = segments.map(
    (seg, i) => seg ?? bezierSegment(stops[i], stops[i + 1]),
  );
  routeCache.set(key, out);
  return out;
}

// Format milliseconds as "Xh YYm" / "MMm SSs" — used by the ETA pill.
// Always two-digit minutes/seconds so the pill width doesn't jitter.
function formatHm(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
}

function bounds(stops: JourneyStop[]): maplibregl.LngLatBoundsLike {
  const lngs = stops.map((s) => s.lng);
  const lats = stops.map((s) => s.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

export function JourneyMap({ stops: rawStops }: { stops: JourneyStop[] }) {
  // Stops without lat/lng can't be plotted. This happens when
  // editors created the stop via Wagtail admin but skipped the
  // coordinate fields. Filter them out so the map degrades gracefully.
  const stops = rawStops.filter(
    (s) => typeof s.lat === "number" && typeof s.lng === "number" &&
           !Number.isNaN(s.lat) && !Number.isNaN(s.lng),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const jeepMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const routeRef = useRef<Segment[]>([]);
  const styleLoadedRef = useRef(false);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Index into stops[] of the stop whose pause-overlay is currently
  // showing (null when the car is in motion).
  const [pausedAtStopIdx, setPausedAtStopIdx] = useState<number | null>(null);
  // Total scheduled trip duration in ms (sum of segment travel times
  // + pauses). Surfaced in the ETA pill.
  const [totalTripMs, setTotalTripMs] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const activeStopIdRef = useRef<string | null>(null);
  const [isUserPaused, setIsUserPaused] = useState(false);
  // Stop whose lightbox is currently open (null = none).
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  // Ref-backed handler used by the MapLibre marker's native onclick —
  // markers are imperative DOM nodes built in useEffect, so we can't
  // capture the latest setSelectedStopId closure directly without
  // re-running the effect (which would destroy + recreate the map).
  const openLightboxRef = useRef<(id: string) => void>(() => undefined);
  // Throttle speed/elapsed state updates to ~5 Hz so the rAF loop
  // doesn't trigger 60 React re-renders per second just for HUD pills.
  const lastHudUpdateRef = useRef<number>(0);
  // Mirror state in refs so the rAF loop can read current values
  // without re-creating its closure (state inside rAF would be stale).
  const isPausedRef = useRef<boolean>(false);
  const isUserPausedRef = useRef<boolean>(false);
  const speedKmhRef = useRef<number>(0);
  // Refs the HUD buttons mutate to control the running rAF animation
  // without re-creating its closure.
  const skipNextStopRef = useRef<() => void>(() => undefined);
  const togglePauseRef = useRef<() => void>(() => undefined);

  // Memoize a stable key for the stops so effects don't re-fire on
  // every parent render. JourneyStop[] identity changes per render
  // even when contents are unchanged.
  const stopsKey = useMemo(
    () => stops.map((s) => `${s.id}:${s.lat},${s.lng}`).join("|"),
    [stops],
  );

  // Current day derived from active stop. Drives the day banner +
  // day/night tint. Total days = the highest day index across all
  // stops, so we can normalise the night tint over the trip length.
  const totalDays = useMemo(
    () => stops.reduce((m, s) => Math.max(m, s.day), 1),
    [stops],
  );
  const currentDay = useMemo(() => {
    if (!activeStopId) return stops[0]?.day ?? 1;
    return stops.find((s) => s.id === activeStopId)?.day ?? 1;
  }, [activeStopId, stops]);

  // Day banner only — the day/night atmosphere is driven by the
  // continuous 24-hour cycle keyframes below, NOT by the journey day
  // count (which was confusing for editors who labelled day-1-only
  // packages).

  // Drive the camera from the world view down to the route. Mirrors the
  // Google Earth "fall from space" feel without an actual globe —
  // MapLibre stays Mercator-only, but with a long flyTo and a high
  // curve number the effect reads as a swoop down to the destination.
  const introFlyTo = useCallback(() => {
    const map = mapRef.current;
    if (!map || stops.length === 0) return;
    const first = stops[0];
    // 3D terrain auto-activates as zoom crosses 12 via the zoom
    // listener installed in style.load — no manual call needed here.
    map.flyTo({
      center: [first.lng, first.lat],
      zoom: FOLLOW_ZOOM,
      pitch: FOLLOW_PITCH,
      bearing: -25,
      curve: 2.4,
      speed: 0.5,
      essential: true,
    });
  }, [stops]);

  // Animate the jeep marker along the OSRM-resolved per-segment route.
  // Each segment is paced at SPEED_KMH (real driving time) and a
  // PAUSE_AT_STOP_MS pause separates each segment, during which the
  // "Day N · <stop>" overlay shows. The Skip button (via skipNextStopRef)
  // lets the user fast-forward the current schedule entry.
  const startAnimation = useCallback(() => {
    const map = mapRef.current;
    const jeep = jeepMarkerRef.current;
    const segments = routeRef.current;
    if (!map || !jeep || segments.length === 0) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Build per-segment cumulative-distance arrays for smooth lng/lat
    // interpolation as we sweep through each segment. Doing this up
    // front means the rAF loop only does a binary search per frame.
    type Cum = { segIdx: number; cum: number[]; total: number };
    const cums: Cum[] = segments.map((seg, segIdx) => {
      const cum: number[] = [0];
      for (let i = 1; i < seg.coords.length; i++) {
        cum.push(cum[i - 1] + haversineM(seg.coords[i - 1], seg.coords[i]));
      }
      return { segIdx, cum, total: cum[cum.length - 1] || 1 };
    });

    // Build the playback schedule: travel segment N, pause at stop N+1,
    // travel segment N+1, … etc. Distance/SPEED_KMH gives wall-clock
    // travel time in milliseconds.
    type Entry =
      | { kind: "travel"; segIdx: number; startMs: number; endMs: number }
      | { kind: "pause"; stopIdx: number; startMs: number; endMs: number };
    const schedule: Entry[] = [];
    let cursor = 0;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const ms = (seg.distanceM / 1000 / SPEED_KMH) * 3_600_000;
      schedule.push({ kind: "travel", segIdx: i, startMs: cursor, endMs: cursor + ms });
      cursor += ms;
      // Pause at every stop except the very last (the trip ends there).
      const stopIdx = i + 1;
      if (stopIdx < stops.length) {
        schedule.push({
          kind: "pause",
          stopIdx,
          startMs: cursor,
          endMs: cursor + PAUSE_AT_STOP_MS,
        });
        cursor += PAUSE_AT_STOP_MS;
      }
    }
    const totalMs = cursor;
    setTotalTripMs(totalMs);
    setElapsedMs(0);

    setIsPlaying(true);
    setIsPaused(false);
    setIsUserPaused(false);
    isUserPausedRef.current = false;
    setPausedAtStopIdx(null);
    setActiveStopId(stops[0]?.id ?? null);
    activeStopIdRef.current = stops[0]?.id ?? null;

    const startTs = performance.now();
    // Time offset used by Skip — when the user skips, we adjust elapsed
    // by adding to timeOffset so the rAF loop "advances" without
    // physically jumping the wall clock.
    let timeOffset = 0;
    // Accumulator for time spent in user-pause. We don't change startTs
    // because we want resume to pick up exactly where it stopped.
    let pauseAccumMs = 0;
    let userPauseStartedAt = 0;
    // Skip-in-flight guard so the rAF loop doesn't fight the flyTo's
    // own moveend handler while the camera arcs to the next stop.
    let skipping = false;

    togglePauseRef.current = () => {
      if (!isUserPausedRef.current) {
        // Pause requested. Capture timestamp + flip flag. The rAF loop
        // sees isUserPausedRef and stops touching the camera so the
        // user can pan/zoom freely.
        userPauseStartedAt = performance.now();
        isUserPausedRef.current = true;
        setIsUserPaused(true);
      } else {
        // Resume requested. Add the paused duration to the accumulator
        // so elapsed time computation continues seamlessly. Snap the
        // camera back to the car position before letting the rAF loop
        // take over again.
        pauseAccumMs += performance.now() - userPauseStartedAt;
        isUserPausedRef.current = false;
        setIsUserPaused(false);
        if (lastCarLngLat) {
          mapRef.current?.flyTo({
            center: lastCarLngLat,
            zoom: FOLLOW_ZOOM,
            pitch: FOLLOW_PITCH,
            bearing: lastCarBearing,
            duration: 900,
            essential: true,
          });
        }
      }
    };

    skipNextStopRef.current = () => {
      if (skipping) return;
      const elapsed = performance.now() - startTs + timeOffset - pauseAccumMs;
      const idx = schedule.findIndex((e) => elapsed < e.endMs);
      if (idx < 0 || idx >= schedule.length - 1) return;
      skipping = true;

      // Find the next "arrival at stop" — i.e. the next pause entry
      // (or end of schedule if we're already past the last pause).
      let target = schedule[idx].endMs + 1;
      let nextStopIdx = idx + 1;
      while (nextStopIdx < schedule.length && schedule[nextStopIdx].kind !== "pause") {
        nextStopIdx++;
      }
      if (nextStopIdx < schedule.length) {
        target = schedule[nextStopIdx].startMs + 1;
      }
      timeOffset += target - elapsed;

      // Smooth visual transition: dramatic flyTo with high curve so
      // the camera zooms out before zooming back in at the next stop.
      // The rAF loop is held off via `skipping=true` until moveend.
      const arrivalStopIdx = nextStopIdx < schedule.length
        ? (schedule[nextStopIdx] as Extract<Entry, { kind: "pause" }>).stopIdx
        : stops.length - 1;
      const arrivalStop = stops[arrivalStopIdx];
      mapRef.current?.flyTo({
        center: [arrivalStop.lng, arrivalStop.lat],
        zoom: FOLLOW_ZOOM,
        pitch: FOLLOW_PITCH,
        bearing: 0,
        curve: 1.8,
        speed: 0.9,
        essential: true,
      });
      mapRef.current?.once("moveend", () => {
        skipping = false;
      });
    };

    // Track last known car position so Resume can snap back to it
    // without waiting for the next frame.
    let lastCarLngLat: [number, number] | null = null;
    let lastCarBearing = 0;

    function frame(now: number) {
      // While the user has paused or a Skip flyTo is in flight, the
      // rAF loop just idles — no camera updates, no setLngLat. The
      // pause/skip handlers above own the camera during this time.
      if (isUserPausedRef.current || skipping) {
        animFrameRef.current = requestAnimationFrame(frame);
        return;
      }
      const elapsed = now - startTs + timeOffset - pauseAccumMs;
      if (now - lastHudUpdateRef.current > 200) {
        lastHudUpdateRef.current = now;
        setElapsedMs(elapsed);
      }

      // Find the current schedule entry. Linear scan is fine — schedules
      // are ≤21 entries (10 segments + 10 pauses).
      const entry = schedule.find((e) => elapsed < e.endMs);
      if (!entry) {
        // Trip complete. Terrain will auto-disable via the zoom
        // listener as the fitBounds zooms back out below z12.
        setIsPlaying(false);
        setIsPaused(false);
        setPausedAtStopIdx(null);
        setSpeedKmh(0);
        animFrameRef.current = null;
        map!.fitBounds(bounds(stops), { padding: 80, duration: 1400, pitch: 40, bearing: 0 });
        return;
      }

      if (entry.kind === "pause") {
        // Hold position at the stop, show overlay, speed = 0.
        const stop = stops[entry.stopIdx];
        jeep!.setLngLat([stop.lng, stop.lat]);
        lastCarLngLat = [stop.lng, stop.lat];
        if (!isPausedRef.current) {
          isPausedRef.current = true;
          setIsPaused(true);
          setPausedAtStopIdx(entry.stopIdx);
        }
        if (now - lastHudUpdateRef.current > 200 || speedKmhRef.current !== 0) {
          speedKmhRef.current = 0;
          setSpeedKmh(0);
        }
        if (activeStopIdRef.current !== stop.id) {
          activeStopIdRef.current = stop.id;
          setActiveStopId(stop.id);
        }
        animFrameRef.current = requestAnimationFrame(frame);
        return;
      }

      // Travel entry — interpolate along this segment's polyline.
      if (isPausedRef.current) {
        isPausedRef.current = false;
        setIsPaused(false);
        setPausedAtStopIdx(null);
      }
      const seg = segments[entry.segIdx];
      const cum = cums[entry.segIdx].cum;
      const total = cums[entry.segIdx].total;
      const t = Math.max(0, Math.min(1, (elapsed - entry.startMs) / (entry.endMs - entry.startMs)));
      const dist = t * total;

      let lo = 0, hi = seg.coords.length - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < dist) lo = mid; else hi = mid;
      }
      const segLen = cum[hi] - cum[lo] || 1;
      const segT = (dist - cum[lo]) / segLen;
      const [x1, y1] = seg.coords[lo];
      const [x2, y2] = seg.coords[hi];
      const lng = x1 + (x2 - x1) * segT;
      const lat = y1 + (y2 - y1) * segT;
      const heading = (Math.atan2(x2 - x1, y2 - y1) * 180) / Math.PI;

      jeep!.setLngLat([lng, lat]);
      lastCarLngLat = [lng, lat];
      lastCarBearing = heading;

      // Speed display = SPEED_KMH throughout the travel entry (we
      // paced the segment specifically to match this), capped at the
      // configured max. Throttled state update.
      if (now - lastHudUpdateRef.current > 200 || speedKmhRef.current !== SPEED_KMH) {
        speedKmhRef.current = SPEED_KMH;
        setSpeedKmh(SPEED_KMH);
      }

      map!.easeTo({
        center: [lng, lat],
        bearing: heading,
        zoom: FOLLOW_ZOOM,
        pitch: FOLLOW_PITCH,
        duration: 220,
        essential: true,
      });

      // Light up the corresponding stop chip — the closest of the two
      // bracketing the current segment.
      const segStop = stops[entry.segIdx + (t > 0.5 ? 1 : 0)];
      if (segStop && activeStopIdRef.current !== segStop.id) {
        activeStopIdRef.current = segStop.id;
        setActiveStopId(segStop.id);
      }

      animFrameRef.current = requestAnimationFrame(frame);
    }

    animFrameRef.current = requestAnimationFrame(frame);
  }, [stops]);

  // Build map once on mount. The container is a single sized div (no
  // nested absolute-inset wrapper) so MapLibre's own .maplibregl-map
  // position:relative doesn't collapse our box to 0×0.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || stops.length === 0) return;

    // Open framing the whole journey so the user can see the full
    // route + every stop before deciding to start. We fitBounds after
    // style.load too (in case the initial paint races the style), but
    // setting bounds on the constructor saves a re-fit.
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      bounds: bounds(stops),
      fitBoundsOptions: { padding: 60, pitch: 0 },
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;

    map.on("error", (e) => {
      // eslint-disable-next-line no-console
      console.error("[maplibre]", e?.error || e);
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("style.load", async () => {
      styleLoadedRef.current = true;

      // 3D terrain disabled — MapLibre's terrain rendering broke both
      // line layers (the pink route polyline disappeared) and the
      // chase-camera tracking at FOLLOW_ZOOM. Re-add as a polish item
      // after the core route + animation is rock-solid.

      // Fetch (or fall back to bezier) for every consecutive pair.
      // Cached after first run so fullscreen toggles don't re-fetch.
      const route = await resolveRoute(stops);
      routeRef.current = route;

      // OpenFreeMap Liberty defines a 3D building extrusion layer
      // automatically — toggle its visibility on so we get extruded
      // blocks in Kathmandu / Pokhara at zoom 14+. Catch-and-ignore in
      // case future style versions rename the layer.
      try {
        const buildingLayer = map.getStyle().layers?.find(
          (l) => l.id.includes("building") && l.type === "fill-extrusion",
        );
        if (buildingLayer) {
          map.setLayoutProperty(buildingLayer.id, "visibility", "visible");
        }
      } catch {
        /* style doesn't have a 3D building layer — skip */
      }

      // Flatten the per-segment array into a single polyline for
      // display. The animator still uses the per-segment data for
      // pacing; this is just the visible route line on the map.
      const flatCoords: LngLat[] = [];
      route.forEach((seg, i) => {
        // De-dup the junction between segments (last point of seg N is
        // first point of seg N+1) so the polyline doesn't draw a
        // zero-length segment over itself.
        const start = i === 0 ? 0 : 1;
        for (let j = start; j < seg.coords.length; j++) flatCoords.push(seg.coords[j]);
      });
      // eslint-disable-next-line no-console
      console.log(
        "[journey-map] polyline ready —",
        flatCoords.length,
        "vertices across",
        route.length,
        "segments",
      );
      map.addSource("journey", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: flatCoords },
        },
      });
      // Three-layer route stack so the line stands off the cream
      // OSM basemap at every zoom: soft drop-shadow → white casing
      // → pink stroke. Widths are tuned to be unmissable at the
      // overview zoom AND at the street-level FOLLOW_ZOOM (18.7).
      // Earlier I tried a zoom-interpolated width expression but it
      // silently rendered nothing — reverted to static widths.
      map.addLayer({
        id: "journey-shadow",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#000000",
          "line-width": 18,
          "line-opacity": 0.22,
          "line-blur": 6,
        },
      });
      map.addLayer({
        id: "journey-casing",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#FFFFFF",
          "line-width": 11,
          "line-opacity": 1.0,
        },
      });
      map.addLayer({
        id: "journey-line",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          // Vivid pink, per request. High contrast against cream OSM
          // basemap tiles and against the dusk/night tint applied
          // during traversal — stays legible end-to-end.
          "line-color": "#E91E63",
          "line-width": 6,
          "line-opacity": 1.0,
        },
      });
      // Direction arrows so the user can see "go this way" along the
      // polyline.
      map.addLayer({
        id: "journey-arrows",
        type: "symbol",
        source: "journey",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 90,
          "text-field": "▶",
          "text-size": 18,
          "text-keep-upright": false,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "#E91E63",
          "text-halo-width": 3,
        },
      });

      // Force the route layers to the top of the stack. OpenFreeMap
      // adds road-casing / road-fill layers AFTER style.load fires
      // (asynchronously, as the style continues hydrating), so layers
      // we addLayer'd here can end up underneath them — which is why
      // the pink line was being painted over by the yellow road.
      // moveLayer with no beforeId pushes the layer to the end of
      // the array = drawn last = on top.
      const liftJourneyLayers = () => {
        if (!mapRef.current) return;
        ["journey-shadow", "journey-casing", "journey-line", "journey-arrows"].forEach((id) => {
          try {
            if (mapRef.current!.getLayer(id)) mapRef.current!.moveLayer(id);
          } catch {}
        });
      };
      // Lift immediately, again on next paint (catches the typical
      // OpenFreeMap layer-add-after-styleload race), and one more
      // time on the first idle (covers slow networks where the style
      // finishes hydrating later still).
      liftJourneyLayers();
      requestAnimationFrame(liftJourneyLayers);
      map.once("idle", liftJourneyLayers);

      // Stop markers — badge shows the sequence number (1, 2, 3…),
      // pill below shows "Day N · <name>" so the user can see both
      // the visit order and which day each stop falls on. Order was
      // ambiguous before because the badge was the day and many
      // stops share the same day in a multi-stop city tour.
      stops.forEach((s, i) => {
        const seq = i + 1;
        const el = document.createElement("div");
        el.className = "group cursor-pointer transform-gpu transition-transform duration-200 ease-out";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-10 w-10 rounded-full bg-[#E91E63]/20 group-hover:scale-110 transition-transform"></span>
            <span class="relative flex h-7 w-7 items-center justify-center rounded-full bg-[#E91E63] ring-[3px] ring-white shadow-lg text-[12px] font-bold text-white">${seq}</span>
          </div>
          <div class="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-md border pointer-events-none bg-white text-ink border-ink/15 dark:bg-ink/95 dark:text-sand dark:border-sand/25">
            <span class="opacity-60">Day ${s.day} ·</span> ${s.name}
          </div>
        `;
        el.addEventListener("click", () => {
          setActiveStopId(s.id);
          activeStopIdRef.current = s.id;
          mapRef.current?.flyTo({
            center: [s.lng, s.lat],
            zoom: Math.max(map.getZoom(), 13),
            pitch: 55,
            duration: 1400,
            essential: true,
          });
          // Open the lightbox for this stop's photo + details. The
          // ref dispatches to the latest setter so re-renders pick up
          // the freshest setSelectedStopId without rebuilding markers.
          openLightboxRef.current(s.id);
        });
        new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([s.lng, s.lat])
          .addTo(map);
      });

      // Car marker — isometric 3/4-view car like Google Maps / Waze
      // navigation arrow. Drawn inline as SVG so we can colour it from
      // the brand palette without shipping a separate asset.
      // The inner #car-rotation wrapper is what we rotate to point
      // along the heading (the outer marker stays anchor-centered).
      const jeepEl = document.createElement("div");
      jeepEl.className = "z-10";
      jeepEl.innerHTML = `
        <div class="relative">
          <span class="absolute inset-0 -m-2 rounded-full bg-[#2C3D2E]/15 animate-ping" style="animation-duration:2.2s"></span>
          <div id="car-rotation" class="relative transition-transform duration-150 ease-out" style="transform: rotate(0deg);">
            <svg viewBox="0 0 64 64" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="carBody" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#5A8F5C"/>
                  <stop offset="1" stop-color="#2C3D2E"/>
                </linearGradient>
                <radialGradient id="carShadow" cx="0.5" cy="0.5" r="0.5">
                  <stop offset="0" stop-color="rgba(0,0,0,0.35)"/>
                  <stop offset="1" stop-color="rgba(0,0,0,0)"/>
                </radialGradient>
              </defs>
              <!-- ground shadow -->
              <ellipse cx="32" cy="58" rx="18" ry="3.5" fill="url(#carShadow)"/>
              <!-- car body (rounded rectangle) -->
              <rect x="14" y="14" width="36" height="40" rx="14" fill="url(#carBody)" stroke="#1B2A1D" stroke-width="1.5"/>
              <!-- hood highlight -->
              <rect x="18" y="18" width="28" height="10" rx="6" fill="#F5EDDD" opacity="0.85"/>
              <!-- windshield -->
              <rect x="20" y="20" width="24" height="6" rx="3" fill="#1E2D5C" opacity="0.85"/>
              <!-- side windows -->
              <rect x="18" y="32" width="6" height="10" rx="2" fill="#1E2D5C" opacity="0.6"/>
              <rect x="40" y="32" width="6" height="10" rx="2" fill="#1E2D5C" opacity="0.6"/>
              <!-- wheels -->
              <rect x="11" y="22" width="4" height="8" rx="1.5" fill="#1B2A1D"/>
              <rect x="49" y="22" width="4" height="8" rx="1.5" fill="#1B2A1D"/>
              <rect x="11" y="40" width="4" height="8" rx="1.5" fill="#1B2A1D"/>
              <rect x="49" y="40" width="4" height="8" rx="1.5" fill="#1B2A1D"/>
              <!-- direction triangle (front) -->
              <path d="M 32 6 L 38 16 L 26 16 Z" fill="#C9A876" stroke="#1B2A1D" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      `;
      const jeep = new maplibregl.Marker({ element: jeepEl, anchor: "center" })
        .setLngLat(stops[0] ? [stops[0].lng, stops[0].lat] : [0, 0])
        .addTo(map);
      jeepMarkerRef.current = jeep;
    });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
      jeepMarkerRef.current = null;
      styleLoadedRef.current = false;
      routeRef.current = [];
    };
  }, [stopsKey]);

  // User-initiated journey kickoff. The IntersectionObserver auto-play
  // was removed by request — the user wants to press a "Start journey"
  // button instead so the animation never runs without intent.
  // This handler waits for the route data + style.load, runs the
  // dramatic intro flyTo, then starts the car traversal.
  const startJourney = useCallback(() => {
    // Allow re-trigger for replay; only block if a traversal is
    // actively in progress (the rAF loop owns the camera + jeep).
    if (isPlaying) return;
    setSpeedKmh(0);
    setHasStarted(true);
    const start = performance.now();
    const tick = () => {
      if (routeRef.current.length > 1 || performance.now() - start > 6000) {
        introFlyTo();
        // After the flyTo settles (~5.5s for our curve/speed), begin
        // the car traversal.
        setTimeout(startAnimation, 5500);
        return;
      }
      window.setTimeout(tick, 120);
    };
    tick();
  }, [isPlaying, introFlyTo, startAnimation]);

  // Resize the map when toggling fullscreen so it fills the new container.
  useEffect(() => {
    if (!mapRef.current) return;
    const id = window.setTimeout(() => mapRef.current?.resize(), 320);
    return () => window.clearTimeout(id);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen is open.
  useEffect(() => {
    if (!isFullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isFullscreen]);

  // Keep the marker-click handler pointing at the current setter so
  // selecting a stop opens the lightbox even if the component has
  // re-rendered (which closures on the imperative marker DOM would
  // otherwise lose).
  openLightboxRef.current = (id) => setSelectedStopId(id);

  // ESC key closes the lightbox.
  useEffect(() => {
    if (!selectedStopId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedStopId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedStopId]);

  const selectedStop = selectedStopId
    ? stops.find((s) => s.id === selectedStopId) ?? null
    : null;

  if (stops.length === 0) return null;

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-5 py-14 sm:py-20 md:px-8 md:py-24">
      {/* Lightbox — fixed overlay above the map (and above MapLibre's
          own controls). Click outside / X button / Escape closes. */}
      <AnimatePresence>
        {selectedStop && (
          <motion.div
            key="stop-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
            onClick={() => setSelectedStopId(null)}
          >
            <motion.div
              key="stop-lightbox-card"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-lift dark:bg-ink dark:text-sand"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedStopId(null)}
                aria-label="Close"
                className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-md hover:bg-white dark:bg-ink/90 dark:text-sand dark:hover:bg-ink"
              >
                <X className="h-4 w-4" />
              </button>

              {selectedStop.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedStop.image}
                  alt={selectedStop.name}
                  className="block aspect-[16/10] w-full object-cover"
                />
              ) : (
                <div className="flex aspect-[16/10] w-full items-center justify-center bg-sand text-muted dark:bg-ink/70 dark:text-sand/60">
                  <div className="text-center">
                    <MapPin className="mx-auto h-8 w-8 opacity-60" />
                    <p className="mt-2 text-sm">
                      No photo uploaded for this stop yet.
                    </p>
                    <p className="text-xs opacity-70">
                      Editors can add one in Wagtail admin → Journey map stops.
                    </p>
                  </div>
                </div>
              )}

              <div className="p-5 md:p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-crimson">
                  Day {selectedStop.day} · Stop {stops.findIndex((s) => s.id === selectedStop.id) + 1} of {stops.length}
                </p>
                <h3 className="balance mt-1 font-serif text-2xl md:text-3xl">{selectedStop.name}</h3>
                <p className="mt-1 text-sm text-muted dark:text-sand/70">{selectedStop.activity}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-crimson">
            <span className="h-px w-8 bg-crimson" /> Your Journey
          </p>
          <h2 className="balance mt-3 font-serif text-4xl tracking-tight md:text-5xl">
            {stops[0].name} → {stops[stops.length - 1].name},<br />
            <span className="italic text-crimson">across {stops.length} stops.</span>
          </h2>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={startJourney}
            disabled={isPlaying}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/40 disabled:opacity-50"
          >
            {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? "Travelling…" : hasStarted ? "Replay journey" : "Start journey"}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
          </button>
        </div>
      </div>

      {/*
        MapLibre's own CSS class .maplibregl-map sets position:relative,
        which fights with `absolute inset-0`. The previous nested
        wrapper + absolute-inset combo collapsed the maplibre-map box
        to 0×0 — markers rendered (positioned via JS) but the basemap
        layer painted into zero space. Letting the containerRef own its
        aspect-ratio directly fixes the layout race.
      */}
      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 flex flex-col bg-ink/95 backdrop-blur-sm p-2"
            : "relative mt-10 rounded-3xl border border-ink/8 bg-sand p-2 shadow-soft"
        }
      >
        <div className={isFullscreen ? "relative flex-1 w-full" : "relative w-full"}>
          <div
            ref={containerRef}
            className={
              isFullscreen
                ? "absolute inset-0 overflow-hidden rounded-2xl"
                : "aspect-[2/1] w-full overflow-hidden rounded-2xl"
            }
          />

          {/* Day/night atmosphere — a single Framer Motion keyframe
              animation that runs in lock-step with the car traversal.
              When isPlaying flips true, the overlay cycles through
              dawn → noon → dusk → night over the same TRAVERSAL
              duration, simulating a 24-hour pass while you drive.
              When isPlaying is false, it resets to clear.
              pointer-events:none keeps zoom controls accessible. */}
          <motion.div
            aria-hidden
            initial={{ backgroundColor: "rgba(255,255,255,0)" }}
            animate={
              isPlaying
                ? { backgroundColor: DAY_NIGHT_KEYFRAMES }
                : { backgroundColor: "rgba(255,255,255,0)" }
            }
            transition={
              isPlaying
                ? {
                    // Day/night cycle compressed into one full trip length.
                    // Falls back to 2 min if the schedule hasn't computed
                    // yet so we never divide-by-zero or hand framer NaN.
                    duration: Math.max(totalTripMs, 120_000) / 1000,
                    times: DAY_NIGHT_TIMES,
                    ease: "linear",
                  }
                : { duration: 1.2, ease: "easeOut" }
            }
            className="pointer-events-none absolute inset-0 rounded-2xl mix-blend-multiply"
          />

          {/* Day banner — pops in when the active stop crosses into a
              new day. Keyed on currentDay so AnimatePresence swaps it
              on transitions; positioned top-center over the map. */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`day-${currentDay}`}
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2"
            >
              <div className="flex items-center gap-2 rounded-full bg-ink/90 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-sand shadow-lift backdrop-blur">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#C9A876]" />
                Day {currentDay} <span className="text-sand/50">of {totalDays}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Speedometer pill — only visible while the car is in motion.
              speedKmh is throttled to 5 Hz updates from the rAF loop so
              this re-renders ~5 times/sec, not 60. */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                key="speedo"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="pointer-events-none absolute bottom-4 left-4 z-20"
              >
                <div className="flex items-baseline gap-1.5 rounded-2xl bg-ink/85 px-3.5 py-2 text-white shadow-lift backdrop-blur">
                  <span className="font-mono text-2xl font-semibold leading-none tabular-nums">{speedKmh}</span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-sand/70">km/h</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ETA pill — bottom-right, shows elapsed / total trip time
              while playing so the user knows when the schedule ends. */}
          <AnimatePresence>
            {isPlaying && totalTripMs > 0 && (
              <motion.div
                key="eta"
                initial={{ opacity: 0, y: 12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.9 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="pointer-events-none absolute bottom-4 right-4 z-20"
              >
                <div className="flex items-center gap-2 rounded-2xl bg-ink/85 px-3.5 py-2 text-white shadow-lift backdrop-blur">
                  <span className="font-mono text-sm tabular-nums">{formatHm(elapsedMs)}</span>
                  <span className="text-[10px] text-sand/40">/</span>
                  <span className="font-mono text-sm tabular-nums text-sand/70">{formatHm(totalTripMs)}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pause/Resume + Skip controls — stacked top-right under
              the NavigationControl. Pause stops the rAF loop in place
              so the user can pan/zoom freely; Resume snaps back to the
              car position and continues the schedule. */}
          <AnimatePresence>
            {isPlaying && !isPaused && (
              <motion.div
                key="player-controls"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute right-4 top-16 z-20 flex flex-col items-end gap-2"
              >
                <button
                  onClick={() => togglePauseRef.current()}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-ink shadow-lift backdrop-blur hover:bg-white"
                  aria-label={isUserPaused ? "Resume journey" : "Pause journey"}
                >
                  {isUserPaused ? (
                    <>
                      <Play className="h-3 w-3" fill="currentColor" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-3 w-3" fill="currentColor" /> Pause
                    </>
                  )}
                </button>
                {!isUserPaused && (
                  <button
                    onClick={() => skipNextStopRef.current()}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-medium text-ink shadow-lift backdrop-blur hover:bg-white"
                  >
                    Skip <span aria-hidden>›</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pause overlay — when the car has arrived at a stop, show
              a small card with the stop info and the current day. */}
          <AnimatePresence>
            {isPaused && pausedAtStopIdx != null && stops[pausedAtStopIdx] && (
              <motion.div
                key={`pause-${pausedAtStopIdx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
              >
                <div className="rounded-2xl bg-ink/95 px-5 py-4 text-center text-white shadow-lift backdrop-blur">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#C9A876]">
                    Day {stops[pausedAtStopIdx].day} · Stop {pausedAtStopIdx + 1}
                  </p>
                  <p className="mt-1 font-serif text-xl">{stops[pausedAtStopIdx].name}</p>
                  <p className="mt-0.5 text-xs text-sand/70">{stops[pausedAtStopIdx].activity}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Big centered "Start journey" overlay — hidden once the
              user has kicked things off. We dim the map behind it so
              the call to action reads cleanly. */}
          {/* Floating Start-journey pill — anchored bottom-center so it
              doesn't cover the map. Disappears once the trip kicks off. */}
          <AnimatePresence>
            {!hasStarted && !isPlaying && (
              <motion.button
                key="start-pill"
                onClick={startJourney}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="group absolute bottom-4 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink/95 px-5 py-2.5 text-sm font-semibold text-white shadow-lift backdrop-blur transition-transform hover:scale-[1.03]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A876] text-ink transition-transform group-hover:translate-x-0.5">
                  <Play className="h-3.5 w-3.5" fill="currentColor" />
                </span>
                Start journey
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-lift transition-transform hover:scale-105"
            aria-label="Close fullscreen"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {isFullscreen && (
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
            <button
              onClick={startJourney}
              disabled={isPlaying}
              className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-lift transition-colors hover:bg-white/90 disabled:opacity-60"
            >
              {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "Travelling…" : hasStarted ? "Replay" : "Start journey"}
            </button>
          </div>
        )}

        {!isFullscreen && (
          <div className="mt-2 flex gap-2 md:hidden">
            <button
              onClick={startJourney}
              disabled={isPlaying}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink/5 py-3 text-sm font-medium transition-colors hover:bg-ink/10 disabled:opacity-50"
            >
              {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "Travelling…" : hasStarted ? "Replay" : "Start journey"}
            </button>
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white"
              aria-label="Open fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {stops.map((s) => {
          const isActive = s.id === activeStopId;
          return (
            <motion.button
              key={s.id}
              onClick={() => {
                setActiveStopId(s.id);
                activeStopIdRef.current = s.id;
                mapRef.current?.flyTo({
                  center: [s.lng, s.lat] as LngLatLike,
                  zoom: Math.max(mapRef.current.getZoom(), 13),
                  pitch: 55,
                  duration: 1400,
                });
              }}
              animate={{
                borderColor: isActive ? "rgba(176, 35, 46, 0.65)" : "rgba(0,0,0,0.08)",
                scale: isActive ? 1.02 : 1,
              }}
              className="flex items-start gap-2.5 rounded-2xl border bg-white p-3.5 text-left transition-shadow hover:shadow-soft"
            >
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-crimson" />
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">Day {s.day}</p>
                <p className="truncate text-sm font-semibold leading-tight text-ink">{s.name}</p>
                <p className="line-clamp-2 text-xs leading-snug text-muted">{s.activity}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
