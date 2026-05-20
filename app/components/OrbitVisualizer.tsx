"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  longitude: number;
  onLongitudeChange: (v: number) => void;
}

export default function OrbitVisualizer({ longitude, onLongitudeChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [eclipseMode, setEclipseMode] = useState(false);
  const [showOrbits, setShowOrbits] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const draw = (t: number) => {
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      ctx.clearRect(0, 0, W, H);

      // Deep space background
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.8);
      bg.addColorStop(0, "#0D1421");
      bg.addColorStop(0.5, "#0A1018");
      bg.addColorStop(1, "#060C12");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Stars
      ctx.save();
      for (let i = 0; i < 80; i++) {
        const sx = (((i * 197 + 73) * 7919) % W);
        const sy = (((i * 331 + 11) * 6271) % H);
        const br = 0.3 + 0.7 * ((i * 1723) % 100) / 100;
        const flicker = 0.6 + 0.4 * Math.sin(t * 0.8 + i * 1.7);
        ctx.globalAlpha = br * flicker * 0.8;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6 + (i % 3) * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      const earthR = Math.min(W, H) * 0.19;

      // Eclipse shadow (if enabled)
      if (eclipseMode) {
        const shadowGrad = ctx.createRadialGradient(cx - earthR * 2.5, cy, 0, cx, cy, earthR * 5);
        shadowGrad.addColorStop(0, "rgba(0,0,0,0)");
        shadowGrad.addColorStop(0.5, "rgba(0,0,0,0)");
        shadowGrad.addColorStop(0.7, "rgba(0,0,0,0.3)");
        shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = shadowGrad;
        ctx.fillRect(0, 0, W, H);
      }

      // GEO orbit ring
      const geoR = earthR * 2.8;
      if (showOrbits) {
        // Van Allen belt hints
        ctx.beginPath();
        ctx.arc(cx, cy, earthR * 1.5, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100,150,255,0.05)";
        ctx.lineWidth = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, earthR * 2.2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100,150,255,0.04)";
        ctx.lineWidth = 12;
        ctx.stroke();

        // LEO orbit
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.arc(cx, cy, earthR * 1.35, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);

        // MEO orbit
        ctx.beginPath();
        ctx.setLineDash([3, 5]);
        ctx.arc(cx, cy, earthR * 2.1, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);

        // GEO ring — main
        const geoGrad = ctx.createConicGradient(t * 0.2, cx, cy);
        geoGrad.addColorStop(0, "rgba(200,164,74,0.7)");
        geoGrad.addColorStop(0.25, "rgba(200,164,74,0.2)");
        geoGrad.addColorStop(0.5, "rgba(200,164,74,0.7)");
        geoGrad.addColorStop(0.75, "rgba(200,164,74,0.2)");
        geoGrad.addColorStop(1, "rgba(200,164,74,0.7)");
        ctx.beginPath();
        ctx.arc(cx, cy, geoR, 0, Math.PI * 2);
        ctx.strokeStyle = geoGrad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // GEO label
        ctx.font = "500 8px Inter, sans-serif";
        ctx.fillStyle = "rgba(200,164,74,0.5)";
        ctx.letterSpacing = "2px";
        ctx.fillText("GEO  35,786 km", cx + geoR + 6, cy - 4);
        ctx.fillText("LEO", cx + earthR * 1.35 + 4, cy - 2);
      }

      // Earth
      const earthGrad = ctx.createRadialGradient(
        cx - earthR * 0.3, cy - earthR * 0.3, 0,
        cx, cy, earthR
      );
      earthGrad.addColorStop(0, "#4A90D9");
      earthGrad.addColorStop(0.3, "#2A6CB8");
      earthGrad.addColorStop(0.7, "#1A4A80");
      earthGrad.addColorStop(1, "#0D2040");
      ctx.beginPath();
      ctx.arc(cx, cy, earthR, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Continents (simplified shapes)
      ctx.save();
      ctx.clip();
      ctx.rotate(t * 0.015); // Very slow Earth rotation
      ctx.translate(cx, cy);

      // Simple continent blobs
      const continents = [
        { x: -0.15, y: -0.35, rx: 0.22, ry: 0.28, rot: 0.3 },  // Americas
        { x: 0.12, y: -0.3, rx: 0.18, ry: 0.25, rot: -0.2 },   // Europe/Africa
        { x: 0.4, y: -0.2, rx: 0.28, ry: 0.32, rot: 0.1 },      // Asia
        { x: 0.5, y: 0.3, rx: 0.14, ry: 0.12, rot: 0.4 },       // Australia
      ];
      continents.forEach(c => {
        ctx.save();
        ctx.rotate(c.rot);
        ctx.beginPath();
        ctx.ellipse(c.x * earthR, c.y * earthR, c.rx * earthR, c.ry * earthR, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(56,140,58,0.35)";
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // Atmosphere glow
      const atmGrad = ctx.createRadialGradient(cx, cy, earthR * 0.85, cx, cy, earthR * 1.2);
      atmGrad.addColorStop(0, "rgba(100,180,255,0)");
      atmGrad.addColorStop(0.5, "rgba(80,160,255,0.12)");
      atmGrad.addColorStop(1, "rgba(40,100,200,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, earthR * 1.2, 0, Math.PI * 2);
      ctx.fillStyle = atmGrad;
      ctx.fill();

      // Equatorial plane
      ctx.beginPath();
      ctx.moveTo(cx - geoR, cy);
      ctx.lineTo(cx + geoR, cy);
      ctx.strokeStyle = "rgba(255,255,255,0.05)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite position on GEO ring
      const satAngle = (longitude / 360) * Math.PI * 2 - Math.PI / 2;
      const satX = cx + Math.cos(satAngle) * geoR;
      const satY = cy + Math.sin(satAngle) * geoR;

      // Coverage cone
      const coneAngle = 0.14; // ~8° half-cone
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      const a1 = satAngle + Math.PI / 2 + coneAngle;
      const a2 = satAngle + Math.PI / 2 - coneAngle;
      ctx.lineTo(cx + Math.cos(a1) * (geoR * 0.72), cy + Math.sin(a1) * (geoR * 0.72));
      ctx.lineTo(cx + Math.cos(a2) * (geoR * 0.72), cy + Math.sin(a2) * (geoR * 0.72));
      ctx.closePath();
      ctx.fillStyle = "rgba(200,164,74,0.06)";
      ctx.fill();
      ctx.strokeStyle = "rgba(200,164,74,0.2)";
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Coverage arc on Earth
      ctx.beginPath();
      const arcStart = satAngle + coneAngle * 3.5;
      const arcEnd = satAngle - coneAngle * 3.5;
      ctx.arc(cx, cy, earthR, arcStart + Math.PI / 2, arcEnd + Math.PI / 2);
      ctx.strokeStyle = "rgba(200,164,74,0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Signal lines (animated)
      const pulseLine = (t * 2) % 1;
      const lineX = cx + Math.cos(a1) * (earthR * 1.05) + (satX - cx - Math.cos(a1) * earthR * 1.05) * pulseLine;
      const lineY = cy + Math.sin(a1) * (earthR * 1.05) + (satY - cy - Math.sin(a1) * earthR * 1.05) * pulseLine;
      ctx.beginPath();
      ctx.moveTo(satX, satY);
      ctx.lineTo(lineX, lineY);
      ctx.strokeStyle = `rgba(200,164,74,${0.8 * (1 - pulseLine)})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // Satellite icon
      const pulseScale = 1 + 0.1 * Math.sin(t * 3);
      ctx.save();
      ctx.translate(satX, satY);
      ctx.rotate(satAngle + Math.PI / 2);
      ctx.scale(pulseScale, pulseScale);

      // Satellite body
      ctx.fillStyle = "#C89038";
      ctx.beginPath();
      ctx.rect(-4, -2.5, 8, 5);
      ctx.fill();

      // Solar panels
      ctx.fillStyle = "#1A3070";
      ctx.beginPath();
      ctx.rect(-16, -1.5, 9, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.rect(7, -1.5, 9, 3);
      ctx.fill();

      // Antenna dish
      ctx.fillStyle = "#D8D0C0";
      ctx.beginPath();
      ctx.arc(0, -5, 3, Math.PI, 0);
      ctx.fill();
      ctx.restore();

      // Glow ring around satellite
      const glowGrad = ctx.createRadialGradient(satX, satY, 0, satX, satY, 18);
      glowGrad.addColorStop(0, "rgba(200,164,74,0.4)");
      glowGrad.addColorStop(0.5, "rgba(200,164,74,0.1)");
      glowGrad.addColorStop(1, "rgba(200,164,74,0)");
      ctx.beginPath();
      ctx.arc(satX, satY, 18, 0, Math.PI * 2);
      ctx.fillStyle = glowGrad;
      ctx.fill();

      // Longitude label
      ctx.font = "bold 9px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`${longitude.toFixed(1)}°E`, satX + 20, satY - 8);

      // Orbital period info
      ctx.font = "500 8px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.fillText("T = 23h 56m 4s", 10, H - 10);

      timeRef.current = t;
    };

    let start: number;
    const animate = (ts: number) => {
      if (!start) start = ts;
      draw((ts - start) / 1000);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [longitude, eclipseMode, showOrbits]);

  return (
    <div className="h-full flex gap-3">
      {/* Canvas */}
      <div className="flex-1 relative rounded-xl overflow-hidden" style={{ background: "#0D1421" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={500}
          height={280}
          style={{ display: "block" }}
        />
      </div>

      {/* Controls */}
      <div className="w-48 flex flex-col gap-3 flex-shrink-0">
        <div className="metric-card flex-shrink-0">
          <p className="label-caps mb-2">Longitude</p>
          <input
            type="range"
            min={-180} max={180}
            value={longitude}
            onChange={(e) => onLongitudeChange(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "#C8A44A" }}
          />
          <p className="value-display mt-1" style={{ fontSize: "1rem", fontWeight: 700, color: "#C8A44A" }}>
            {longitude > 0 ? `${longitude.toFixed(1)}°E` : `${Math.abs(longitude).toFixed(1)}°W`}
          </p>
        </div>

        <div className="metric-card">
          <p className="label-caps mb-2">Orbit Parameters</p>
          <div className="space-y-1.5">
            {[
              { label: "Altitude", value: "35,786 km" },
              { label: "Period", value: "23h 56m" },
              { label: "Inclination", value: "0.05°" },
              { label: "Eccentricity", value: "0.0002" },
              { label: "RAAN", value: "302.1°" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span style={{ fontSize: "0.68rem", color: "#9E9D97" }}>{item.label}</span>
                <span className="value-display" style={{ fontSize: "0.68rem", fontWeight: 600, color: "#2C2B26" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="metric-card">
          <p className="label-caps mb-2">Visibility</p>
          <label className="flex items-center gap-2 cursor-pointer mb-2">
            <input
              type="checkbox"
              checked={eclipseMode}
              onChange={(e) => setEclipseMode(e.target.checked)}
              style={{ accentColor: "#C8A44A" }}
            />
            <span style={{ fontSize: "0.72rem", color: "#706F68" }}>Eclipse Mode</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOrbits}
              onChange={(e) => setShowOrbits(e.target.checked)}
              style={{ accentColor: "#C8A44A" }}
            />
            <span style={{ fontSize: "0.72rem", color: "#706F68" }}>Show Orbits</span>
          </label>
        </div>

        <div className="metric-card">
          <p className="label-caps mb-1.5">Eclipse Season</p>
          <p style={{ fontSize: "0.7rem", color: "#706F68", lineHeight: 1.5 }}>
            Spring: Mar 1–Apr 11<br />
            Fall: Sep 1–Oct 11<br />
            Max: 72 min/day
          </p>
        </div>
      </div>
    </div>
  );
}
