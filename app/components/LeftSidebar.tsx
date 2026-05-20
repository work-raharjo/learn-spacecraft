"use client";

import { motion } from "framer-motion";
import { NAV_SECTIONS, SubsystemKey } from "./data";

interface Props {
  activeItem: string;
  onNavigate: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function LeftSidebar({ activeItem, onNavigate, collapsed, onToggle }: Props) {
  const subsystemIds: SubsystemKey[] = ["payload", "rf", "thermal", "eps", "adcs", "ttc", "propulsion", "solar", "obc"];

  return (
    <motion.aside
      animate={{ width: collapsed ? 58 : 240 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="flex-shrink-0 h-full flex flex-col overflow-hidden relative z-20"
      style={{
        background: "rgba(255,255,255,0.62)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        borderRight: "1px solid rgba(255,255,255,0.45)",
        boxShadow: "2px 0 24px rgba(0,0,0,0.05)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 border-b flex-shrink-0"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #E5C06A, #C8A44A)",
            boxShadow: "0 2px 10px rgba(200,164,74,0.4)",
          }}
          title="Toggle sidebar"
        >
          <span className="text-sm font-bold text-white">O</span>
        </button>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.05 }}
          >
            <p className="text-xs font-bold tracking-tight" style={{ color: "#1A1915" }}>
              OrbitLearn
            </p>
            <p className="label-caps" style={{ fontSize: "0.55rem" }}>
              Spacecraft Studio
            </p>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="label-caps px-3 mb-1"
                style={{ fontSize: "0.57rem" }}
              >
                {section.title}
              </motion.p>
            )}
            {section.items.map((item) => {
              const isSubsystem = subsystemIds.includes(item.id as SubsystemKey);
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`nav-item w-full text-left ${isActive ? "active" : ""}`}
                  style={{
                    padding: collapsed ? "9px 0" : undefined,
                    justifyContent: collapsed ? "center" : undefined,
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-sm"
                    style={{
                      color: isActive
                        ? "#C8A44A"
                        : isSubsystem
                        ? "#7A8BA8"
                        : "#9E9D97",
                    }}
                  >
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {!collapsed && isActive && (
                    <motion.span
                      layoutId="active-indicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "#C8A44A", flexShrink: 0 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom system status */}
      <div
        className="flex-shrink-0 border-t px-3 py-3"
        style={{ borderColor: "rgba(0,0,0,0.06)" }}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <div className="status-dot nominal" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2.5"
          >
            <div className="status-dot nominal" />
            <div className="min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: "#2C2B26" }}>
                System Nominal
              </p>
              <p className="label-caps" style={{ fontSize: "0.55rem" }}>
                GEO orbit · 105.5°E
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.aside>
  );
}
