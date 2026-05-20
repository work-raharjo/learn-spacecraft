"use client";

import { motion } from "framer-motion";
import { MISSION_SCENARIOS, MissionScenario } from "./data";

interface Props {
  scenario: MissionScenario;
  onScenarioChange: (scenario: MissionScenario) => void;
}

const SEVERITY_COLORS = {
  nominal: { bg: "rgba(59,169,123,0.12)", border: "rgba(59,169,123,0.35)", text: "#3BA97B" },
  warning: { bg: "rgba(232,148,58,0.12)", border: "rgba(232,148,58,0.35)", text: "#E8943A" },
  critical: { bg: "rgba(217,92,92,0.12)", border: "rgba(217,92,92,0.35)", text: "#D95C5C" },
};

export default function MissionSimulator({ scenario: activeScenario, onScenarioChange }: Props) {
  return (
    <div className="h-full flex gap-3 overflow-hidden">
      {/* Scenario cards */}
      <div className="w-[320px] flex-shrink-0 overflow-y-auto pr-1">
        <p className="label-caps mb-3">Mission Scenarios</p>
        <div className="space-y-2">
          {MISSION_SCENARIOS.map((scenario) => {
            const isActive = activeScenario.id === scenario.id;
            const colors = SEVERITY_COLORS[scenario.severity];
            return (
              <motion.button
                key={scenario.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => onScenarioChange(scenario)}
                className="w-full text-left rounded-xl p-3.5 transition-all"
                style={{
                  background: isActive ? colors.bg : "rgba(255,255,255,0.45)",
                  border: `1px solid ${isActive ? colors.border : "rgba(255,255,255,0.5)"}`,
                  boxShadow: isActive ? `0 4px 20px ${colors.border}` : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{scenario.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A1915" }}>
                        {scenario.label}
                      </p>
                      {isActive && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="label-caps"
                          style={{
                            fontSize: "0.52rem",
                            background: colors.bg,
                            color: colors.text,
                            border: `1px solid ${colors.border}`,
                            padding: "1px 6px",
                            borderRadius: 4,
                          }}
                        >
                          ACTIVE
                        </motion.span>
                      )}
                    </div>
                    <p style={{ fontSize: "0.7rem", color: "#706F68", lineHeight: 1.4 }}>
                      {scenario.description}
                    </p>
                  </div>
                  <div className={`status-dot ${scenario.severity} flex-shrink-0`} />
                </div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3"
                    style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}
                  >
                    <p className="label-caps mb-2">Subsystem Effects</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: "Battery", value: `${scenario.effects.batteryLevel}%`, ok: scenario.effects.batteryLevel > 60 },
                        { label: "Solar", value: scenario.effects.solarGeneration > 0 ? `${(scenario.effects.solarGeneration/1000).toFixed(1)} kW` : "ECLIPSE", ok: scenario.effects.solarGeneration > 0 },
                        { label: "Bus V", value: `${scenario.effects.busVoltage.toFixed(1)}V`, ok: scenario.effects.busVoltage > 49 },
                        { label: "RF Pwr", value: `${scenario.effects.rfPower}%`, ok: scenario.effects.rfPower > 80 },
                        { label: "Throughput", value: `${scenario.effects.throughput} Gbps`, ok: scenario.effects.throughput > 120 },
                        { label: "Attitude", value: `±${scenario.effects.attitudeError.toFixed(3)}°`, ok: scenario.effects.attitudeError < 0.1 },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center rounded-lg px-2 py-1.5"
                          style={{ background: "rgba(255,255,255,0.4)" }}
                        >
                          <span style={{ fontSize: "0.62rem", color: "#9E9D97" }}>{item.label}</span>
                          <span className="value-display" style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            color: item.ok ? "#3BA97B" : "#D95C5C",
                          }}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Active scenario detail */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div className="glass-panel rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{activeScenario.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1A1915" }}>
                  {activeScenario.label}
                </h3>
                <span
                  className="label-caps"
                  style={{
                    fontSize: "0.55rem",
                    padding: "2px 7px",
                    borderRadius: 4,
                    ...SEVERITY_COLORS[activeScenario.severity],
                  }}
                >
                  {activeScenario.severity}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#706F68", lineHeight: 1.5 }}>
                {activeScenario.description}
              </p>
            </div>
          </div>

          {/* Animated power bar */}
          <div className="space-y-2.5">
            {[
              { label: "Battery Level", value: activeScenario.effects.batteryLevel, max: 100, unit: "%", color: activeScenario.effects.batteryLevel > 70 ? "#3BA97B" : activeScenario.effects.batteryLevel > 40 ? "#E8943A" : "#D95C5C" },
              { label: "Solar Generation", value: activeScenario.effects.solarGeneration, max: 25000, unit: "W", color: "#EAB308" },
              { label: "RF Power", value: activeScenario.effects.rfPower, max: 100, unit: "%", color: "#C8A44A" },
              { label: "Throughput", value: activeScenario.effects.throughput, max: 200, unit: " Gbps", color: "#3A78C9" },
            ].map((bar, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span style={{ fontSize: "0.68rem", color: "#706F68" }}>{bar.label}</span>
                  <span className="value-display" style={{ fontSize: "0.68rem", fontWeight: 700, color: bar.color }}>
                    {typeof bar.value === "number" && bar.value > 100 ? bar.value.toLocaleString() : bar.value.toFixed(0)}{bar.unit}
                  </span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    animate={{ width: `${(bar.value / bar.max) * 100}%` }}
                    transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ background: `linear-gradient(90deg, ${bar.color}, ${bar.color}99)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery procedures */}
        <div className="glass-panel rounded-xl p-4">
          <p className="label-caps mb-3">
            {activeScenario.severity === "nominal" ? "Normal Operations Checklist" : "Recovery Procedures"}
          </p>
          <div className="space-y-2">
            {getRecoverySteps(activeScenario.id).map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-2.5 items-start"
                style={{ padding: "8px 10px", background: "rgba(255,255,255,0.4)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.5)" }}
              >
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "rgba(200,164,74,0.15)",
                    color: "#C8A44A",
                    fontSize: "0.6rem",
                    marginTop: 1,
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: "0.75rem", color: "#2C2B26", lineHeight: 1.5 }}>{step}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Engineering notes */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(200,164,74,0.07)", border: "1px solid rgba(200,164,74,0.15)" }}
        >
          <p className="label-caps mb-2">Engineering Note</p>
          <p style={{ fontSize: "0.78rem", lineHeight: 1.65, color: "#2C2B26" }}>
            {getEngineeringNote(activeScenario.id)}
          </p>
        </div>
      </div>
    </div>
  );
}

function getRecoverySteps(id: string): string[] {
  const steps: Record<string, string[]> = {
    nominal: [
      "Verify all subsystems reporting nominal telemetry",
      "Confirm payload frequency plan and EIRP levels are within spec",
      "Check N-S stationkeeping burn schedule (next: +3.2 days)",
      "Review battery depth of discharge trend over last eclipse season",
      "Ground station handoff to next station in 4h 22m",
    ],
    eclipse: [
      "Monitor battery state of charge every 5 minutes",
      "Reduce non-essential payload power by 15% if DoD exceeds 45%",
      "Activate battery heater if temperature drops below 5°C",
      "Prepare for eclipse exit: solar array drive will auto-slew to Sun",
      "Verify UPS conditioning on all Li-Ion cells post-eclipse",
    ],
    solar_storm: [
      "Elevate memory scrubbing rate from 60s to 6s interval",
      "Enable single-event upset (SEU) enhanced monitoring on OBC",
      "Power off non-essential payload amplifiers (reduce radiation dose)",
      "Check star tracker recovery in case of cosmic ray blinding",
      "File anomaly report with LEOP team if SEU count exceeds 15/hour",
    ],
    antenna_misalign: [
      "Issue APM (Antenna Pointing Mechanism) reset command sequence",
      "Verify beam 3 sub-reflector alignment using onboard radiometer",
      "Switch beam 3 users to backup frequency plan on beam 1",
      "Schedule ground station RF measurement at next AOS",
      "If APM reset fails: initiate controlled beam park procedure",
    ],
    battery_degradation: [
      "Verify actual capacity against end-of-life power budget model",
      "Implement load shedding during eclipse: disable beams 7-12",
      "Schedule early deorbit assessment (18 months ahead of nominal)",
      "Notify customers of potential eclipse service degradation",
      "Evaluate accelerated decommission vs. reduced capacity operations",
    ],
    momentum_saturation: [
      "Calculate optimal desaturation burn start time and duration",
      "Verify RCS pressurant pressure sufficient for 15-minute burn",
      "Command thruster firing sequence (auto-mode or ground-upload)",
      "Monitor attitude error during burn (expected: < 0.08° excursion)",
      "Re-initialize wheel speed targets post-desaturation",
    ],
  };
  return steps[id] || steps["nominal"];
}

function getEngineeringNote(id: string): string {
  const notes: Record<string, string> = {
    nominal: "Nominal operations represent the baseline mission mode, with the spacecraft delivering its rated 148 Gbps aggregate capacity to Indonesia, SE Asia, and the Pacific. All primary and redundant units are healthy. The spacecraft is 3.2 years into its 15-year design life.",
    eclipse: "Eclipse seasons occur twice per year around the spring and fall equinoxes, lasting ~42 days each. During the worst-case eclipse of 72 minutes at equinox, the battery must power the entire spacecraft including the payload. Li-Ion cells are sized to limit depth of discharge (DoD) to 50% at beginning-of-life, growing to ~65% at end-of-life.",
    solar_storm: "A Class X solar flare produces energetic proton events that increase the single-event upset (SEU) rate in unshielded SRAM by 100-1000×. Radiation-hardened devices mitigate most effects, but memory scrubbing and TMR (Triple Modular Redundancy) logic in the OBC are the last line of defense. Solar storms can also generate additional radiation dose, accelerating end-of-life.",
    antenna_misalign: "APM failures are relatively common in-orbit faults. Modern satellites implement encoded stepper motors with position telemetry for each axis of motion. A misalignment of 0.8° in the primary reflector can reduce EIRP by 4-6 dB in the affected beam — enough to cause significant Eb/N0 margin reduction for small-aperture user terminals.",
    battery_degradation: "Lithium-ion capacity fade follows a predictable degradation curve based on cycle count and depth of discharge. After 13 years and ~780 eclipse cycles, capacity degradation of 35% is within the expected range. End-of-life power budget analyses typically allocate a 30% capacity degradation factor for mission planning.",
    momentum_saturation: "Reaction wheels absorb external torques (primarily solar radiation pressure and gravity gradient) throughout the mission. In GEO, solar pressure is the dominant disturbance torque. Desaturation burns typically last 10-20 minutes and require precise attitude control to prevent unintended spacecraft motion that would affect customer service.",
  };
  return notes[id] || notes["nominal"];
}
