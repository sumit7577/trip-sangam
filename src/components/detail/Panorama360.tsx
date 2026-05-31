"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import "@photo-sphere-viewer/core/index.css";

/**
 * Interactive 360° viewer for an equirectangular image (2:1). Rendered via
 * Photo Sphere Viewer (three.js). Loaded with next/dynamic ssr:false so the
 * heavy WebGL deps stay out of the initial bundle and only download when a
 * stop's panorama is opened. Google Street View / iframe embeds are handled
 * separately by the caller (see isEmbedPanorama).
 *
 * `compact` renders the small docked map preview: no navbar, gently
 * auto-rotating like Google Maps' Street View mini panel.
 */
export function Panorama360({
  src,
  caption,
  compact = false,
}: {
  src: string;
  caption: string;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const viewer = new Viewer({
      container: ref.current,
      panorama: src,
      caption,
      loadingTxt: "Loading 360°…",
      navbar: compact ? false : ["zoom", "move", "caption", "fullscreen"],
      touchmoveTwoFingers: false,
      mousewheel: !compact,
      defaultZoomLvl: 0,
      plugins: [
        [AutorotatePlugin, { autostartDelay: compact ? 1000 : 4000, autorotateSpeed: "0.4rpm" }],
      ],
    });
    return () => viewer.destroy();
  }, [src, caption, compact]);

  return <div ref={ref} className="aspect-[16/10] w-full bg-ink" />;
}
