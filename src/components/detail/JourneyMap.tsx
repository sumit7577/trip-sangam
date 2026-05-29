"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type LngLatLike } from "maplibre-gl";
import { motion } from "framer-motion";
import { Maximize2, MapPin, Play, RotateCcw, X } from "lucide-react";
import type { JourneyStop } from "@/types";

import "maplibre-gl/dist/maplibre-gl.css";

// CartoCDN Positron raster basemap — free, no API key, hosted on
// AWS CloudFront so it's fast worldwide. We previously tried
// OpenFreeMap (vector tiles, same look as Mapbox) but their CDN was
// ~1.2s per tile and the first paint took 15-20s — too slow.
//
// Trade-off vs vector tiles: no 3D building extrusion, slightly less
// crisp zoom. Acceptable since the journey map is mostly about the
// animated route line and the day markers, not micro-detail.
//
// The {a,b,c,d} subdomains let MapLibre fetch tiles in parallel across
// 4 connections, dropping full-view load from ~3s to ~700ms.
const MAP_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    "carto-positron": {
      type: "raster",
      // Use 1x tiles. With @2x.png + tileSize:256 MapLibre v4 was
      // computing the wrong zoom level math and the canvas stayed blank
      // even though tiles fetched 200 OK — see Network panel showing
      // 100 reqs + 5.8 MB transferred but nothing painted. The 1x tiles
      // are still crisp at standard DPI and load roughly half the bytes.
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© CARTO · © OpenStreetMap",
      minzoom: 0,
      maxzoom: 19,
    },
  },
  layers: [
    // Cream background fallback so we never see a flash of white below
    // raster tiles, and so the map area looks intentional even before
    // tiles paint.
    { id: "bg", type: "background", paint: { "background-color": "#F5EDDD" } },
    { id: "carto-positron", type: "raster", source: "carto-positron" },
  ],
};

// Bezier-smoothed polyline through the journey stops. MapLibre draws
// LineString as straight segments; sampling a quadratic bezier between
// consecutive points adds the gentle curve from the old SVG map.
function smoothRoute(stops: JourneyStop[]): [number, number][] {
  if (stops.length < 2) return stops.map((s) => [s.lng, s.lat]);
  const out: [number, number][] = [];
  const STEPS = 32;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    const dx = b.lng - a.lng;
    const dy = b.lat - a.lat;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const k = 0.18 * len;
    const cx = (a.lng + b.lng) / 2 + nx * k;
    const cy = (a.lat + b.lat) / 2 + ny * k;
    for (let t = 0; t <= STEPS; t++) {
      const u = t / STEPS;
      const x = (1 - u) * (1 - u) * a.lng + 2 * (1 - u) * u * cx + u * u * b.lng;
      const y = (1 - u) * (1 - u) * a.lat + 2 * (1 - u) * u * cy + u * u * b.lat;
      out.push([x, y]);
    }
  }
  return out;
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
  // Stops without lat/lng can't be plotted. This happens when:
  // (a) editors created the stop via Wagtail admin but skipped the
  //     coordinate fields, or (b) the row predates migration 0006
  //     which dropped the old x/y normalized-SVG positioning.
  const stops = rawStops.filter(
    (s) => typeof s.lat === "number" && typeof s.lng === "number" &&
           !Number.isNaN(s.lat) && !Number.isNaN(s.lng),
  );

  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const jeepMarkerRef = useRef<maplibregl.Marker | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  const route = useMemo(() => smoothRoute(stops), [stops]);

  // useRef-backed mirror of activeStopId so the rAF loop can compare
  // without re-creating the closure every frame.
  const activeStopIdRef = useRef<string | null>(null);

  const startAnimation = useCallback(() => {
    const map = mapRef.current;
    const jeep = jeepMarkerRef.current;
    if (!map || !jeep || route.length < 2) return;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    setIsPlaying(true);
    setActiveStopId(stops[0]?.id ?? null);
    const DURATION_MS = 7000;
    const startTs = performance.now();

    const cum: number[] = [0];
    for (let i = 1; i < route.length; i++) {
      const [x1, y1] = route[i - 1];
      const [x2, y2] = route[i];
      cum.push(cum[i - 1] + Math.hypot(x2 - x1, y2 - y1));
    }
    const total = cum[cum.length - 1] || 1;

    function frame(now: number) {
      const t = Math.min(1, (now - startTs) / DURATION_MS);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const dist = eased * total;

      let lo = 0, hi = route.length - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] < dist) lo = mid; else hi = mid;
      }
      const segLen = cum[hi] - cum[lo] || 1;
      const segT = (dist - cum[lo]) / segLen;
      const [x1, y1] = route[lo];
      const [x2, y2] = route[hi];
      const lng = x1 + (x2 - x1) * segT;
      const lat = y1 + (y2 - y1) * segT;

      jeep!.setLngLat([lng, lat]);

      map!.easeTo({
        center: [lng, lat],
        duration: 120,
      });

      const closest = stops.reduce((best, s) => {
        const d = Math.hypot(s.lng - lng, s.lat - lat);
        return d < best.d ? { d, id: s.id } : best;
      }, { d: Infinity, id: stops[0]?.id ?? null });
      if (closest.id !== activeStopIdRef.current) {
        activeStopIdRef.current = closest.id;
        setActiveStopId(closest.id);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(frame);
      } else {
        setIsPlaying(false);
        animFrameRef.current = null;
        map!.fitBounds(bounds(stops), { padding: 80, duration: 1400, pitch: 30 });
      }
    }

    animFrameRef.current = requestAnimationFrame(frame);
  }, [route, stops]);

  // Build map once on mount.
  useEffect(() => {
    if (!containerRef.current || mapRef.current || stops.length === 0) return;

    // MapLibre v4 had a bug where passing both `bounds` and
    // `fitBoundsOptions.pitch` at construct time could leave the camera
    // in an invalid state and the canvas blank. Setting explicit
    // center/zoom on init, then fitBounds() after style.load works
    // reliably.
    const first = stops[0];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [first.lng, first.lat],
      zoom: 7,
      pitch: 30,
      attributionControl: false,
      pitchWithRotate: false,
      dragRotate: false,
    });
    mapRef.current = map;

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true, showCompass: false }), "top-right");
    // CartoCDN style declares its own attribution on the source, so the
    // default AttributionControl auto-aggregates it — no custom string needed.
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("style.load", () => {
      // Move camera to fit all stops now that the style is ready.
      // Doing this here (instead of in the constructor) avoids a v4 bug
      // where bounds+pitch at init left the canvas blank.
      map.fitBounds(bounds(stops), { padding: 80, pitch: 30, duration: 0 });

      // Route polyline. Dashed under-line + solid over-line so the
      // route stays readable over the busy basemap (contour lines, etc.)
      map.addSource("journey", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: route },
        },
      });
      map.addLayer({
        id: "journey-glow",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#2C3D2E",
          "line-width": 10,
          "line-opacity": 0.10,
          "line-blur": 4,
        },
      });
      map.addLayer({
        id: "journey-dash",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#1E2D5C",
          "line-width": 2.5,
          "line-opacity": 0.45,
          "line-dasharray": [2, 3],
        },
      });
      map.addLayer({
        id: "journey-line",
        type: "line",
        source: "journey",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#C9A876",
          "line-width": 3.5,
          "line-opacity": 0.95,
        },
      });

      // Stop markers.
      stops.forEach((s) => {
        const el = document.createElement("div");
        el.className =
          "group cursor-pointer transform-gpu transition-transform duration-200 ease-out";
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
            <span class="absolute inline-flex h-9 w-9 rounded-full bg-[#2C3D2E]/15 group-hover:scale-110 transition-transform"></span>
            <span class="relative flex h-5 w-5 items-center justify-center rounded-full bg-[#2C3D2E] ring-4 ring-white shadow-md text-[10px] font-bold text-white">${s.day}</span>
          </div>
          <div class="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/95 backdrop-blur px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm border border-ink/8 pointer-events-none">${s.name}</div>
        `;
        el.addEventListener("click", () => {
          setActiveStopId(s.id);
          activeStopIdRef.current = s.id;
          mapRef.current?.flyTo({
            center: [s.lng, s.lat],
            zoom: Math.max(map.getZoom(), 10),
            pitch: 40,
            duration: 1400,
            essential: true,
          });
        });
        new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([s.lng, s.lat])
          .addTo(map);
      });

      // Jeep marker.
      const jeepEl = document.createElement("div");
      jeepEl.className = "z-10";
      jeepEl.innerHTML = `
        <div class="relative flex h-10 w-10 items-center justify-center rounded-full bg-white ring-2 ring-[#2C3D2E] shadow-lift">
          <svg viewBox="0 0 24 24" fill="none" stroke="#2C3D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
            <path d="M5 17h14M3 13l2-5h14l2 5M5 17v2m14-2v2M7 17a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm10 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
          <span class="absolute -inset-1 rounded-full border-2 border-[#C9A876] animate-ping" style="animation-duration:1.6s"></span>
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
    };
  }, [route, stops]);

  // Auto-play once when the section scrolls into view.
  useEffect(() => {
    if (hasAutoPlayed || !sectionRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          obs.disconnect();
          setHasAutoPlayed(true);
          setTimeout(startAnimation, 1200);
        }
      },
      { threshold: 0.35 },
    );
    obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, [hasAutoPlayed, startAnimation]);

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

  if (stops.length === 0) return null;

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-5 py-14 sm:py-20 md:px-8 md:py-24">
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
            onClick={startAnimation}
            disabled={isPlaying}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium transition-colors hover:border-ink/40 disabled:opacity-50"
          >
            {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? "Travelling…" : "Replay journey"}
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink/90"
          >
            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
          </button>
        </div>
      </div>

      <div
        className={
          isFullscreen
            ? "fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm"
            : "relative mt-10 overflow-hidden rounded-3xl border border-ink/8 bg-sand p-2 shadow-soft"
        }
      >
        <div
          className={
            isFullscreen
              ? "relative h-full w-full"
              : "relative aspect-[2/1] w-full overflow-hidden rounded-2xl"
          }
        >
          <div ref={containerRef} className="absolute inset-0" />

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
                onClick={startAnimation}
                disabled={isPlaying}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-lift transition-colors hover:bg-white/90 disabled:opacity-60"
              >
                {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                {isPlaying ? "Travelling…" : "Replay"}
              </button>
            </div>
          )}
        </div>

        {!isFullscreen && (
          <div className="mt-2 flex gap-2 md:hidden">
            <button
              onClick={startAnimation}
              disabled={isPlaying}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink/5 py-3 text-sm font-medium transition-colors hover:bg-ink/10 disabled:opacity-50"
            >
              {isPlaying ? <RotateCcw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? "Travelling…" : "Replay"}
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
                  zoom: Math.max(mapRef.current.getZoom(), 10),
                  pitch: 40,
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
