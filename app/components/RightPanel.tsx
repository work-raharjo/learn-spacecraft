"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SUBSYSTEMS, SubsystemKey } from "./data";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  activeSubsystem: SubsystemKey | null;
}

type TabKey = "overview" | "specs" | "signals" | "learn";

const WELCOME_MESSAGES = [
  "Welcome to OrbitLearn — your AI guide to spacecraft systems engineering.",
  "Click any subsystem in the 3D viewer or sidebar to begin an interactive deep-dive.",
  "I'll explain signal flows, thermal behavior, orbital mechanics, and RF engineering in plain language.",
];

export default function RightPanel({ isOpen, onClose, activeSubsystem }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [conversation, setConversation] = useState<{ role: "ai" | "user"; text: string }[]>([]);

  const data = activeSubsystem ? SUBSYSTEMS[activeSubsystem] : null;

  // Simulate typewriter effect when subsystem changes
  useEffect(() => {
    if (!data) return;
    setIsTyping(true);
    setDisplayedText("");
    const full = data.overview;
    let i = 0;
    const interval = setInterval(() => {
      if (i < full.length) {
        setDisplayedText(full.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 8);
    return () => clearInterval(interval);
  }, [activeSubsystem, data]);

  // Reset tab when subsystem changes
  useEffect(() => {
    setActiveTab("overview");
    setConversation([]);
  }, [activeSubsystem]);

  const handleAskQuestion = () => {
    if (!aiInput.trim()) return;
    const question = aiInput.trim();
    setAiInput("");
    setConversation((prev) => [
      ...prev,
      { role: "user", text: question },
      {
        role: "ai",
        text: generateAIResponse(question, activeSubsystem),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="right-panel"
          initial={{ x: 380, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 380, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 280 }}
          className="flex-shrink-0 w-[360px] h-full flex flex-col overflow-hidden relative z-20"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(28px) saturate(1.5)",
            WebkitBackdropFilter: "blur(28px) saturate(1.5)",
            borderLeft: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "-2px 0 28px rgba(0,0,0,0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
            style={{ borderColor: "rgba(0,0,0,0.07)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm animate-pulse-soft"
                style={{ background: "rgba(200,164,74,0.12)", border: "1px solid rgba(200,164,74,0.25)" }}
              >
                ◫
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1915" }}>
                  AI Tutor
                </p>
                <p className="label-caps" style={{ fontSize: "0.55rem" }}>
                  Aerospace Engineering Guide
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/5 text-sm"
              style={{ color: "#9E9D97" }}
            >
              ✕
            </button>
          </div>

          {/* Subsystem header */}
          {data && (
            <div
              className="px-5 pt-4 pb-3 flex-shrink-0 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{data.icon}</span>
                <span className="subsystem-tag">{data.shortLabel}</span>
              </div>
              <h2 className="font-bold text-base leading-tight mb-1" style={{ color: "#1A1915" }}>
                {data.label}
              </h2>
              <p className="text-xs italic" style={{ color: "#9E9D97" }}>
                {data.tagline}
              </p>
            </div>
          )}

          {/* Tabs */}
          {data && (
            <div
              className="flex gap-1 px-4 py-2.5 flex-shrink-0 border-b"
              style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.3)" }}
            >
              {(["overview", "specs", "signals", "learn"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn capitalize flex-1 text-center`}
                  style={{
                    background: activeTab === tab ? "rgba(255,255,255,0.75)" : "transparent",
                    color: activeTab === tab ? "#2C2B26" : "#9E9D97",
                    fontWeight: activeTab === tab ? 600 : 500,
                    boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: "0.72rem",
                  }}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {!data ? (
              <WelcomeState messages={WELCOME_MESSAGES} />
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="ai-message mb-4">
                      <p style={{ fontSize: "0.83rem", lineHeight: 1.7, color: "#2C2B26" }}>
                        {displayedText}
                        {isTyping && (
                          <span
                            className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse-soft"
                            style={{ background: "#C8A44A" }}
                          />
                        )}
                      </p>
                    </div>

                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{ background: "rgba(200,164,74,0.07)", border: "1px solid rgba(200,164,74,0.15)" }}
                    >
                      <p className="label-caps mb-2">Key Engineering Insight</p>
                      <p style={{ fontSize: "0.8rem", lineHeight: 1.6, color: "#2C2B26" }}>
                        {data.funFact}
                      </p>
                    </div>

                    {data.details.slice(0, 4).map((d, i) => (
                      <div
                        key={i}
                        className="flex gap-2.5 mb-2.5"
                        style={{
                          padding: "8px 12px",
                          background: "rgba(255,255,255,0.5)",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.55)",
                        }}
                      >
                        <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: "#C8A44A" }}>
                          ◆
                        </span>
                        <p style={{ fontSize: "0.78rem", lineHeight: 1.6, color: "#2C2B26" }}>{d}</p>
                      </div>
                    ))}
                  </motion.div>
                )}

                {activeTab === "specs" && (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="label-caps mb-3">Technical Specifications</p>
                    <div className="space-y-2">
                      {data.specs.map((spec, i) => (
                        <div
                          key={i}
                          className="flex items-start justify-between gap-3 py-2.5 px-3 rounded-xl"
                          style={{
                            background: i % 2 === 0 ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)",
                            border: "1px solid rgba(255,255,255,0.5)",
                          }}
                        >
                          <span style={{ fontSize: "0.75rem", color: "#706F68", lineHeight: 1.4 }}>
                            {spec.label}
                          </span>
                          <span
                            className="value-display text-right flex-shrink-0"
                            style={{ fontSize: "0.75rem", fontWeight: 600, color: "#1A1915" }}
                          >
                            {spec.value}
                            {spec.unit && (
                              <span style={{ color: "#9E9D97", fontWeight: 400 }}> {spec.unit}</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "signals" && (
                  <motion.div
                    key="signals"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {data.signals ? (
                      <>
                        <p className="label-caps mb-3">Signal Flow Chain</p>
                        <div className="relative">
                          <div
                            className="absolute left-3 top-0 bottom-0 w-0.5"
                            style={{ background: "linear-gradient(to bottom, #C8A44A, rgba(200,164,74,0.1))" }}
                          />
                          {data.signals.map((step, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.07 }}
                              className="pl-9 pb-5 relative"
                            >
                              <div
                                className="absolute left-[7px] top-1 w-3 h-3 rounded-full flex items-center justify-center"
                                style={{
                                  background: "rgba(200,164,74,0.2)",
                                  border: "2px solid #C8A44A",
                                }}
                              >
                                <div
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: "#C8A44A" }}
                                />
                              </div>
                              <div
                                className="p-3 rounded-xl"
                                style={{
                                  background: "rgba(255,255,255,0.55)",
                                  border: "1px solid rgba(255,255,255,0.55)",
                                }}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1A1915" }}>
                                    {step.label}
                                  </p>
                                  {step.frequency && (
                                    <span
                                      className="value-display"
                                      style={{
                                        fontSize: "0.65rem",
                                        color: "#3A78C9",
                                        background: "rgba(58,120,201,0.08)",
                                        padding: "2px 6px",
                                        borderRadius: 4,
                                      }}
                                    >
                                      {step.frequency}
                                    </span>
                                  )}
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "#706F68", lineHeight: 1.5 }}>
                                  {step.description}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p style={{ color: "#9E9D97", fontSize: "0.82rem" }}>
                          No signal chain data for this subsystem.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === "learn" && (
                  <motion.div
                    key="learn"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="label-caps mb-3">Deep Dive Details</p>
                    {data.details.map((d, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex gap-2.5 mb-3"
                        style={{
                          padding: "10px 12px",
                          background: "rgba(255,255,255,0.5)",
                          borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.55)",
                        }}
                      >
                        <span
                          className="text-xs mt-1 flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full"
                          style={{
                            background: "rgba(200,164,74,0.15)",
                            color: "#C8A44A",
                            fontSize: "0.6rem",
                            fontWeight: 700,
                          }}
                        >
                          {i + 1}
                        </span>
                        <p style={{ fontSize: "0.78rem", lineHeight: 1.65, color: "#2C2B26" }}>{d}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Conversation history */}
            {conversation.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                <p className="label-caps mb-3">Conversation</p>
                {conversation.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2.5 ${msg.role === "user" ? "text-right" : ""}`}
                  >
                    <div
                      className="inline-block rounded-xl px-3 py-2 max-w-[90%]"
                      style={{
                        background:
                          msg.role === "user"
                            ? "rgba(200,164,74,0.15)"
                            : "rgba(255,255,255,0.6)",
                        border:
                          msg.role === "user"
                            ? "1px solid rgba(200,164,74,0.25)"
                            : "1px solid rgba(255,255,255,0.6)",
                        fontSize: "0.78rem",
                        lineHeight: 1.6,
                        color: "#2C2B26",
                        textAlign: "left",
                      }}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Input */}
          <div
            className="flex-shrink-0 px-4 py-3 border-t"
            style={{ borderColor: "rgba(0,0,0,0.07)", background: "rgba(255,255,255,0.4)" }}
          >
            <div
              className="flex gap-2 items-center rounded-xl px-3 py-2"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(200,164,74,0.2)",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
            >
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAskQuestion()}
                placeholder="Ask about this subsystem…"
                className="flex-1 bg-transparent outline-none"
                style={{ fontSize: "0.78rem", color: "#2C2B26" }}
              />
              <button
                onClick={handleAskQuestion}
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all hover:scale-105"
                style={{
                  background: aiInput.trim()
                    ? "linear-gradient(135deg, #E5C06A, #C8A44A)"
                    : "rgba(0,0,0,0.07)",
                  color: aiInput.trim() ? "#fff" : "#9E9D97",
                }}
              >
                ↑
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function WelcomeState({ messages }: { messages: string[] }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
      <div
        className="rounded-2xl p-5 mb-4 text-center"
        style={{
          background: "linear-gradient(135deg, rgba(200,164,74,0.08), rgba(58,120,201,0.06))",
          border: "1px solid rgba(200,164,74,0.15)",
        }}
      >
        <div className="text-3xl mb-3">🛰️</div>
        <p className="font-semibold mb-1" style={{ color: "#1A1915", fontSize: "0.9rem" }}>
          GEO Communications Satellite
        </p>
        <p className="label-caps" style={{ fontSize: "0.57rem" }}>
          GEOSTATIONARY · 35,786 KM · 105.5°E
        </p>
      </div>
      {messages.map((msg, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.12 }}
          className="ai-message"
        >
          {msg}
        </motion.div>
      ))}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { icon: "📡", label: "Ku-band Payload", sub: "36 MHz × 24 transponders" },
          { icon: "⚡", label: "Power System", sub: "18 kW solar BOL" },
          { icon: "🎯", label: "ADCS", sub: "< 0.05° pointing" },
          { icon: "🌡️", label: "Thermal", sub: "–20 to +70°C ops" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="depth-card rounded-xl p-3"
            style={{
              background: "rgba(255,255,255,0.55)",
              border: "1px solid rgba(255,255,255,0.6)",
              cursor: "default",
            }}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1A1915" }}>{item.label}</p>
            <p style={{ fontSize: "0.65rem", color: "#9E9D97" }}>{item.sub}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function generateAIResponse(question: string, subsystem: SubsystemKey | null): string {
  const q = question.toLowerCase();

  if (q.includes("power") || q.includes("watts") || q.includes("battery"))
    return "A GEO satellite's power budget is tightly managed. The payload typically consumes 60-70% of total power (8-12 kW for a 15-18 kW system). During eclipse, batteries must supply all loads for up to 72 minutes. Battery depth of discharge is kept below 50% to ensure 15-year lifetime.";

  if (q.includes("orbit") || q.includes("geo") || q.includes("altitude"))
    return "GEO orbit is at 35,786 km altitude — chosen because the orbital period exactly matches Earth's rotation (23h 56m 4s sidereal day). This keeps the satellite stationary relative to the ground, enabling fixed antennas for users. The trade-off is 240-280ms signal latency.";

  if (q.includes("frequency") || q.includes("ku") || q.includes("ka") || q.includes("band"))
    return "Ku-band (12-18 GHz) is the workhorse for direct-to-home TV and VSAT services. Ka-band (26.5-40 GHz) enables higher throughput HTS services but suffers more from rain attenuation. In tropical regions like Indonesia and Brazil, Ka-band links must have 3-8 dB of rain fade margin built in.";

  if (q.includes("temperature") || q.includes("thermal") || q.includes("heat"))
    return "Spacecraft thermal management is challenging because space has no convection — only radiation and conduction. The satellite's north and south panels face deep space (4K) and act as radiators. MLI blankets trap internal heat, while heat pipes move thermal loads from hot electronics to the radiators.";

  if (q.includes("attitude") || q.includes("pointing") || q.includes("adcs"))
    return "Pointing accuracy of 0.05° means the antenna beam must stay on target to within 1/20th of a degree. At GEO altitude, this translates to a spot on Earth about 30km in diameter. Reaction wheels provide smooth, continuous attitude control; thrusters are used only for coarse maneuvers to avoid contaminating the solar arrays.";

  if (subsystem) {
    const data = SUBSYSTEMS[subsystem];
    return `Great question about the ${data.label}. ${data.details[Math.floor(Math.random() * data.details.length)]}. Would you like to explore the specifications or signal flow chain?`;
  }

  return "That's an excellent engineering question. To give you the most relevant answer, try selecting a specific subsystem in the 3D viewer first — then ask again and I'll provide detailed, context-specific information about that system's design, operation, and failure modes.";
}
