import React from "react";

export default function MedicalBackground({ themeKey }) {
  const icons = [
    { symbol: "🩺", top: "10%", left: "6%", delay: "0s" },
    { symbol: "💊", top: "22%", right: "8%", delay: "1.2s" },
    { symbol: "❤️", bottom: "18%", left: "10%", delay: "2.4s" },
    { symbol: "➕", top: "55%", right: "12%", delay: "0.8s" },
    { symbol: "🏥", bottom: "12%", right: "22%", delay: "1.8s" },
    { symbol: "🧬", top: "42%", left: "4%", delay: "3s" },
  ];

  const gradientOverlay =
    themeKey === "day"
      ? "radial-gradient(circle at top right, rgba(37,99,235,0.08), transparent 60%)"
      : themeKey === "dimYellow"
      ? "radial-gradient(circle at top right, rgba(217,119,6,0.12), transparent 60%)"
      : "radial-gradient(circle at top right, rgba(59,130,246,0.14), transparent 60%)";

  return (
    <div className="med-bg-layer" style={{ background: gradientOverlay }}>
      {icons.map((item, idx) => (
        <span
          key={idx}
          className="floating-icon"
          style={{
            top: item.top,
            bottom: item.bottom,
            left: item.left,
            right: item.right,
            animationDelay: item.delay,
          }}
        >
          {item.symbol}
        </span>
      ))}
    </div>
  );
}