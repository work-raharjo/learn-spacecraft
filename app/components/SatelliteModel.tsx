"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SubsystemKey } from "./data";

interface Props {
  activeSubsystem: SubsystemKey | null;
  viewMode: "assembled" | "exploded" | "xray";
  onSelectSubsystem: (id: SubsystemKey) => void;
  showLabels: boolean;
  missionEffects: { rfPower: number; thermalState: number; attitudeError: number };
}

// Exploded offsets for each subsystem group
const EXPLODED: Record<string, [number, number, number]> = {
  bus:        [0,    0,    0],
  eastWing:   [5.5,  0,    0],
  westWing:   [-5.5, 0,    0],
  payload:    [0,    0,    3.2],
  propulsion: [0,    0,   -3.2],
  thermal:    [0,    2.8,  0],
  adcs:       [0,   -2.8,  0],
  ttc:        [2.5,  2.0,  0],
};

const ASSEMBLED: Record<string, [number, number, number]> = {
  bus:        [0, 0, 0],
  eastWing:   [0, 0, 0],
  westWing:   [0, 0, 0],
  payload:    [0, 0, 0],
  propulsion: [0, 0, 0],
  thermal:    [0, 0, 0],
  adcs:       [0, 0, 0],
  ttc:        [0, 0, 0],
};

// Create solar cell canvas texture
function createSolarTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Base deep blue
  ctx.fillStyle = "#0C1830";
  ctx.fillRect(0, 0, size, size);

  // Subtle cell sheen
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "rgba(30,60,120,0.6)");
  grad.addColorStop(0.5, "rgba(15,35,80,0.3)");
  grad.addColorStop(1, "rgba(30,60,120,0.6)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Grid lines for individual cells
  ctx.strokeStyle = "rgba(40,80,160,0.6)";
  ctx.lineWidth = 1.5;
  const cols = 8, rows = 14;
  for (let i = 0; i <= cols; i++) {
    ctx.beginPath(); ctx.moveTo(i * size/cols, 0); ctx.lineTo(i * size/cols, size); ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath(); ctx.moveTo(0, i * size/rows); ctx.lineTo(size, i * size/rows); ctx.stroke();
  }

  // Cell highlight shimmer
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 3 === 0) {
        const x = c * size/cols + 2;
        const y = r * size/rows + 2;
        const w = size/cols - 4;
        const h = size/rows - 4;
        const cg = ctx.createLinearGradient(x, y, x+w, y+h);
        cg.addColorStop(0, "rgba(80,140,255,0.15)");
        cg.addColorStop(1, "rgba(20,60,160,0.05)");
        ctx.fillStyle = cg;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  return new THREE.CanvasTexture(canvas);
}

// Create MLI (gold thermal blanket) texture
function createMLITexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, "#E0B84A");
  g.addColorStop(0.3, "#C89030");
  g.addColorStop(0.6, "#D4A040");
  g.addColorStop(1, "#B87820");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);

  // Wrinkle texture
  ctx.strokeStyle = "rgba(200,150,20,0.4)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random()*size, 0);
    ctx.bezierCurveTo(
      Math.random()*size, Math.random()*size,
      Math.random()*size, Math.random()*size,
      Math.random()*size, size
    );
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

function AnimatedGroup({
  groupKey,
  isExploded,
  children,
}: {
  groupKey: string;
  isExploded: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const target = isExploded ? EXPLODED[groupKey] : ASSEMBLED[groupKey];

  useFrame(() => {
    if (!ref.current) return;
    const t = new THREE.Vector3(...target);
    ref.current.position.lerp(t, 0.06);
  });

  return <group ref={ref}>{children}</group>;
}

function SubsystemMesh({
  children,
  subsystemId,
  activeSubsystem,
  viewMode,
  onSelect,
}: {
  children: React.ReactNode;
  subsystemId: SubsystemKey;
  activeSubsystem: SubsystemKey | null;
  viewMode: string;
  onSelect: (id: SubsystemKey) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isActive = activeSubsystem === subsystemId;
  const isOther = activeSubsystem !== null && activeSubsystem !== subsystemId;

  useFrame(() => {
    if (!groupRef.current) return;
    const targetOpacity = viewMode === "xray"
      ? (isActive ? 1.0 : 0.18)
      : isOther
      ? 0.55
      : 1.0;

    groupRef.current.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.material) {
        const mat = obj.material as THREE.MeshStandardMaterial;
        if (mat.opacity !== undefined) {
          mat.opacity += (targetOpacity - mat.opacity) * 0.08;
        }
        if (isActive && mat.emissive) {
          mat.emissive.lerp(new THREE.Color(0.08, 0.05, 0.0), 0.1);
          mat.emissiveIntensity = 0.5;
        } else if (mat.emissive) {
          mat.emissive.lerp(new THREE.Color(0, 0, 0), 0.1);
          mat.emissiveIntensity = 0;
        }
      }
    });
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onSelect(subsystemId); }}
      onPointerOver={() => document.body.style.cursor = "pointer"}
      onPointerOut={() => document.body.style.cursor = "auto"}
    >
      {children}
    </group>
  );
}

export default function SatelliteModel({
  activeSubsystem,
  viewMode,
  onSelectSubsystem,
  showLabels,
  missionEffects,
}: Props) {
  const isExploded = viewMode === "exploded";
  const isXray = viewMode === "xray";

  const solarTex = useMemo(() => createSolarTexture(), []);
  const mliTex = useMemo(() => createMLITexture(), []);

  // Material helpers
  const stdMat = (color: string, metalness = 0.4, roughness = 0.5, opacity = 1) =>
    new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      transparent: opacity < 1,
      opacity,
    });

  const wireframeMat = (color: string) =>
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.5 });

  const busColor = "#C89038";
  const panelColor = "#E8E4DC";
  const radiatorColor = "#F0EEE8";
  const structureColor = "#4A4A4A";
  const antColor = "#D8D5CE";

  const mainMat = isXray ? wireframeMat(busColor) : stdMat(busColor, 0.6, 0.4);
  mainMat.map = isXray ? null : mliTex;

  const panelMat = isXray ? wireframeMat(panelColor) : stdMat(panelColor, 0.1, 0.75);
  const radiatorMat = isXray ? wireframeMat(radiatorColor) : stdMat(radiatorColor, 0.05, 0.85);
  const antMat = isXray ? wireframeMat(antColor) : stdMat(antColor, 0.3, 0.55);
  const structMat = isXray ? wireframeMat(structureColor) : stdMat(structureColor, 0.7, 0.3);

  const solarMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      map: solarTex,
      metalness: 0.2,
      roughness: 0.6,
    });
    if (isXray) { m.wireframe = true; m.map = null; m.color.set("#2244AA"); }
    return m;
  }, [solarTex, isXray]);

  return (
    <group rotation={[0.1, 0.3, 0]}>
      {/* MAIN BUS */}
      <AnimatedGroup groupKey="bus" isExploded={isExploded}>
        <SubsystemMesh subsystemId="obc" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* Main bus body */}
          <mesh castShadow receiveShadow material={mainMat}>
            <boxGeometry args={[2.0, 1.3, 1.4]} />
          </mesh>
          {/* North panel highlight */}
          <mesh position={[0, 0.655, 0]} material={radiatorMat} castShadow>
            <boxGeometry args={[2.02, 0.005, 1.42]} />
          </mesh>
          {/* South panel */}
          <mesh position={[0, -0.655, 0]} material={radiatorMat} castShadow>
            <boxGeometry args={[2.02, 0.005, 1.42]} />
          </mesh>
        </SubsystemMesh>
      </AnimatedGroup>

      {/* THERMAL - North/South radiator panels */}
      <AnimatedGroup groupKey="thermal" isExploded={isExploded}>
        <SubsystemMesh subsystemId="thermal" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* North radiator fin */}
          <mesh position={[0, 0.68, 0]} castShadow material={radiatorMat}>
            <boxGeometry args={[1.9, 0.02, 1.3]} />
          </mesh>
          {/* South radiator */}
          <mesh position={[0, -0.68, 0]} castShadow material={radiatorMat}>
            <boxGeometry args={[1.9, 0.02, 1.3]} />
          </mesh>
          {/* Heat pipe manifold lines on north */}
          {[-0.6, -0.2, 0.2, 0.6].map((z, i) => (
            <mesh key={i} position={[0, 0.69, z]} material={stdMat("#C0B8A8", 0.3, 0.6)}>
              <boxGeometry args={[1.8, 0.012, 0.025]} />
            </mesh>
          ))}
          {/* Temp display label */}
          {showLabels && (
            <Html position={[0, 1.2, 0]} center>
              <div style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#EF4444",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                THERMAL · {missionEffects.thermalState}°C
              </div>
            </Html>
          )}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* EAST SOLAR ARRAY */}
      <AnimatedGroup groupKey="eastWing" isExploded={isExploded}>
        <SubsystemMesh subsystemId="solar" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* SADA yoke */}
          <mesh position={[1.15, 0, 0]} rotation={[0, 0, Math.PI/2]} material={structMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          </mesh>
          {/* Inner panel */}
          <mesh position={[2.7, 0, 0]} material={solarMat} castShadow>
            <boxGeometry args={[2.8, 0.055, 1.05]} />
          </mesh>
          {/* Inner panel frame */}
          <mesh position={[2.7, 0, 0]} material={structMat}>
            <boxGeometry args={[2.82, 0.07, 1.07]} />
          </mesh>
          {/* Panel hinge connector */}
          <mesh position={[4.15, 0, 0]} material={structMat}>
            <cylinderGeometry args={[0.035, 0.035, 0.25, 10]} />
          </mesh>
          {/* Outer panel */}
          <mesh position={[5.6, 0, 0]} material={solarMat} castShadow>
            <boxGeometry args={[2.8, 0.055, 1.05]} />
          </mesh>
          <mesh position={[5.6, 0, 0]} material={structMat}>
            <boxGeometry args={[2.82, 0.07, 1.07]} />
          </mesh>
          {/* Bus bar strips */}
          {[-0.35, 0, 0.35].map((z, i) => (
            <mesh key={i} position={[4.15, 0.04, z]} material={stdMat("#888", 0.9, 0.1)}>
              <boxGeometry args={[5.8, 0.008, 0.012]} />
            </mesh>
          ))}
          {showLabels && (
            <Html position={[5.6, 0.6, 0]} center>
              <div style={{
                background: "rgba(234,179,8,0.15)",
                border: "1px solid rgba(234,179,8,0.4)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#CA8A04",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                SOLAR EAST · 9.1 kW
              </div>
            </Html>
          )}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* WEST SOLAR ARRAY */}
      <AnimatedGroup groupKey="westWing" isExploded={isExploded}>
        <SubsystemMesh subsystemId="solar" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          <mesh position={[-1.15, 0, 0]} material={structMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
          </mesh>
          <mesh position={[-2.7, 0, 0]} material={solarMat} castShadow>
            <boxGeometry args={[2.8, 0.055, 1.05]} />
          </mesh>
          <mesh position={[-2.7, 0, 0]} material={structMat}>
            <boxGeometry args={[2.82, 0.07, 1.07]} />
          </mesh>
          <mesh position={[-4.15, 0, 0]} material={structMat}>
            <cylinderGeometry args={[0.035, 0.035, 0.25, 10]} />
          </mesh>
          <mesh position={[-5.6, 0, 0]} material={solarMat} castShadow>
            <boxGeometry args={[2.8, 0.055, 1.05]} />
          </mesh>
          <mesh position={[-5.6, 0, 0]} material={structMat}>
            <boxGeometry args={[2.82, 0.07, 1.07]} />
          </mesh>
          {[-0.35, 0, 0.35].map((z, i) => (
            <mesh key={i} position={[-4.15, 0.04, z]} material={stdMat("#888", 0.9, 0.1)}>
              <boxGeometry args={[5.8, 0.008, 0.012]} />
            </mesh>
          ))}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* PAYLOAD - Mission antennas (Earth-facing, +Z direction) */}
      <AnimatedGroup groupKey="payload" isExploded={isExploded}>
        <SubsystemMesh subsystemId="payload" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* Main reflector dish */}
          <mesh position={[-0.3, 0, 0.82]} rotation={[-Math.PI/2, 0, 0]} material={antMat} castShadow>
            <sphereGeometry args={[0.85, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} />
          </mesh>
          {/* Main reflector rim */}
          <mesh position={[-0.3, 0, 0.82]} rotation={[0, 0, 0]} material={stdMat("#C8B898", 0.5, 0.5)}>
            <torusGeometry args={[0.85, 0.025, 8, 48]} />
          </mesh>
          {/* Main feed assembly */}
          <mesh position={[-0.3, 0, 1.25]} material={structMat}>
            <cylinderGeometry args={[0.04, 0.06, 0.25, 12]} />
          </mesh>
          {/* Main feed support struts */}
          {[0, Math.PI/2, Math.PI, Math.PI*3/2].map((angle, i) => (
            <mesh key={i}
              position={[
                -0.3 + Math.cos(angle) * 0.45,
                Math.sin(angle) * 0.35,
                1.0
              ]}
              rotation={[0, angle, -Math.PI/6]}
              material={structMat}
            >
              <cylinderGeometry args={[0.012, 0.012, 0.55, 6]} />
            </mesh>
          ))}

          {/* Secondary reflector */}
          <mesh position={[0.55, 0.2, 0.75]} rotation={[-Math.PI/2, 0, 0.3]} material={antMat} castShadow>
            <sphereGeometry args={[0.5, 24, 12, 0, Math.PI*2, 0, Math.PI/2]} />
          </mesh>
          <mesh position={[0.55, 0.2, 0.75]} rotation={[0, 0, 0.3]} material={stdMat("#C8B898", 0.5, 0.5)}>
            <torusGeometry args={[0.5, 0.02, 8, 36]} />
          </mesh>
          {/* Secondary feed */}
          <mesh position={[0.55, 0.2, 1.1]} material={structMat}>
            <cylinderGeometry args={[0.03, 0.045, 0.2, 10]} />
          </mesh>

          {/* Antenna pointing mechanism */}
          <mesh position={[-0.3, 0, 0.72]} material={stdMat("#6A6A6A", 0.8, 0.2)}>
            <cylinderGeometry args={[0.08, 0.08, 0.12, 12]} />
          </mesh>
          <mesh position={[0.55, 0.2, 0.65]} material={stdMat("#6A6A6A", 0.8, 0.2)}>
            <cylinderGeometry args={[0.06, 0.06, 0.1, 12]} />
          </mesh>

          {showLabels && (
            <Html position={[0.2, 0, 1.8]} center>
              <div style={{
                background: "rgba(200,164,74,0.15)",
                border: "1px solid rgba(200,164,74,0.4)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#C8A44A",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                PAYLOAD · {missionEffects.rfPower}% PWR
              </div>
            </Html>
          )}
        </SubsystemMesh>

        {/* RF manifold box on the bus face */}
        <SubsystemMesh subsystemId="rf" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          <mesh position={[0, 0, 0.72]} material={stdMat("#888080", 0.5, 0.55)}>
            <boxGeometry args={[0.6, 0.3, 0.06]} />
          </mesh>
          {/* Waveguide runs */}
          {[[-0.15, 0.05], [0.15, 0.05], [-0.15, -0.05], [0.15, -0.05]].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.77]} material={stdMat("#707070", 0.7, 0.3)}>
              <cylinderGeometry args={[0.02, 0.02, 0.08, 8]} />
            </mesh>
          ))}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* TT&C ANTENNAS */}
      <AnimatedGroup groupKey="ttc" isExploded={isExploded}>
        <SubsystemMesh subsystemId="ttc" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* Biconical omni antenna - top corner */}
          <mesh position={[0.8, 0.72, 0.5]} material={stdMat("#E0E0D8", 0.2, 0.7)}>
            <cylinderGeometry args={[0, 0.08, 0.18, 12]} />
          </mesh>
          <mesh position={[0.8, 0.54, 0.5]} material={stdMat("#E0E0D8", 0.2, 0.7)}>
            <cylinderGeometry args={[0.08, 0, 0.18, 12]} />
          </mesh>
          {/* Biconical omni - opposite corner */}
          <mesh position={[-0.8, 0.72, -0.5]} material={stdMat("#E0E0D8", 0.2, 0.7)}>
            <cylinderGeometry args={[0, 0.08, 0.18, 12]} />
          </mesh>
          <mesh position={[-0.8, 0.54, -0.5]} material={stdMat("#E0E0D8", 0.2, 0.7)}>
            <cylinderGeometry args={[0.08, 0, 0.18, 12]} />
          </mesh>
          {/* S-band horn antenna */}
          <mesh position={[0, 0.72, -0.3]} material={stdMat("#C8C4BC", 0.3, 0.6)}>
            <cylinderGeometry args={[0.05, 0.1, 0.14, 12]} />
          </mesh>
          {showLabels && (
            <Html position={[0.8, 1.4, 0.5]} center>
              <div style={{
                background: "rgba(6,182,212,0.12)",
                border: "1px solid rgba(6,182,212,0.35)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#06B6D4",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                TT&C · S-BAND
              </div>
            </Html>
          )}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* PROPULSION - anti-Earth face (-Z) */}
      <AnimatedGroup groupKey="propulsion" isExploded={isExploded}>
        <SubsystemMesh subsystemId="propulsion" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* Apogee engine bell */}
          <mesh position={[0, 0, -0.85]} rotation={[Math.PI/2, 0, 0]} material={stdMat("#888", 0.8, 0.2)}>
            <cylinderGeometry args={[0.08, 0.22, 0.28, 20]} />
          </mesh>
          {/* Engine throat */}
          <mesh position={[0, 0, -0.72]} rotation={[Math.PI/2, 0, 0]} material={stdMat("#666", 0.9, 0.15)}>
            <cylinderGeometry args={[0.05, 0.08, 0.1, 16]} />
          </mesh>
          {/* Bipropellant tanks (internal view) */}
          <mesh position={[0.3, 0.1, -0.2]} material={stdMat("#C0C0C0", 0.6, 0.3, isXray ? 0.3 : 0.85)}>
            <sphereGeometry args={[0.18, 16, 12]} />
          </mesh>
          <mesh position={[-0.3, 0.1, -0.2]} material={stdMat("#C0B8A0", 0.6, 0.3, isXray ? 0.3 : 0.85)}>
            <sphereGeometry args={[0.18, 16, 12]} />
          </mesh>
          {/* Pressurant tank */}
          <mesh position={[0, -0.2, -0.3]} material={stdMat("#D0D0D0", 0.7, 0.25, isXray ? 0.3 : 0.85)}>
            <sphereGeometry args={[0.12, 12, 10]} />
          </mesh>
          {/* RCS thruster clusters - corner positions */}
          {[
            [0.9, 0.55, -0.65], [-0.9, 0.55, -0.65],
            [0.9, -0.55, -0.65], [-0.9, -0.55, -0.65],
          ].map(([x, y, z], i) => (
            <group key={i} position={[x, y, z] as [number,number,number]}>
              <mesh material={structMat}>
                <boxGeometry args={[0.06, 0.06, 0.06]} />
              </mesh>
              <mesh position={[0, 0, -0.06]} rotation={[Math.PI/2, 0, 0]} material={stdMat("#777", 0.8, 0.2)}>
                <cylinderGeometry args={[0.012, 0.022, 0.05, 8]} />
              </mesh>
            </group>
          ))}
          {showLabels && (
            <Html position={[0, 0, -1.4]} center>
              <div style={{
                background: "rgba(249,115,22,0.12)",
                border: "1px solid rgba(249,115,22,0.35)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#F97316",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                PROPULSION · 490N
              </div>
            </Html>
          )}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* ADCS components */}
      <AnimatedGroup groupKey="adcs" isExploded={isExploded}>
        <SubsystemMesh subsystemId="adcs" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
          {/* Star tracker baffles */}
          <mesh position={[0.85, 0.55, 0.1]} rotation={[0.4, 0, 0.3]} material={stdMat("#222", 0.8, 0.4)}>
            <cylinderGeometry args={[0.06, 0.055, 0.2, 10]} />
          </mesh>
          <mesh position={[-0.85, 0.55, -0.1]} rotation={[0.4, 0, -0.3]} material={stdMat("#222", 0.8, 0.4)}>
            <cylinderGeometry args={[0.06, 0.055, 0.2, 10]} />
          </mesh>
          {/* Earth sensor */}
          <mesh position={[0, -0.66, 0]} material={stdMat("#1A1A1A", 0.9, 0.3)}>
            <cylinderGeometry args={[0.045, 0.06, 0.1, 10]} />
          </mesh>
          {/* Reaction wheels (internal, shown in xray) */}
          {isXray && [
            [0.3, 0, 0.1], [-0.3, 0, 0.1], [0, 0.3, 0.1], [0, -0.3, 0.1]
          ].map(([x, y, z], i) => (
            <mesh key={i} position={[x, y, z] as [number,number,number]} material={stdMat("#4A6A9A", 0.7, 0.3, 0.7)}>
              <cylinderGeometry args={[0.14, 0.14, 0.06, 20]} />
            </mesh>
          ))}
          {showLabels && (
            <Html position={[0, -1.4, 0]} center>
              <div style={{
                background: "rgba(167,139,250,0.12)",
                border: "1px solid rgba(167,139,250,0.35)",
                borderRadius: 6,
                padding: "3px 8px",
                fontSize: "0.62rem",
                color: "#A78BFA",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}>
                ADCS · ±{missionEffects.attitudeError.toFixed(3)}°
              </div>
            </Html>
          )}
        </SubsystemMesh>
      </AnimatedGroup>

      {/* EPS - battery packs visible on side panels */}
      <SubsystemMesh subsystemId="eps" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
        {/* Battery pack left */}
        <mesh position={[-0.65, -0.2, 0.3]} material={stdMat("#3A4A5A", 0.4, 0.7, isXray ? 0.4 : 0.9)}>
          <boxGeometry args={[0.45, 0.35, 0.18]} />
        </mesh>
        {/* Battery pack right */}
        <mesh position={[0.65, -0.2, 0.3]} material={stdMat("#3A4A5A", 0.4, 0.7, isXray ? 0.4 : 0.9)}>
          <boxGeometry args={[0.45, 0.35, 0.18]} />
        </mesh>
        {/* PCDU box */}
        <mesh position={[0, 0.2, 0.3]} material={stdMat("#505050", 0.5, 0.6, isXray ? 0.4 : 0.88)}>
          <boxGeometry args={[0.4, 0.25, 0.14]} />
        </mesh>
      </SubsystemMesh>

      {/* OBC / flight computer */}
      <SubsystemMesh subsystemId="obc" activeSubsystem={activeSubsystem} viewMode={viewMode} onSelect={onSelectSubsystem}>
        <mesh position={[0, 0, 0.35]} material={stdMat("#2A3A4A", 0.5, 0.65, isXray ? 0.35 : 0.88)}>
          <boxGeometry args={[0.35, 0.22, 0.12]} />
        </mesh>
      </SubsystemMesh>

      {/* CORNER STRUCTURAL DETAILS */}
      {[
        [0.95, 0.6, 0.65], [-0.95, 0.6, 0.65],
        [0.95, -0.6, 0.65], [-0.95, -0.6, 0.65],
        [0.95, 0.6, -0.65], [-0.95, 0.6, -0.65],
        [0.95, -0.6, -0.65], [-0.95, -0.6, -0.65],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z] as [number,number,number]} material={structMat}>
          <sphereGeometry args={[0.035, 8, 8]} />
        </mesh>
      ))}
    </group>
  );
}
