"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Grid, Environment } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import SatelliteModel from "./SatelliteModel";
import { SubsystemKey } from "./data";

interface Props {
  activeSubsystem: SubsystemKey | null;
  viewMode: "assembled" | "exploded" | "xray";
  onViewModeChange: (m: "assembled" | "exploded" | "xray") => void;
  onSelectSubsystem: (id: SubsystemKey) => void;
  onOpenAI: () => void;
  missionEffects: { rfPower: number; thermalState: number; attitudeError: number };
}

function CameraAutoRotate({ active }: { active: boolean }) {
  const { camera } = useThree();
  const t = useRef(0);
  useFrame((_, delta) => {
    if (!active) return;
    t.current += delta * 0.08;
    const r = 10;
    camera.position.x = Math.sin(t.current) * r;
    camera.position.z = Math.cos(t.current) * r;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Starfield() {
  return <Stars radius={80} depth={50} count={1200} factor={3} saturation={0} fade />;
}

function GroundGrid() {
  return (
    <Grid
      position={[0, -3.5, 0]}
      args={[24, 24]}
      cellSize={1}
      cellThickness={0.4}
      cellColor="#C8C0A8"
      sectionSize={4}
      sectionThickness={0.6}
      sectionColor="#C0B890"
      fadeDistance={18}
      fadeStrength={1.8}
      infiniteGrid
    />
  );
}

function SceneLighting() {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  useFrame((state) => {
    if (sunRef.current) {
      const t = state.clock.elapsedTime * 0.05;
      sunRef.current.position.set(
        Math.cos(t) * 8,
        4,
        Math.sin(t) * 8
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#FFF8F0" />
      <directionalLight
        ref={sunRef}
        intensity={2.2}
        color="#FFFAF0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-6, 4, -4]} intensity={0.5} color="#B0C8FF" />
      <pointLight position={[0, -4, 6]} intensity={0.25} color="#FFE0A0" />
    </>
  );
}

const VIEW_MODES = [
  { id: "assembled" as const, label: "Assembled", icon: "◈" },
  { id: "exploded" as const, label: "Exploded", icon: "⊕" },
  { id: "xray" as const, label: "X-Ray", icon: "◎" },
];

const QUICK_SUBSYSTEMS: { id: SubsystemKey; label: string; color: string }[] = [
  { id: "payload", label: "Payload", color: "#C8A44A" },
  { id: "solar", label: "Solar", color: "#EAB308" },
  { id: "adcs", label: "ADCS", color: "#A78BFA" },
  { id: "thermal", label: "Thermal", color: "#EF4444" },
  { id: "propulsion", label: "Prop", color: "#F97316" },
  { id: "eps", label: "EPS", color: "#F59E0B" },
  { id: "ttc", label: "TT&C", color: "#06B6D4" },
  { id: "obc", label: "OBC", color: "#10B981" },
];

export default function SpacecraftViewer({
  activeSubsystem,
  viewMode,
  onViewModeChange,
  onSelectSubsystem,
  onOpenAI,
  missionEffects,
}: Props) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [showStars, setShowStars] = useState(true);
  const controlsRef = useRef<any>(null);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl" style={{ background: "#0D1421" }}>
      {/* Canvas */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [5, 2.5, 8], fov: 42, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        onPointerMissed={() => {}}
      >
        <Suspense fallback={null}>
          <SceneLighting />
          {showStars && <Starfield />}
          <GroundGrid />

          <CameraAutoRotate active={autoRotate} />

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.06}
            minDistance={3}
            maxDistance={24}
            makeDefault
            onStart={() => setAutoRotate(false)}
          />

          <SatelliteModel
            activeSubsystem={activeSubsystem}
            viewMode={viewMode}
            onSelectSubsystem={(id) => {
              setAutoRotate(false);
              onSelectSubsystem(id);
            }}
            showLabels={showLabels}
            missionEffects={missionEffects}
          />

          {/* Environment for reflections */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Top toolbar */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        {/* View mode selector */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl pointer-events-auto"
          style={{
            background: "rgba(13,20,33,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.id}
              className={`toolbar-btn text-xs py-1.5 px-3`}
              style={{
                background: viewMode === mode.id ? "rgba(200,164,74,0.2)" : "transparent",
                border: viewMode === mode.id ? "1px solid rgba(200,164,74,0.4)" : "1px solid transparent",
                color: viewMode === mode.id ? "#C8A44A" : "rgba(255,255,255,0.5)",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.72rem",
                gap: "5px",
              }}
              onClick={() => onViewModeChange(mode.id)}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>

        {/* Controls */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl pointer-events-auto"
          style={{
            background: "rgba(13,20,33,0.75)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            className="toolbar-btn"
            style={{
              background: autoRotate ? "rgba(200,164,74,0.2)" : "transparent",
              border: autoRotate ? "1px solid rgba(200,164,74,0.4)" : "1px solid transparent",
              color: autoRotate ? "#C8A44A" : "rgba(255,255,255,0.5)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.72rem",
            }}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle auto-rotate"
          >
            ↻
          </button>
          <button
            className="toolbar-btn"
            style={{
              background: showLabels ? "rgba(200,164,74,0.2)" : "transparent",
              border: showLabels ? "1px solid rgba(200,164,74,0.4)" : "1px solid transparent",
              color: showLabels ? "#C8A44A" : "rgba(255,255,255,0.5)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.72rem",
            }}
            onClick={() => setShowLabels(!showLabels)}
            title="Toggle labels"
          >
            ◧
          </button>
          <button
            className="toolbar-btn"
            style={{
              background: "transparent",
              border: "1px solid transparent",
              color: "rgba(255,255,255,0.5)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.72rem",
            }}
            onClick={handleResetCamera}
            title="Reset camera"
          >
            ⊙
          </button>
          <button
            className="toolbar-btn"
            style={{
              background: showStars ? "rgba(91,156,246,0.2)" : "transparent",
              border: showStars ? "1px solid rgba(91,156,246,0.4)" : "1px solid transparent",
              color: showStars ? "#5B9CF6" : "rgba(255,255,255,0.5)",
              borderRadius: 8,
              padding: "6px 12px",
              fontSize: "0.72rem",
            }}
            onClick={() => setShowStars(!showStars)}
            title="Toggle starfield"
          >
            ✦
          </button>
        </div>
      </div>

      {/* Quick subsystem selector - bottom left */}
      <div
        className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-xs pointer-events-auto"
      >
        {QUICK_SUBSYSTEMS.map((sys) => (
          <motion.button
            key={sys.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setAutoRotate(false);
              onSelectSubsystem(sys.id);
            }}
            style={{
              background:
                activeSubsystem === sys.id
                  ? `rgba(${hexToRgb(sys.color)}, 0.2)`
                  : "rgba(13,20,33,0.7)",
              border: `1px solid ${
                activeSubsystem === sys.id
                  ? sys.color
                  : "rgba(255,255,255,0.1)"
              }`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: "0.65rem",
              fontWeight: 600,
              color: activeSubsystem === sys.id ? sys.color : "rgba(255,255,255,0.45)",
              backdropFilter: "blur(8px)",
              cursor: "pointer",
              letterSpacing: "0.04em",
              transition: "all 0.2s ease",
            }}
          >
            {sys.label}
          </motion.button>
        ))}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectSubsystem(null as unknown as SubsystemKey)}
          style={{
            background: !activeSubsystem ? "rgba(255,255,255,0.1)" : "rgba(13,20,33,0.7)",
            border: `1px solid ${!activeSubsystem ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
            borderRadius: 8,
            padding: "4px 10px",
            fontSize: "0.65rem",
            fontWeight: 600,
            color: !activeSubsystem ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
            backdropFilter: "blur(8px)",
            cursor: "pointer",
            letterSpacing: "0.04em",
            transition: "all 0.2s ease",
          }}
        >
          All
        </motion.button>
      </div>

      {/* AI tutor prompt - bottom right */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpenAI}
        className="absolute bottom-3 right-3 pointer-events-auto"
        style={{
          background: "rgba(13,20,33,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(200,164,74,0.25)",
          borderRadius: 12,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center text-xs animate-pulse-soft"
          style={{ background: "rgba(200,164,74,0.2)", color: "#C8A44A" }}
        >
          ◫
        </div>
        <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>
          Ask AI Tutor
        </span>
      </motion.button>

      {/* Active subsystem indicator */}
      <AnimatePresence>
        {activeSubsystem && (
          <motion.div
            key={activeSubsystem}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-[60px] left-1/2 -translate-x-1/2"
            style={{
              background: "rgba(13,20,33,0.8)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(200,164,74,0.3)",
              borderRadius: 10,
              padding: "6px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#C8A44A", boxShadow: "0 0 6px #C8A44A" }}
            />
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              {activeSubsystem.toUpperCase()} SELECTED — Click to deselect
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Satellite info overlay */}
      <div
        className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          background: "rgba(13,20,33,0.55)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 10,
          padding: "4px 14px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          GEO HTS Communications Satellite · 105.5°E
        </p>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "200, 164, 74";
}
