"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

interface RoundCarouselImage { src: string; }
interface RoundCarouselProps {
  images?: RoundCarouselImage[];
  imageWidth?: number;
  imageHeight?: number;
  spacing?: number;
  speed?: number;
  direction?: "right" | "left";
  drag?: boolean;
  sensitivity?: number;
  tilt?: number;
  perspective?: number;
  cornerRadius?: number;
  innerDim?: number;
  background?: string;
  style?: React.CSSProperties;
}
// Local, self-hosted inspiration imagery. Swap these for real SmartNest
// project photography when available — keep the files in /public/images.
const DEFAULT_IMAGES: RoundCarouselImage[] = [
  { src: "/images/scene-villa-dusk.jpg" },
  { src: "/images/scene-living-ambient.jpg" },
  { src: "/images/scene-bedroom.jpg" },
  { src: "/images/scene-kitchen.jpg" },
  { src: "/images/scene-cinema.jpg" },
  { src: "/images/scene-study.jpg" },
  { src: "/images/scene-terrace.jpg" },
  { src: "/images/scene-foyer.jpg" },
];
export default function RoundCarousel({ images = DEFAULT_IMAGES, imageWidth = 300, imageHeight = 300, spacing = 3, speed = 7, direction = "right", drag = true, sensitivity = 5, tilt = -7, perspective = 3000, cornerRadius = 22, innerDim = 3.5, background = "transparent", style = {} }: RoundCarouselProps) {
  const items = images.length > 0 ? images : DEFAULT_IMAGES;
  const count = items.length;
  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const rotYRef = useRef(0);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const dragRef = useRef({ active: false, x: 0 });
  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () => { ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`; };
    const draw = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      if (!dragRef.current.active) {
        if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else rotYRef.current += degPerSec * f;
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [radius, degPerSec]);
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, x: e.clientX };
    velRef.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current.active = false;
  };
  const faceBase: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: cornerRadius, overflow: "hidden", backfaceVisibility: "hidden", backgroundSize: "cover", backgroundPosition: "center" };
  return (
    <div style={{ ...style, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background, perspective: `${perspective}px`, cursor: drag ? "grab" : "default", touchAction: "pan-y" }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      <div style={{ transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg)` }}>
        <div ref={ringRef} style={{ position: "relative", width: imageWidth, height: imageHeight, transformStyle: "preserve-3d" }}>
          {items.map((img, i) => <div key={`${img.src}-${i}`} style={{ position: "absolute", inset: 0, transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`, transformStyle: "preserve-3d" }}>
            <div role="img" aria-label={`Interior inspiration ${i + 1}`} style={{ ...faceBase, backgroundColor: img.src ? "#202522" : "#222", backgroundImage: img.src ? `url(${img.src})` : undefined, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }} />
            <div aria-hidden="true" style={{ ...faceBase, transform: "rotateY(180deg)", backgroundColor: "#181818", backgroundImage: img.src ? `url(${img.src})` : undefined, filter: `brightness(${innerDim / 10})` }} />
          </div>)}
        </div>
      </div>
    </div>
  );
}
