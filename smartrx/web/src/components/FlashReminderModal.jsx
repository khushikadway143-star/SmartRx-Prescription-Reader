import React, { useState, useEffect } from "react";

export default function FlashReminderModal({
  alertMed,
  graceMinutes,
  guardianInfo,
  onConfirmTaken,
  onAutoEscalateGuardian,
  onSnoozeClose,
}) {
  const [slideValue, setSlideValue] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(graceMinutes * 60);
  const [escalated, setEscalated] = useState(false);

  useEffect(() => {
    if (!alertMed) return;
    setSlideValue(0);
    setSecondsLeft(graceMinutes * 60);
    setEscalated(false);
  }, [alertMed, graceMinutes]);

  // Countdown timer -> sends automatic Guardian message when timer hits 0
  useEffect(() => {
    if (!alertMed || escalated) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setEscalated(true);
          onAutoEscalateGuardian(alertMed);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [alertMed, escalated]);

  if (!alertMed) return null;

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const secs = String(secondsLeft % 60).padStart(2, "0");

  const handleSlideChange = (e) => {
    const val = Number(e.target.value);
    setSlideValue(val);
    if (val >= 92) {
      onConfirmTaken(alertMed.id);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.85)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "16px",
        zIndex: 2000,
      }}
    >
      <div
        className="flash-alert-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          background: "#111827",
          color: "#f8fafc",
          borderRadius: "20px",
          padding: "28px 24px",
          textAlign: "center",
          border: "3px solid #ef4444",
          boxShadow: "0 0 40px rgba(239, 68, 68, 0.65)",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "6px" }}>💊</div>
        <span
          style={{
            background: "#dc2626",
            color: "#fff",
            padding: "4px 12px",
            borderRadius: "20px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            letterSpacing: "1px",
          }}
        >
          DOSE REMINDER • {alertMed.time}
        </span>

        <h2 style={{ fontSize: "1.7rem", margin: "14px 0 6px" }}>{alertMed.name}</h2>

        {/* Countdown Timer */}
        <div
          style={{
            background: "#1e293b",
            padding: "10px 14px",
            borderRadius: "10px",
            margin: "14px 0 20px",
            fontSize: "0.95rem",
          }}
        >
          {!escalated ? (
            <>
              Auto-alert to Guardian <strong>{guardianInfo.name}</strong> in:{" "}
              <strong style={{ color: "#f59e0b", fontSize: "1.15rem" }}>
                {mins}:{secs}
              </strong>
            </>
          ) : (
            <span style={{ color: "#f87171", fontWeight: "bold" }}>
              🚨 Time Expired! Alert sent to {guardianInfo.name} ({guardianInfo.phone})
            </span>
          )}
        </div>

        {/* Interactive Phone-Style Slide to Take */}
        <div
          style={{
            position: "relative",
            background: "#0f172a",
            border: "2px solid #10b981",
            borderRadius: "40px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            marginBottom: "14px",
          }}
        >
          {/* Progress Fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${slideValue}%`,
              background: "rgba(16, 185, 129, 0.35)",
              pointerEvents: "none",
            }}
          />
          <span style={{ color: "#10b981", fontWeight: "bold", pointerEvents: "none", zIndex: 1 }}>
            {slideValue > 50 ? "Release to Confirm ✔" : "Slide Right to Mark Taken →→"}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={slideValue}
            onChange={handleSlideChange}
            onMouseUp={() => slideValue < 92 && setSlideValue(0)}
            onTouchEnd={() => slideValue < 92 && setSlideValue(0)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "grab",
              zIndex: 2,
            }}
          />
        </div>

        <button
          onClick={onSnoozeClose}
          style={{
            background: "transparent",
            border: "none",
            color: "#94a3b8",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Dismiss Window
        </button>
      </div>
    </div>
  );
}