"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const WORLD_PATHS: [string, string][] = [
  ["North America", "M 95,55 L 85,48 L 75,50 L 60,45 L 48,52 L 45,62 L 42,72 L 48,88 L 55,98 L 65,105 L 70,112 L 78,115 L 85,108 L 90,100 L 98,92 L 112,88 L 120,75 L 118,62 L 110,56 Z"],
  ["Central America", "M 78,118 L 72,122 L 68,130 L 75,135 L 80,130 L 82,124 Z"],
  ["South America", "M 100,130 L 88,128 L 80,138 L 75,152 L 78,170 L 85,185 L 92,198 L 100,208 L 110,212 L 118,200 L 122,182 L 120,160 L 115,145 L 108,135 Z"],
  ["Europe", "M 240,40 L 228,38 L 220,42 L 215,50 L 218,58 L 228,60 L 238,58 L 248,55 L 252,48 Z"],
  ["Scandinavia", "M 248,22 L 240,20 L 235,28 L 238,38 L 248,40 L 255,32 Z"],
  ["Africa", "M 228,75 L 218,72 L 210,78 L 208,90 L 210,108 L 215,128 L 222,148 L 232,162 L 242,168 L 252,162 L 258,148 L 255,128 L 250,108 L 248,90 L 242,78 Z"],
  ["Middle East", "M 268,65 L 255,62 L 250,68 L 252,80 L 262,82 L 275,78 L 278,68 Z"],
  ["South Asia", "M 308,72 L 295,68 L 285,75 L 282,90 L 288,105 L 300,110 L 312,105 L 318,92 L 315,78 Z"],
  ["East Asia", "M 355,42 L 340,40 L 328,48 L 325,62 L 330,78 L 342,82 L 358,78 L 365,62 L 360,50 Z"],
  ["Southeast Asia", "M 345,95 L 335,90 L 325,98 L 328,115 L 338,120 L 350,115 L 355,105 Z"],
  ["Indonesia", "M 360,118 L 348,115 L 340,120 L 338,130 L 348,135 L 362,132 L 368,122 Z M 375,120 L 368,118 L 362,122 L 362,132 L 372,135 L 380,128 Z M 390,115 L 382,112 L 375,118 L 378,128 L 388,130 L 396,122 Z"],
  ["Australia", "M 380,162 L 368,158 L 358,162 L 352,175 L 355,192 L 368,200 L 382,198 L 392,188 L 392,172 Z"],
  ["Japan", "M 385,58 L 378,55 L 372,62 L 375,72 L 385,72 L 390,65 Z"],
  ["UK/Ireland", "M 232,38 L 226,36 L 222,42 L 225,48 L 232,48 L 236,42 Z"],
  ["Russia", "M 260,15 L 245,12 L 235,18 L 240,28 L 260,30 L 320,25 L 360,20 L 355,12 L 330,10 L 295,12 Z"],
];

interface Props {
  longitude: number;
  rfPower: number;
  scenario: string;
}

export default function RFCoverageMap({ longitude, rfPower, scenario }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [showRain, setShowRain] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const [selectedBeam, setSelectedBeam] = useState(0);

  // Beam coverage zones centered on different coverage areas
  const BEAMS = [
    { id: 0, name: "Indonesia HTS", cx: 355, cy: 125, rx: 55, ry: 35, color: "#C8A44A" },
    { id: 1, name: "SE Asia Wide", cx: 330, cy: 110, rx: 80, ry: 55, color: "#3A78C9" },
    { id: 2, name: "India Spot", cx: 300, cy: 95, rx: 38, ry: 28, color: "#10B981" },
    { id: 3, name: "Pacific Steerable", cx: 400, cy: 100, rx: 60, ry: 45, color: "#A78BFA" },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let t = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Ocean background
      const ocean = ctx.createLinearGradient(0, 0, 0, H);
      ocean.addColorStop(0, "#0D1F35");
      ocean.addColorStop(1, "#0A1828");
      ctx.fillStyle = ocean;
      ctx.fillRect(0, 0, W, H);

      // Graticule (lat/lon grid)
      if (showGridlines) {
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= W; x += W / 12) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y <= H; y += H / 6) {
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }
        // Equator
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
        // Prime meridian
        ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();

        // Lat/Lon labels
        ctx.font = "8px Inter, sans-serif";
        ctx.fillStyle = "rgba(255,255,255,0.15)";
        ctx.fillText("0°", W/2 + 2, H/2 - 2);
        ctx.fillText("EQ", 2, H/2 - 2);
      }

      // Draw continents
      WORLD_PATHS.forEach(([name, path]) => {
        const p = new Path2D(path);
        ctx.fillStyle = name === "Indonesia"
          ? "rgba(200,164,74,0.4)"
          : "rgba(50,80,50,0.55)";
        ctx.fill(p);
        ctx.strokeStyle = name === "Indonesia"
          ? "rgba(200,164,74,0.7)"
          : "rgba(80,120,80,0.3)";
        ctx.lineWidth = name === "Indonesia" ? 1 : 0.5;
        ctx.stroke(p);
      });

      // Sub-satellite point (vertical line from sat to equator)
      const satX = ((longitude + 180) / 360) * W;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = "rgba(200,164,74,0.3)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(satX, 0);
      ctx.lineTo(satX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite position indicator at top
      ctx.fillStyle = "#C8A44A";
      ctx.beginPath();
      ctx.moveTo(satX, 0);
      ctx.lineTo(satX - 5, 8);
      ctx.lineTo(satX + 5, 8);
      ctx.closePath();
      ctx.fill();

      ctx.font = "bold 8px Inter, sans-serif";
      ctx.fillStyle = "rgba(200,164,74,0.8)";
      ctx.fillText(`SAT ${longitude}°E`, satX + 6, 14);

      // Rain attenuation overlay (tropical regions)
      if (showRain && scenario === "solar_storm") {
        const rainGrad = ctx.createRadialGradient(355, 125, 0, 355, 125, 80);
        rainGrad.addColorStop(0, "rgba(58,120,201,0.35)");
        rainGrad.addColorStop(0.5, "rgba(58,120,201,0.15)");
        rainGrad.addColorStop(1, "rgba(58,120,201,0)");
        ctx.fillStyle = rainGrad;
        ctx.beginPath();
        ctx.ellipse(355, 125, 80, 55, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw beam coverage ellipses
      BEAMS.forEach((beam) => {
        const isSelected = beam.id === selectedBeam;
        const pulseR = 1 + 0.05 * Math.sin(t * 2 + beam.id * 1.5);
        const opacity = rfPower / 100;

        // Outer glow
        const glowGrad = ctx.createRadialGradient(beam.cx, beam.cy, 0, beam.cx, beam.cy, beam.rx * 1.3);
        glowGrad.addColorStop(0, `${beam.color}20`);
        glowGrad.addColorStop(1, `${beam.color}00`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.ellipse(beam.cx, beam.cy, beam.rx * 1.3 * pulseR, beam.ry * 1.3 * pulseR, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fill
        ctx.save();
        ctx.globalAlpha = (isSelected ? 0.18 : 0.08) * opacity;
        const fillGrad = ctx.createRadialGradient(beam.cx, beam.cy, 0, beam.cx, beam.cy, beam.rx);
        fillGrad.addColorStop(0, beam.color);
        fillGrad.addColorStop(1, beam.color + "00");
        ctx.fillStyle = fillGrad;
        ctx.beginPath();
        ctx.ellipse(beam.cx, beam.cy, beam.rx * pulseR, beam.ry * pulseR, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Border
        ctx.save();
        ctx.globalAlpha = (isSelected ? 0.85 : 0.45) * opacity;
        ctx.strokeStyle = beam.color;
        ctx.lineWidth = isSelected ? 1.5 : 0.8;
        if (!isSelected) ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.ellipse(beam.cx, beam.cy, beam.rx * pulseR, beam.ry * pulseR, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // Center dot
        ctx.fillStyle = beam.color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        ctx.arc(beam.cx, beam.cy, isSelected ? 3 : 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Signal ripple animation (only selected)
        if (isSelected) {
          const rippleR = ((t * 25) % beam.rx);
          const rippleAlpha = Math.max(0, 1 - rippleR / beam.rx);
          ctx.save();
          ctx.globalAlpha = rippleAlpha * 0.5 * opacity;
          ctx.strokeStyle = beam.color;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(beam.cx, beam.cy, rippleR, rippleR * (beam.ry/beam.rx), 0, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Label
        ctx.font = `${isSelected ? "bold" : "normal"} 8px Inter, sans-serif`;
        ctx.fillStyle = beam.color;
        ctx.globalAlpha = (isSelected ? 0.9 : 0.55) * opacity;
        ctx.fillText(beam.name, beam.cx - beam.rx + 4, beam.cy - beam.ry - 4);
        ctx.globalAlpha = 1;
      });

      // Signal strength scale bar
      const scaleX = W - 80;
      const scaleY = H - 18;
      const scaleW = 70;
      const scaleGrad = ctx.createLinearGradient(scaleX, scaleY, scaleX + scaleW, scaleY);
      scaleGrad.addColorStop(0, "rgba(58,120,201,0.8)");
      scaleGrad.addColorStop(0.5, "rgba(200,164,74,0.8)");
      scaleGrad.addColorStop(1, "rgba(217,92,92,0.8)");
      ctx.fillStyle = scaleGrad;
      ctx.fillRect(scaleX, scaleY, scaleW, 4);
      ctx.font = "7px Inter, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText("Low", scaleX, scaleY - 2);
      ctx.fillText("High EIRP", scaleX + scaleW - 28, scaleY - 2);

      t += 0.016;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [longitude, rfPower, scenario, showRain, showGridlines, selectedBeam]);

  return (
    <div className="h-full flex gap-3">
      {/* Map canvas */}
      <div className="flex-1 relative rounded-xl overflow-hidden" style={{ background: "#0D1F35" }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          width={560}
          height={280}
          style={{ display: "block" }}
        />
      </div>

      {/* Controls */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto">
        {/* Beam selector */}
        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Active Beam</p>
          <div className="space-y-1.5">
            {BEAMS.map((beam) => (
              <button
                key={beam.id}
                onClick={() => setSelectedBeam(beam.id)}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 transition-all text-left"
                style={{
                  background: selectedBeam === beam.id ? `${beam.color}15` : "transparent",
                  border: `1px solid ${selectedBeam === beam.id ? beam.color + "40" : "transparent"}`,
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: beam.color }} />
                <span style={{ fontSize: "0.7rem", color: selectedBeam === beam.id ? beam.color : "#706F68", fontWeight: selectedBeam === beam.id ? 600 : 400 }}>
                  {beam.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Link budget */}
        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Link Budget</p>
          <div className="space-y-2">
            {[
              { label: "EIRP", value: `${(52 + (rfPower - 100) * 0.15).toFixed(1)} dBW`, color: "#C8A44A" },
              { label: "Path Loss", value: "205.8 dB", color: "#9E9D97" },
              { label: "G/T (Rx)", value: "5.2 dB/K", color: "#3A78C9" },
              { label: "Rain Margin", value: scenario === "solar_storm" ? "0.8 dB ⚠" : "3.2 dB", color: scenario === "solar_storm" ? "#E8943A" : "#3BA97B" },
              { label: "C/N₀", value: `${(76 + (rfPower - 100) * 0.2).toFixed(1)} dBHz`, color: "#10B981" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <span style={{ fontSize: "0.65rem", color: "#9E9D97" }}>{item.label}</span>
                <span className="value-display" style={{ fontSize: "0.65rem", fontWeight: 700, color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Overlays</p>
          <label className="flex items-center gap-2 cursor-pointer mb-1.5">
            <input type="checkbox" checked={showRain} onChange={e => setShowRain(e.target.checked)} style={{ accentColor: "#3A78C9" }} />
            <span style={{ fontSize: "0.7rem", color: "#706F68" }}>Rain Attenuation</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showGridlines} onChange={e => setShowGridlines(e.target.checked)} style={{ accentColor: "#9E9D97" }} />
            <span style={{ fontSize: "0.7rem", color: "#706F68" }}>Graticule Grid</span>
          </label>
        </div>

        {/* Frequency plan */}
        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Frequency Plan</p>
          {[
            { dir: "↑ Uplink", freq: "14.0–14.5 GHz", color: "#3A78C9" },
            { dir: "↓ Downlink", freq: "10.7–12.75 GHz", color: "#C8A44A" },
            { dir: "Polarization", freq: "RHCP / LHCP", color: "#10B981" },
          ].map((f, i) => (
            <div key={i} className="flex flex-col mb-2">
              <span style={{ fontSize: "0.6rem", color: f.color, fontWeight: 600 }}>{f.dir}</span>
              <span className="value-display" style={{ fontSize: "0.65rem", color: "#2C2B26" }}>{f.freq}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
