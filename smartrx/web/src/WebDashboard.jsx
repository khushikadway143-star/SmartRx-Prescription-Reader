import React, { useState, useEffect } from "react";
import "./styles/medicalTheme.css";
import { THEMES } from "./themes";
import { LANGUAGES, VIBRATION_PATTERNS } from "./languages";
import SmartRxLogo from "./components/SmartRxLogo";
import MedicalBackground from "./components/MedicalBackground";
import LoginPage from "./pages/LoginPage";
import ReaderReminderPage from "./pages/ReaderReminderPage";
import DrivePage from "./pages/DrivePage";
import { PersonalInfoPage, GuardianInfoPage } from "./pages/ProfileGuardianPage";
import { SettingsPage, HelpPage } from "./pages/SettingsHelpPage";
import FlashReminderModal from "./components/FlashReminderModal";

export default function WebDashboard() {
  // Login & Navigation State
  const [userContact, setUserContact] = useState(null);
  const [activePage, setActivePage] = useState("home");

  // Theme, Language & Accessibility States
  const [themeKey, setThemeKey] = useState("night");
  const [langKey, setLangKey] = useState("en");
  const [fontSize, setFontSize] = useState(17);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [showVoiceBtn, setShowVoiceBtn] = useState(true);
  const [autoSpeakReminder, setAutoSpeakReminder] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [defaultVibration, setDefaultVibration] = useState("doublePulse");
  const [vibratingBanner, setVibratingBanner] = useState(null);
  const [activeAlert, setActiveAlert] = useState(null);

  const theme = THEMES[themeKey];
  const t = LANGUAGES[langKey];

  // Shared Patient & Guardian Data
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Asha Sharma",
    age: "64",
    bloodGroup: "B+",
    allergies: "Penicillin",
    phone: "+91 98765 43210",
  });

  const [guardianInfo, setGuardianInfo] = useState({
    name: "Rohan Sharma",
    relation: "Son",
    phone: "+91 91234 56789",
    email: "rohan@example.com",
  });

  const [medications, setMedications] = useState([
    { id: 1, time: "08:00", name: "Metformin 500 mg", status: "Taken", vibration: "doublePulse" },
    { id: 2, time: "21:00", name: "Atorvastatin 10 mg", status: "Upcoming", vibration: "singleLong" },
  ]);

  const [driveRecords, setDriveRecords] = useState([
    {
      id: 101,
      title: "Old Cardiology Report",
      date: "2026-09-10",
      doctor: "Dr. R. K. Verma",
      notes: "Blood pressure normal. Continue Atorvastatin 10 mg after dinner.",
    },
  ]);

  // Voice Reader Function (Speaks in selected language: English, Hindi, or Marathi)
  const speakText = (text) => {
    if (!showVoiceBtn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = t.voiceCode;
    utterance.rate = speechRate;
    window.speechSynthesis.speak(utterance);
  };

  // Combined Voice + Deaf/Blind Tactile Vibration Trigger
  const triggerAccessibilityAlert = (spokenMessage, vibKey = defaultVibration) => {
    if (autoSpeakReminder) {
      speakText(spokenMessage);
    }
    if (vibrationEnabled) {
      const vibObj = VIBRATION_PATTERNS[vibKey] || VIBRATION_PATTERNS[defaultVibration];
      if ("vibrate" in navigator) {
        navigator.vibrate(vibObj.pattern);
      }
      setVibratingBanner(vibObj.label);
      setTimeout(() => setVibratingBanner(null), 2800);
    }
  };

  const [graceMinutes, setGraceMinutes] = useState(10);
  const [doseHistory, setDoseHistory] = useState([
    { name: "Metformin 500 mg", takenAt: "Today 08:00 AM" },
    { name: "Metformin 500 mg", takenAt: "Yesterday 08:05 AM" },
    { name: "Atorvastatin 10 mg", takenAt: "Yesterday 09:00 PM" },
    { name: "Metformin 500 mg", takenAt: "2 days ago" },
  ]);
  
  const handleMarkTaken = (id) => {
  const med = medications.find((m) => m.id === id);
  setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Taken" } : m)));
    if (med) {
      setDoseHistory((prev) => [{ name: med.name, takenAt: `Today ${new Date().toTimeString().slice(0, 5)}` }, ...prev]);
    }
    if (activeAlert?.id === id) setActiveAlert(null);
  };

  const handleAutoEscalateGuardian = (med) => {
    setMedications((prev) => prev.map((m) => (m.id === med.id ? { ...m, status: "Missed" } : m)));
    speakText(`Alert sent to guardian ${guardianInfo.name}. ${med.name} was not taken within ${graceMinutes} minutes.`);
  };

  // Live Reminder Clock Checker (Checks every 30 seconds)
  useEffect(() => {
    if (!userContact) return;
    const timer = setInterval(() => {
      const currentHHMM = new Date().toTimeString().slice(0, 5);
      medications.forEach((med) => {
        if (med.time === currentHHMM && med.status === "Upcoming") {
          setActiveAlert(med);
          triggerAccessibilityAlert(
            t.speakReminderAlert(med.name, med.time),
            med.vibration || defaultVibration
          );
        }
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [medications, userContact, langKey, vibrationEnabled, autoSpeakReminder]);

  // Show Login Page first if not logged in
  if (!userContact) {
    return (
      <LoginPage
        theme={theme}
        themeKey={themeKey}
        setThemeKey={setThemeKey}
        langKey={langKey}
        setLangKey={setLangKey}
        t={t}
        onLoginSuccess={(contact) => setUserContact(contact)}
      />
    );
  }

  const menu = [
    { id: "home", label: t.navHome },
    { id: "drive", label: t.navDrive },
    { id: "personal", label: t.navPersonal },
    { id: "guardian", label: t.navGuardian },
    { id: "settings", label: t.navSettings },
    { id: "help", label: t.navHelp },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontSize: `${fontSize}px`,
        position: "relative",
        transition: "all 0.25s ease",
      }}
    >
      <MedicalBackground themeKey={themeKey} />

      {/* Tactile Vibration Banner for Deaf/Blind Accessibility Demo */}
      {vibratingBanner && (
        <div style={{ background: "#d97706", color: "#fff", padding: "12px 20px", textAlign: "center", fontWeight: "bold", position: "relative", zIndex: 10 }}>
          📳 TACTILE VIBRATION ACTIVE: {vibratingBanner}
        </div>
      )}

      {/* Live Reminder Popup Banner */}
      {activeAlert && (
        <div style={{ background: "#dc2626", color: "#fff", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 10 }}>
          <div>
            <strong>⏰ REMINDER:</strong> {t.speakReminderAlert(activeAlert.name, activeAlert.time)}
          </div>
          <button
            onClick={() => {
              setMedications((prev) => prev.map((m) => (m.id === activeAlert.id ? { ...m, status: "Taken" } : m)));
              setActiveAlert(null);
            }}
            style={{ background: "#fff", color: "#dc2626", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
          >
            Mark Taken
          </button>
        </div>
      )}

      {/* Top Header with SmartRx Logo, Language Selector & Light Modes */}
      <header
        style={{
          background: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <SmartRxLogo size={44} showTagline={true} textColor={theme.text} />
          <span style={{ color: theme.muted, fontSize: "0.9rem" }}>
            | {personalInfo.fullName} ({userContact})
          </span>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Language Dropdown */}
          <select
            value={langKey}
            onChange={(e) => setLangKey(e.target.value)}
            style={{
              padding: "7px 10px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              background: theme.subCard,
              color: theme.text,
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <option key={code} value={code}>
                🌐 {info.label}
              </option>
            ))}
          </select>

          <button onClick={() => setThemeKey("day")} style={{ padding: "7px 11px", borderRadius: "8px", cursor: "pointer" }}>☀️ Day</button>
          <button onClick={() => setThemeKey("night")} style={{ padding: "7px 11px", borderRadius: "8px", cursor: "pointer" }}>🌙 Night</button>
          <button onClick={() => setThemeKey("dimYellow")} style={{ padding: "7px 11px", borderRadius: "8px", cursor: "pointer" }}>🕯️ Dim Yellow</button>
          <button
            onClick={() => setUserContact(null)}
            style={{ padding: "7px 14px", borderRadius: "8px", background: "#dc2626", color: "#fff", border: "none", fontWeight: "bold", cursor: "pointer" }}
          >
            {t.logoutBtn}
          </button>
        </div>
      </header>

      {/* Navigation Index Bar */}
      <nav
        style={{
          background: theme.card,
          borderBottom: `1px solid ${theme.border}`,
          padding: "10px 24px",
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              padding: "9px 15px",
              borderRadius: "8px",
              border: "none",
              background: activePage === item.id ? theme.accent : theme.subCard,
              color: activePage === item.id ? "#fff" : theme.text,
              fontWeight: activePage === item.id ? "bold" : "normal",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Active Page Content */}
      <main className="page-fade" style={{ padding: "24px", maxWidth: "1440px", margin: "0 auto" }}>
        {activePage === "home" && (
          <ReaderReminderPage
            theme={theme}
            t={t}
            medications={medications}
            setMedications={setMedications}
            doseHistory={doseHistory}
            onMarkTaken={handleMarkTaken}
            onTriggerFlashAlert={(med) => {
              setActiveAlert(med);
              triggerAccessibilityAlert(
                t.speakReminderAlert(med.name, med.time),
                med.vibration || defaultVibration
              );
            }}
            personalInfo={personalInfo}
            setDriveRecords={setDriveRecords}
            speakText={speakText}
            showVoiceBtn={showVoiceBtn}
            defaultVibration={defaultVibration}
            triggerAccessibilityAlert={triggerAccessibilityAlert}
          />
        )}
        {activePage === "drive" && (
          <DrivePage
            theme={theme}
            t={t}
            driveRecords={driveRecords}
            setDriveRecords={setDriveRecords}
            personalInfo={personalInfo}
            speakText={speakText}
            showVoiceBtn={showVoiceBtn}
          />
        )}
        {activePage === "personal" && (
          <PersonalInfoPage theme={theme} personalInfo={personalInfo} setPersonalInfo={setPersonalInfo} />
        )}
        {activePage === "guardian" && (
          <GuardianInfoPage theme={theme} guardianInfo={guardianInfo} setGuardianInfo={setGuardianInfo} />
        )}
        {activePage === "settings" && (
          <SettingsPage
            theme={theme}
            themeKey={themeKey}
            setThemeKey={setThemeKey}
            langKey={langKey}
            setLangKey={setLangKey}
            fontSize={fontSize}
            setFontSize={setFontSize}
            speechRate={speechRate}
            setSpeechRate={setSpeechRate}
            showVoiceBtn={showVoiceBtn}
            setShowVoiceBtn={setShowVoiceBtn}
            autoSpeakReminder={autoSpeakReminder}
            setAutoSpeakReminder={setAutoSpeakReminder}
            vibrationEnabled={vibrationEnabled}
            setVibrationEnabled={setVibrationEnabled}
            defaultVibration={defaultVibration}
            setDefaultVibration={setDefaultVibration}
            triggerAccessibilityAlert={triggerAccessibilityAlert}
          />
        )}
        {activePage === "help" && <HelpPage theme={theme} />}

      <FlashReminderModal
        alertMed={activeAlert}
        graceMinutes={graceMinutes}
        guardianInfo={guardianInfo}
        onConfirmTaken={handleMarkTaken}
        onAutoEscalateGuardian={handleAutoEscalateGuardian}
        onSnoozeClose={() => setActiveAlert(null)}
      />
      </main>
    </div>
  );
}