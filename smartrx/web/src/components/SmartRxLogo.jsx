import React from "react";

export default function SmartRxLogo({ size = 42, showTagline = false, textColor = "#f8fafc" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", userSelect: "none" }}>
      {/* Custom SVG Medical Shield + Rx Heartbeat Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="smartrxGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Rounded Medical Badge */}
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#smartrxGrad)" />

        {/* Subtle Medical Cross */}
        <path
          d="M28 14H36V28H50V36H36V50H28V36H14V28H28V14Z"
          fill="rgba(255,255,255,0.18)"
        />

        {/* ECG Heartbeat Pulse Line */}
        <path
          d="M12 34H22L26 22L33 44L39 28L43 34H52"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Text */}
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "2px", lineHeight: 1.1 }}>
          <span style={{ fontSize: size * 0.55, fontWeight: "800", color: textColor, letterSpacing: "-0.5px" }}>
            Smart
          </span>
          <span style={{ fontSize: size * 0.58, fontWeight: "900", color: "#14b8a6" }}>
            Rx
          </span>
        </div>
        {showTagline && (
          <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "2px" }}>
            AI Prescription Reader & Reminder
          </div>
        )}
      </div>
    </div>
  );
}