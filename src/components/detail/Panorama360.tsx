"use client";

import { useEffect, useRef } from "react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

/**
 * Interactive 360° viewer for an equirectangular image (2:1). Rendered via
 * Photo Sphere Viewer (three.js). Loaded with next/dynamic ssr:false so the
 * heavy WebGL deps stay out of the initial bundle and only download when a
 * stop's panorama lightbox is opened. Google Street View / iframe embeds are
 * handled separately by the caller (see isEmbedPanorama).
 */
export function Panorama360({ src, caption }: { src: string; caption: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const viewer = new Viewer({
      container: ref.current,
      panorama: src,
      caption,
      loadingTxt: "Loading 360°…",
      navbar: ["autorotate", "zoom", "caption", "fullscreen"],
      touchmoveTwoFingers: false,
      mousewheel: true,
      defaultZoomLvl: 0,
    });
    return () => viewer.destroy();
  }, [src, caption]);

  return <div ref={ref} className="aspect-[16/10] w-full bg-ink" />;
}
