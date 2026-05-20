"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftSidebar from "./LeftSidebar";
import SpacecraftViewer from "./SpacecraftViewer";
import RightPanel from "./RightPanel";
import BottomModules from "./BottomModules";
import { SubsystemKey, MISSION_SCENARIOS, MissionScenario, SUBSYSTEMS, NAV_SECTIONS } from "./data";

const SUBSYSTEM_NAV_IDS: SubsystemKey[] = ["payload", "rf", "thermal", "eps", "adcs", "ttc", "propulsion", "solar", "obc"];

export default function MainApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("3d-explorer");
  const [activeSubsystem, setActiveSubsystem] = useState<SubsystemKey | null>(null);
  const [viewMode, setViewMode] = useState<"assembled" | "exploded" | "xray">("assembled");
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [scenario, setScenario] = useState<MissionScenario>(MISSION_SCENARIOS[0]);

  const handleNavigate = useCallback((id: string) => {
    setActiveNavItem(id);
    if (SUBSYSTEM_NAV_IDS.includes(id as SubsystemKey)) {
      setActiveSubsystem(id as SubsystemKey);
      setAiPanelOpen(true);
    } else if (id === "dashboard" || id === "3d-explorer") {
      setActiveSubsystem(null);
    }
  }, []);

  const handleSelectSubsystem = useCallback((id: SubsystemKey | null) => {
    setActiveSubsystem(id);
    if (id) {
      setActiveNavItem(id);
      setAiPanelOpen(true);
    }
  }, []);

  const missionEffects = {
    rfPower: scenario.effects.rfPower,
    thermalState: scenario.effects.thermalState,
    attitudeError: scenario.effects.attitudeError,
  };

  return (
    <div className="flex h-full overflow-hidden bg-app">
      {/* Left Sidebar */}
      <LeftSidebar
        activeItem={activeNavItem}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top header bar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-5 py-3"
          style={{
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(16px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div>
              <h1 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1915", letterSpacing: "-0.02em" }}>
                <span className="gradient-gold">OrbitLearn</span>
                <span style={{ color: "#9E9D97", fontWeight: 400 }}> — </span>
                <span style={{ color: "#2C2B26" }}>Spacecraft Architecture Studio</span>
              </h1>
              <p className="label-caps" style={{ fontSize: "0.57rem" }}>
                BRISat-1 · SSL-1300 Bus · 150.5°E · 35,786 km
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Scenario indicator */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{
                background: scenario.severity === "nominal" ? "rgba(59,169,123,0.08)" : scenario.severity === "warning" ? "rgba(232,148,58,0.1)" : "rgba(217,92,92,0.1)",
                border: `1px solid ${scenario.severity === "nominal" ? "rgba(59,169,123,0.2)" : scenario.severity === "warning" ? "rgba(232,148,58,0.25)" : "rgba(217,92,92,0.25)"}`,
              }}
            >
              <div className={`status-dot ${scenario.severity}`} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: scenario.severity === "nominal" ? "#3BA97B" : scenario.severity === "warning" ? "#E8943A" : "#D95C5C" }}>
                {scenario.label}
              </span>
            </div>

            {/* Active subsystem badge */}
            <AnimatePresence>
              {activeSubsystem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer"
                  style={{
                    background: "rgba(200,164,74,0.1)",
                    border: "1px solid rgba(200,164,74,0.25)",
                  }}
                  onClick={() => handleSelectSubsystem(null)}
                >
                  <span style={{ fontSize: "0.8rem" }}>{SUBSYSTEMS[activeSubsystem].icon}</span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "#C8A44A" }}>
                    {SUBSYSTEMS[activeSubsystem].label}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#9E9D97" }}>✕</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* AI tutor toggle */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAiPanelOpen(!aiPanelOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: aiPanelOpen ? "rgba(200,164,74,0.12)" : "rgba(255,255,255,0.5)",
                border: `1px solid ${aiPanelOpen ? "rgba(200,164,74,0.35)" : "rgba(255,255,255,0.6)"}`,
                color: aiPanelOpen ? "#C8A44A" : "#9E9D97",
                cursor: "pointer",
              }}
            >
              <span style={{ fontSize: "0.8rem" }}>◫</span>
              <span style={{ fontSize: "0.7rem", fontWeight: 500 }}>AI Tutor</span>
            </motion.button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden min-w-0">
          {/* 3D + bottom panels column */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* 3D Spacecraft Viewer */}
            <div className="flex-1 min-h-0 p-3 pb-0">
              <div className="h-full rounded-2xl overflow-hidden shadow-deep">
                <SpacecraftViewer
                  activeSubsystem={activeSubsystem}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  onSelectSubsystem={handleSelectSubsystem}
                  onOpenAI={() => setAiPanelOpen(true)}
                  missionEffects={missionEffects}
                />
              </div>
            </div>

            {/* Bottom modules */}
            <div className="px-3 pb-3 pt-2">
              <BottomModules
                scenario={scenario}
                onScenarioChange={setScenario}
                rfPower={scenario.effects.rfPower}
              />
            </div>
          </div>

          {/* Right AI Panel */}
          <RightPanel
            isOpen={aiPanelOpen}
            onClose={() => setAiPanelOpen(false)}
            activeSubsystem={activeSubsystem}
          />
        </div>
      </div>

      {/* Quick subsystem keyboard shortcut hints (bottom left floating) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 100 }}
      >
        <AnimatePresence>
          {activeSubsystem === null && scenario.id === "nominal" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 3 }}
              style={{
                background: "rgba(26,25,21,0.75)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "6px 16px",
                display: "none", // hide after first interaction
              }}
            >
              <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)" }}>
                Click any component on the 3D model to begin learning
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
