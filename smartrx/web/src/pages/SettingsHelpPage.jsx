import React, { useState } from "react";
import { THEMES } from "../themes";
import { LANGUAGES, VIBRATION_PATTERNS } from "../languages";

export function SettingsPage({
  theme,
  themeKey = "night",
  setThemeKey = () => {},
  langKey = "en",
  setLangKey = () => {},
  fontSize = 17,
  setFontSize = () => {},
  speechRate = 0.95,
  setSpeechRate = () => {},
  showVoiceBtn = true,
  setShowVoiceBtn = () => {},
  autoSpeakReminder = true,
  setAutoSpeakReminder = () => {},
  vibrationEnabled = true,
  setVibrationEnabled = () => {},
  defaultVibration = "doublePulse",
  setDefaultVibration = () => {},
  graceMinutes = 10,
  setGraceMinutes = () => {},
  triggerAccessibilityAlert = () => {},
}) {
  const [testingVib, setTestingVib] = useState(false);

  const handleTestAccessibility = () => {
    setTestingVib(true);
    const activeLang = LANGUAGES[langKey] || LANGUAGES.en;
    const sampleText = activeLang.speakReminderAlert("Metformin 500 mg", "09:00");
    triggerAccessibilityAlert(sampleText, defaultVibration);
    setTimeout(() => setTestingVib(false), 1200);
  };

  return (
    <div
      className="med-card"
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        padding: "24px",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginTop: 0 }}>⚙️ Settings & Accessibility</h2>

      {/* 1. LANGUAGE SELECTION */}
      <div style={{ background: theme.subCard, padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>
          🌐 Language (UI + Medical Report & Reminder Voice)
        </label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {Object.entries(LANGUAGES).map(([code, info]) => (
            <button
              key={code}
              onClick={() => setLangKey(code)}
              style={{
                padding: "9px 16px",
                borderRadius: "8px",
                border: `2px solid ${langKey === code ? theme.accent : theme.border}`,
                background: langKey === code ? theme.accent : theme.bg,
                color: langKey === code ? "#fff" : theme.text,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {info.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. GUARDIAN AUTO-ALERT GRACE TIMER */}
      <div style={{ background: theme.subCard, padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "6px" }}>
          ⏱️ Guardian Auto-Alert Timer: {graceMinutes} Minutes
        </label>
        <input
          type="range"
          min="1"
          max="30"
          value={graceMinutes}
          onChange={(e) => setGraceMinutes(Number(e.target.value))}
          style={{ width: "100%" }}
        />
        <small style={{ color: theme.muted }}>
          Sends an automatic alert to the Guardian if dose is not confirmed within {graceMinutes} min.
        </small>
      </div>

      {/* 3. DEAF & BLIND TACTILE VIBRATION SETTINGS */}
      <div
        style={{
          background: theme.subCard,
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "16px",
          borderLeft: `4px solid ${theme.accent}`,
        }}
      >
        <h3 style={{ margin: "0 0 8px" }}>📳 Deaf & Blind Tactile Vibration</h3>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={vibrationEnabled}
            onChange={(e) => setVibrationEnabled(e.target.checked)}
          />
          Enable Vibration Patterns on Reminders
        </label>

        <select
          value={defaultVibration}
          onChange={(e) => setDefaultVibration(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: `1px solid ${theme.border}`,
            background: theme.bg,
            color: theme.text,
            marginBottom: "12px",
          }}
        >
          {Object.values(VIBRATION_PATTERNS).map((vib) => (
            <option key={vib.id} value={vib.id}>
              {vib.label}
            </option>
          ))}
        </select>

        <button
          onClick={handleTestAccessibility}
          className="med-btn"
          style={{
            background: testingVib ? "#10b981" : theme.accent,
            color: "#fff",
            border: "none",
          }}
        >
          {testingVib ? "📳 Vibrating & Speaking..." : "▶ Test Voice & Vibration"}
        </button>
      </div>

      {/* 4. VOICE READER OPTIONS */}
      <div style={{ background: theme.subCard, padding: "16px", borderRadius: "12px", marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 10px" }}>🔊 Voice Reader</h3>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={showVoiceBtn}
            onChange={(e) => setShowVoiceBtn(e.target.checked)}
          />
          Show "Read Aloud" Speaker Buttons
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={autoSpeakReminder}
            onChange={(e) => setAutoSpeakReminder(e.target.checked)}
          />
          Speak Medicine & Time Automatically on Reminder
        </label>

        <label style={{ display: "block", fontWeight: "600", marginBottom: "4px" }}>
          Voice Speed: {speechRate}x
        </label>
        <input
          type="range"
          min="0.6"
          max="1.4"
          step="0.1"
          value={speechRate}
          onChange={(e) => setSpeechRate(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>

      {/* 5. LIGHTING MODE & TEXT SIZE */}
      <div style={{ background: theme.subCard, padding: "16px", borderRadius: "12px" }}>
        <label style={{ display: "block", fontWeight: "bold", marginBottom: "8px" }}>Screen Light Mode:</label>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
          {Object.entries(THEMES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setThemeKey(key)}
              style={{
                padding: "9px 14px",
                borderRadius: "8px",
                border: `2px solid ${themeKey === key ? theme.accent : theme.border}`,
                background: val.bg,
                color: val.text,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              {val.name}
            </button>
          ))}
        </div>

        <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>
          Text Size: {fontSize}px
        </label>
        <input
          type="range"
          min="14"
          max="22"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}

export function HelpPage({ theme }) {
  return (
    <div
      className="med-card"
      style={{
        background: theme.card,
        border: `1px solid ${theme.border}`,
        padding: "24px",
        maxWidth: "760px",
        margin: "0 auto",
      }}
    >
      <h2 style={{ marginTop: 0 }}>❓ Quick Guide</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ background: theme.subCard, padding: "14px", borderRadius: "8px" }}>
          <strong>1. Scan & Doctor Confirm:</strong> Upload a prescription image, verify/select real medicines, and confirm with Doctor details to generate a clean PDF and activate reminders.
        </div>
        <div style={{ background: theme.subCard, padding: "14px", borderRadius: "8px" }}>
          <strong>2. Slide-to-Take & 10-Min Guardian Timer:</strong> When a reminder flashes, slide right to mark it taken. If missed past the timer, the Guardian is alerted automatically.
        </div>
        <div style={{ background: theme.subCard, padding: "14px", borderRadius: "8px" }}>
          <strong>3. Language & Tactile Vibration:</strong> Switch between English, Hindi, or Marathi and test distinct vibration patterns for deaf/blind accessibility in Settings.
        </div>
      </div>
    </div>
  );
}