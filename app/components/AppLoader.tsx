"use client";

import dynamic from "next/dynamic";

const MainApp = dynamic(() => import("./MainApp"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: "flex",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(180deg, #F8F6F1 0%, #F1ECE4 100%)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: "2.5px solid rgba(200,164,74,0.25)",
            borderTopColor: "#C8A44A",
            animation: "spin 0.9s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "#9E9D97", marginBottom: 4 }}>
            Loading
          </p>
          <p style={{ fontSize: "1rem", fontWeight: 700, color: "#1A1915", letterSpacing: "-0.02em" }}>
            OrbitLearn Studio
          </p>
        </div>
      </div>
    </div>
  ),
});

export default function AppLoader() {
  return <MainApp />;
}
