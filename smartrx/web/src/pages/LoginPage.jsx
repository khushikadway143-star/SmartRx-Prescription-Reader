import React, { useState } from "react";
import MedicalBackground from "../components/MedicalBackground";

export default function LoginPage({ theme, themeKey, setThemeKey, onLoginSuccess }) {
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [userOtp, setUserOtp] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  const sendOtp = (e) => {
    e.preventDefault();
    if (contact.trim().length < 5) {
      setError("Please enter a valid email ID or 10-digit mobile number.");
      return;
    }
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(randomCode);
    setStep(2);
    setError("");
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (userOtp.trim() === otp) {
      onLoginSuccess(contact);
    } else {
      setError("Incorrect OTP! Please enter the 6-digit code shown in the green box.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <MedicalBackground themeKey={themeKey} />

      <div
        className="med-card page-fade"
        style={{
          width: "100%",
          maxWidth: "920px",
          background: theme.card,
          border: `1px solid ${theme.border}`,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          overflow: "hidden",
        }}
      >
        {/* Left Friendly Medical Welcome Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #0f766e 100%)",
            color: "#ffffff",
            padding: "40px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="pulse-badge" style={{ fontSize: "3rem", marginBottom: "12px", display: "inline-block" }}>
              🩺
            </div>
            <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>SmartRx Care</h1>
            <p style={{ fontSize: "1.05rem", lineHeight: "1.6", opacity: 0.92 }}>
              Your friendly AI Prescription Reader, Doctor-Verified Digital Rx Generator, and Smart Pill Reminder Assistant.
            </p>
          </div>

          <div style={{ marginTop: "30px", fontSize: "0.95rem", background: "rgba(255,255,255,0.12)", padding: "14px", borderRadius: "10px" }}>
            <div>✔ Full Prescription Handwriting OCR</div>
            <div style={{ marginTop: "6px" }}>✔ Doctor Verification & Clean PDF Export</div>
            <div style={{ marginTop: "6px" }}>✔ Voice Reminders & Guardian Safety Alerts</div>
          </div>
        </div>

        {/* Right OTP Login Form */}
        <div style={{ padding: "40px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontSize: "1.6rem" }}>Patient & Doctor Login</h2>
            <select
              value={themeKey}
              onChange={(e) => setThemeKey(e.target.value)}
              style={{ background: theme.subCard, color: theme.text, border: `1px solid ${theme.border}`, padding: "6px 10px", borderRadius: "8px", fontSize: "0.95rem" }}
            >
              <option value="night">🌙 Night</option>
              <option value="day">☀️ Day</option>
              <option value="dimYellow">🕯️ Dim Yellow</option>
            </select>
          </div>

          {step === 1 ? (
            <form onSubmit={sendOtp}>
              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "1.05rem" }}>
                Email ID or Mobile Number
              </label>
              <input
                className="med-input"
                type="text"
                placeholder="e.g. asha@gmail.com or 9876543210"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                style={{ border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text, marginBottom: "18px" }}
              />
              {error && <p style={{ color: "#ef4444", marginTop: 0 }}>{error}</p>}
              <button className="med-btn" type="submit" style={{ width: "100%", background: theme.accent, color: "#fff", border: "none" }}>
                Send 6-Digit OTP →
              </button>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <div style={{ background: theme.subCard, padding: "14px", borderRadius: "10px", marginBottom: "18px", borderLeft: "4px solid #10b981" }}>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>OTP sent to: <strong>{contact}</strong></p>
                <p style={{ margin: "6px 0 0", fontSize: "1.25rem" }}>
                  Generated OTP: <strong style={{ color: "#10b981", letterSpacing: "3px" }}>{otp}</strong>
                </p>
              </div>

              <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "1.05rem" }}>
                Enter 6-Digit OTP
              </label>
              <input
                className="med-input"
                type="text"
                maxLength={6}
                placeholder="● ● ● ● ● ●"
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                style={{
                  border: `1px solid ${theme.border}`,
                  background: theme.subCard,
                  color: theme.text,
                  marginBottom: "18px",
                  textAlign: "center",
                  fontSize: "1.3rem",
                  letterSpacing: "5px",
                }}
              />
              {error && <p style={{ color: "#ef4444", marginTop: 0 }}>{error}</p>}
              <button className="med-btn" type="submit" style={{ width: "100%", background: "#10b981", color: "#fff", border: "none", marginBottom: "10px" }}>
                Verify OTP & Open Dashboard
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ width: "100%", padding: "10px", background: "transparent", color: theme.muted, border: `1px solid ${theme.border}`, borderRadius: "8px", cursor: "pointer" }}
              >
                ← Change Email / Phone
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}