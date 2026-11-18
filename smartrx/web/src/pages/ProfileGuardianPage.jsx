import React from "react";

export function PersonalInfoPage({ theme, personalInfo, setPersonalInfo }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "24px", borderRadius: "12px", maxWidth: "600px" }}>
      <h2 style={{ marginTop: 0 }}>👤 Personal Information</h2>
      {Object.entries(personalInfo).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", textTransform: "capitalize", marginBottom: "4px", fontWeight: "bold" }}>
            {key.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setPersonalInfo({ ...personalInfo, [key]: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text, boxSizing: "border-box" }}
          />
        </div>
      ))}
    </div>
  );
}

export function GuardianInfoPage({ theme, guardianInfo, setGuardianInfo }) {
  return (
    <div style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "24px", borderRadius: "12px", maxWidth: "600px" }}>
      <h2 style={{ marginTop: 0 }}>🛡️ Guardian & Emergency Info</h2>
      {Object.entries(guardianInfo).map(([key, value]) => (
        <div key={key} style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", textTransform: "capitalize", marginBottom: "4px", fontWeight: "bold" }}>
            {key.replace(/([A-Z])/g, " $1")}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setGuardianInfo({ ...guardianInfo, [key]: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text, boxSizing: "border-box" }}
          />
        </div>
      ))}
      <button onClick={() => alert(`Emergency alert sent to ${guardianInfo.name} (${guardianInfo.phone})`)} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
        🚨 Send Alert to Guardian
      </button>
    </div>
  );
}