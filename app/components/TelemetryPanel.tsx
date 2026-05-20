"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MissionScenario } from "./data";

interface TelemetryState {
  battery: number;
  solarPower: number;
  busVoltage: number;
  thermalBus: number;
  rfPower: number;
  throughput: number;
  attitudeError: number;
  wheelSpeed: number;
  propellantMass: number;
  commandsReceived: number;
  uptime: number;
}

interface Props {
  scenario: MissionScenario;
}

function GaugeArc({
  value, max, color, size = 64, label, unit,
}: {
  value: number; max: number; color: string; size?: number; label: string; unit: string;
}) {
  const pct = Math.min(1, Math.max(0, value / max));
  const r = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -Math.PI * 0.75;
  const endAngle = Math.PI * 0.75;
  const totalArc = endAngle - startAngle;
  const filled = startAngle + totalArc * pct;

  const pathD = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy + r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy + r * Math.sin(to);
    const large = to - from > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        {/* Track */}
        <path d={pathD(startAngle, endAngle)} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={4} strokeLinecap="round" />
        {/* Fill */}
        <motion.path
          d={pathD(startAngle, filled)}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
        {/* Center value */}
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11} fontWeight="700" fill={color} fontFamily="JetBrains Mono, monospace">
          {value.toFixed(0)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={7} fill="rgba(0,0,0,0.4)" fontFamily="Inter, sans-serif">
          {unit}
        </text>
      </svg>
      <p style={{ fontSize: "0.62rem", color: "#9E9D97", textAlign: "center", marginTop: 2 }}>{label}</p>
    </div>
  );
}

function TrendSparkline({
  history, color, width = 80, height = 24,
}: {
  history: number[]; color: string; width?: number; height?: number;
}) {
  if (history.length < 2) return null;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = max - min || 1;
  const points = history.map((v, i) => {
    const x = (i / (history.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 2px ${color}80)` }}
      />
    </svg>
  );
}

export default function TelemetryPanel({ scenario }: Props) {
  const [telem, setTelem] = useState<TelemetryState>({
    battery: scenario.effects.batteryLevel,
    solarPower: scenario.effects.solarGeneration,
    busVoltage: scenario.effects.busVoltage,
    thermalBus: scenario.effects.thermalState,
    rfPower: scenario.effects.rfPower,
    throughput: scenario.effects.throughput,
    attitudeError: scenario.effects.attitudeError,
    wheelSpeed: 4820,
    propellantMass: 412,
    commandsReceived: 1847,
    uptime: 4380,
  });

  const historyRef = useRef<Record<string, number[]>>({
    battery: [scenario.effects.batteryLevel],
    solarPower: [scenario.effects.solarGeneration],
    busVoltage: [scenario.effects.busVoltage],
    rfPower: [scenario.effects.rfPower],
    throughput: [scenario.effects.throughput],
  });

  // Update telemetry to match scenario changes
  useEffect(() => {
    setTelem(prev => ({
      ...prev,
      battery: scenario.effects.batteryLevel,
      solarPower: scenario.effects.solarGeneration,
      busVoltage: scenario.effects.busVoltage,
      thermalBus: scenario.effects.thermalState,
      rfPower: scenario.effects.rfPower,
      throughput: scenario.effects.throughput,
      attitudeError: scenario.effects.attitudeError,
    }));
  }, [scenario]);

  // Live jitter on top of scenario values
  useEffect(() => {
    const interval = setInterval(() => {
      setTelem((prev) => {
        const noise = (v: number, spread: number) =>
          v + (Math.random() - 0.5) * spread;

        const next = {
          ...prev,
          battery: Math.max(0, Math.min(100, noise(prev.battery, 0.4))),
          solarPower: Math.max(0, noise(prev.solarPower, 120)),
          busVoltage: noise(prev.busVoltage, 0.05),
          thermalBus: noise(prev.thermalBus, 0.3),
          rfPower: Math.max(0, Math.min(100, noise(prev.rfPower, 0.5))),
          throughput: Math.max(0, noise(prev.throughput, 1.2)),
          wheelSpeed: noise(prev.wheelSpeed, 18),
          commandsReceived: prev.commandsReceived + (Math.random() < 0.15 ? 1 : 0),
          uptime: prev.uptime + 1 / 3600,
        };

        // Update history
        const h = historyRef.current;
        const push = (k: keyof typeof h, v: number) => {
          h[k] = [...(h[k] || []), v].slice(-24);
        };
        push("battery", next.battery);
        push("solarPower", next.solarPower);
        push("busVoltage", next.busVoltage);
        push("rfPower", next.rfPower);
        push("throughput", next.throughput);

        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (v: number, warn: number, crit: number) =>
    v < crit ? "critical" : v < warn ? "warning" : "nominal";

  const statusColor = (s: string) =>
    s === "critical" ? "#D95C5C" : s === "warning" ? "#E8943A" : "#3BA97B";

  const battStatus = getStatus(telem.battery, 70, 40);
  const powerStatus = getStatus(telem.busVoltage, 98.5, 96.0);
  const rfStatus = getStatus(telem.rfPower, 75, 50);

  return (
    <div className="h-full flex gap-3 overflow-hidden">
      {/* Gauges column */}
      <div className="w-[220px] flex-shrink-0 flex flex-col gap-2.5 overflow-y-auto">
        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-3">Power & Energy</p>
          <div className="grid grid-cols-2 gap-2">
            <GaugeArc value={telem.battery} max={100} color={statusColor(battStatus)} label="Battery" unit="%" size={72} />
            <GaugeArc value={telem.solarPower / 200} max={100} color="#EAB308" label="Solar Gen" unit="x200W" size={72} />
          </div>
          <div className="mt-2 progress-track">
            <motion.div
              className="progress-fill"
              animate={{ width: `${telem.battery}%` }}
              transition={{ duration: 1 }}
              style={{ background: `linear-gradient(90deg, ${statusColor(battStatus)}, ${statusColor(battStatus)}AA)` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ fontSize: "0.62rem", color: "#9E9D97" }}>Battery Level</span>
            <span className="value-display" style={{ fontSize: "0.62rem", color: statusColor(battStatus), fontWeight: 700 }}>
              {telem.battery.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Bus Voltage</p>
          <div className="flex items-end justify-between">
            <span className="value-display" style={{ fontSize: "1.4rem", fontWeight: 700, color: statusColor(powerStatus) }}>
              {telem.busVoltage.toFixed(2)}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#9E9D97", marginBottom: 4 }}>V</span>
          </div>
          <TrendSparkline history={historyRef.current.busVoltage || []} color={statusColor(powerStatus)} />
          <p style={{ fontSize: "0.62rem", color: "#9E9D97", marginTop: 2 }}>Nominal: 100.0V</p>
        </div>

        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Thermal Bus</p>
          <div className="flex items-end justify-between">
            <span className="value-display" style={{ fontSize: "1.4rem", fontWeight: 700, color: "#EF4444" }}>
              {telem.thermalBus.toFixed(1)}
            </span>
            <span style={{ fontSize: "0.7rem", color: "#9E9D97", marginBottom: 4 }}>°C</span>
          </div>
          <div className="progress-track mt-1.5">
            <motion.div
              className="progress-fill"
              animate={{ width: `${((telem.thermalBus + 20) / 100) * 100}%` }}
              style={{ background: "linear-gradient(90deg, #3BA97B, #E8943A, #D95C5C)" }}
            />
          </div>
        </div>
      </div>

      {/* Main metrics */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto">
        <div className="glass-panel rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="label-caps">RF Performance</p>
            <div className="flex items-center gap-1.5">
              <div className={`status-dot ${rfStatus}`} />
              <span style={{ fontSize: "0.62rem", color: statusColor(rfStatus), fontWeight: 600 }}>
                {rfStatus.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p style={{ fontSize: "0.65rem", color: "#9E9D97" }}>RF Output Power</p>
              <p className="value-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: statusColor(rfStatus) }}>
                {telem.rfPower.toFixed(1)}%
              </p>
              <TrendSparkline history={historyRef.current.rfPower || []} color={statusColor(rfStatus)} />
            </div>
            <div>
              <p style={{ fontSize: "0.65rem", color: "#9E9D97" }}>Aggregate Throughput</p>
              <p className="value-display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#3A78C9" }}>
                {telem.throughput.toFixed(1)}
              </p>
              <p style={{ fontSize: "0.62rem", color: "#9E9D97" }}>Gbps</p>
              <TrendSparkline history={historyRef.current.throughput || []} color="#3A78C9" />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">ADCS Status</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p style={{ fontSize: "0.62rem", color: "#9E9D97" }}>Attitude Error</p>
              <p className="value-display" style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: telem.attitudeError > 0.5 ? "#D95C5C" : telem.attitudeError > 0.1 ? "#E8943A" : "#3BA97B",
              }}>
                {telem.attitudeError.toFixed(3)}°
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.62rem", color: "#9E9D97" }}>Wheel Speed</p>
              <p className="value-display" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#A78BFA" }}>
                {Math.round(telem.wheelSpeed)} RPM
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.62rem", color: "#9E9D97" }}>Prop Mass</p>
              <p className="value-display" style={{ fontSize: "0.95rem", fontWeight: 700, color: "#F97316" }}>
                {telem.propellantMass.toFixed(0)} kg
              </p>
            </div>
          </div>

          {/* Attitude error bar */}
          <div className="mt-2 progress-track">
            <motion.div
              className="progress-fill"
              animate={{ width: `${Math.min(100, (telem.attitudeError / 1.0) * 100)}%` }}
              style={{
                background: telem.attitudeError > 0.5
                  ? "#D95C5C"
                  : telem.attitudeError > 0.1
                  ? "#E8943A"
                  : "#3BA97B",
              }}
            />
          </div>
        </div>

        <div className="glass-panel rounded-xl p-3">
          <p className="label-caps mb-2">Mission Data</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Commands Rcvd", value: telem.commandsReceived.toFixed(0), unit: "total", color: "#06B6D4" },
              { label: "Mission Uptime", value: `${Math.floor(telem.uptime / 24)}d ${(telem.uptime % 24).toFixed(0)}h`, unit: "", color: "#10B981" },
              { label: "Solar Array Angle", value: "97.3°", unit: "", color: "#EAB308" },
              { label: "Eclipse Status", value: scenario.id === "eclipse" ? "IN ECLIPSE" : "SUNLIT", unit: "", color: scenario.id === "eclipse" ? "#D95C5C" : "#3BA97B" },
            ].map((item, i) => (
              <div key={i} className="metric-card rounded-lg py-2 px-3">
                <p style={{ fontSize: "0.62rem", color: "#9E9D97" }}>{item.label}</p>
                <p className="value-display" style={{ fontSize: "0.82rem", fontWeight: 700, color: item.color }}>
                  {item.value}
                  {item.unit && <span style={{ fontSize: "0.65rem", color: "#9E9D97", fontWeight: 400 }}> {item.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log feed */}
      <div className="w-36 flex-shrink-0">
        <div className="glass-panel rounded-xl p-3 h-full flex flex-col">
          <p className="label-caps mb-2">Event Log</p>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            <LiveLog scenario={scenario} />
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveLog({ scenario }: { scenario: MissionScenario }) {
  const [logs, setLogs] = useState<{ time: string; msg: string; level: string }[]>([
    { time: "00:00", msg: "System boot OK", level: "nominal" },
    { time: "00:01", msg: "ADCS nominal", level: "nominal" },
    { time: "00:02", msg: "Payload enabled", level: "nominal" },
  ]);

  const NOMINAL_LOGS = [
    "SADA tracking Sun", "Beacon lock acquired", "TM frame OK",
    "AOS from ground", "Momentum nominal", "Battery charging",
    "Payload temp: 22°C", "RF power: 98%",
  ];
  const SCENARIO_LOGS: Record<string, string[]> = {
    eclipse: ["Eclipse ingress", "Battery mode", "Solar power: 0W", "Depth of discharge ↑"],
    tropical_rain: ["C-band fade: 0.8 dB", "Ku margin warn", "C-band link stable", "Rain event: 85mm/h"],
    antenna_misalign: ["APM fault B3", "Beam 3 off-axis", "EIRP reduced", "SVC degraded"],
    battery_eol: ["Batt cap: 72%", "Eclipse DoD ↑", "Load shedding active", "EOL budget tight"],
    momentum_saturation: ["Wheel 2: 5800 RPM", "Desat burn -2min", "RCS fire imminent"],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const isScenario = Math.random() < 0.35 && scenario.id !== "nominal";
      const pool = isScenario
        ? SCENARIO_LOGS[scenario.id] || NOMINAL_LOGS
        : NOMINAL_LOGS;
      const msg = pool[Math.floor(Math.random() * pool.length)];
      const now = new Date();
      setLogs((prev) => [
        { time: `${now.getHours().toString().padStart(2,"0")}:${now.getMinutes().toString().padStart(2,"0")}`, msg, level: isScenario ? scenario.severity : "nominal" },
        ...prev.slice(0, 18),
      ]);
    }, 2200);
    return () => clearInterval(interval);
  }, [scenario]);

  const levelColor = (l: string) =>
    l === "critical" ? "#D95C5C" : l === "warning" ? "#E8943A" : "#3BA97B";

  return (
    <>
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ opacity: Math.max(0.3, 1 - i * 0.05) }}
        >
          <p style={{ fontSize: "0.58rem", color: "#9E9D97" }}>{log.time}</p>
          <p style={{ fontSize: "0.65rem", color: levelColor(log.level), lineHeight: 1.3 }}>
            {log.msg}
          </p>
        </motion.div>
      ))}
    </>
  );
}
