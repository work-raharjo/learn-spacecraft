"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import OrbitVisualizer from "./OrbitVisualizer";
import TelemetryPanel from "./TelemetryPanel";
import RFCoverageMap from "./RFCoverageMap";
import MissionSimulator from "./MissionSimulator";
import { MissionScenario } from "./data";

interface Props {
  scenario: MissionScenario;
  onScenarioChange: (s: MissionScenario) => void;
  rfPower: number;
}

const TABS = [
  { id: "orbit", label: "Orbit Simulator", icon: "○" },
  { id: "rf", label: "RF Coverage", icon: "◎" },
  { id: "telemetry", label: "Telemetry", icon: "▣" },
  { id: "mission", label: "Mission Sim", icon: "◆" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function BottomModules({ scenario, onScenarioChange, rfPower }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("telemetry");
  const [longitude, setLongitude] = useState(150.5);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className="flex-shrink-0 flex flex-col"
      style={{
        height: isExpanded ? 380 : 300,
        transition: "height 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        borderTop: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 -2px 20px rgba(0,0,0,0.06)",
      }}
    >
      {/* Tab bar */}
      <div
        className="flex items-center gap-1 px-4 py-2 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-1 flex-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: activeTab === tab.id ? "rgba(255,255,255,0.75)" : "transparent",
                border: activeTab === tab.id ? "1px solid rgba(255,255,255,0.6)" : "1px solid transparent",
                boxShadow: activeTab === tab.id ? "0 2px 8px rgba(0,0,0,0.07)" : "none",
                color: activeTab === tab.id ? "#2C2B26" : "#9E9D97",
                fontSize: "0.73rem",
                fontWeight: activeTab === tab.id ? 600 : 400,
                letterSpacing: "0.02em",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <span style={{ fontSize: "0.72rem" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-2 mr-2">
          <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
            style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.6)" }}
          >
            <div className={`status-dot ${scenario.severity}`} />
            <span style={{ fontSize: "0.65rem", fontWeight: 600, color: scenario.severity === "nominal" ? "#3BA97B" : scenario.severity === "warning" ? "#E8943A" : "#D95C5C" }}>
              {scenario.label}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/5"
          style={{ color: "#9E9D97", fontSize: "0.75rem" }}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? "▾" : "▴"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {activeTab === "orbit" && (
              <OrbitVisualizer longitude={longitude} onLongitudeChange={setLongitude} />
            )}
            {activeTab === "rf" && (
              <RFCoverageMap longitude={longitude} rfPower={rfPower} scenario={scenario.id} />
            )}
            {activeTab === "telemetry" && (
              <TelemetryPanel scenario={scenario} />
            )}
            {activeTab === "mission" && (
              <MissionSimulator scenario={scenario} onScenarioChange={onScenarioChange} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
