import React, { useState } from "react";
import Tesseract from "tesseract.js";
import PrescriptionPdfModal from "./PrescriptionPdfModal";
import { KNOWN_MEDICINES, verifyMedicineName, isGarbageOcrLine, enhanceImageForOcr } from "../medicineHelper";
import { VIBRATION_PATTERNS } from "../languages";

export default function ReaderReminderPage({
  theme,
  t,
  medications,
  setMedications,
  doseHistory,
  onMarkTaken,
  onTriggerFlashAlert,
  personalInfo,
  setDriveRecords,
  speakText,
  showVoiceBtn,
  defaultVibration,
  triggerAccessibilityAlert,
}) {
  const [imagePreview, setImagePreview] = useState(null);
  const [isReading, setIsReading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [fullRawText, setFullRawText] = useState("");

  const [pendingMeds, setPendingMeds] = useState([]);
  const [doctorName, setDoctorName] = useState("Dr. R. K. Verma");
  const [doctorReg, setDoctorReg] = useState("MCI-45892");
  const [confirmedPdfData, setConfirmedPdfData] = useState(null);

  // --- PAST PROGRESS CALCULATIONS ---
  const totalTakenCount = doseHistory.length;
  const medCounts = doseHistory.reduce((acc, item) => {
    acc[item.name] = (acc[item.name] || 0) + 1;
    return acc;
  }, {});
  const mostTakenMed =
    Object.keys(medCounts).length > 0
      ? Object.entries(medCounts).sort((a, b) => b[1] - a[1])[0]
      : ["None yet", 0];

  const handleWholePrescriptionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsReading(true);
    setPendingMeds([]);
    setProgressText("Scanning prescription...");

    try {
      const enhancedDataUrl = await enhanceImageForOcr(file);
      const result = await Tesseract.recognize(enhancedDataUrl, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgressText(`Reading: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      setFullRawText(text);

      // Filter out symbol noise & verify against real medicines
      const cleanLines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !isGarbageOcrLine(line));

      const verifiedList = cleanLines.map((line, index) => {
        const check = verifyMedicineName(line);
        return {
          id: Date.now() + index,
          rawOcr: line,
          name: check.matchedName,
          isVerified: check.isVerified,
          confidence: check.confidence,
          time: "09:00",
          vibration: defaultVibration,
        };
      });

      setPendingMeds(verifiedList);
      speakText(t.speakScanComplete(verifiedList.length));
    } catch (err) {
      alert("Could not read image. Try a clearer photo.");
    } finally {
      setIsReading(false);
      setProgressText("");
    }
  };

  const updatePendingMed = (id, field, value) => {
    setPendingMeds((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };
        if (field === "name") {
          const recheck = verifyMedicineName(value);
          updated.isVerified = recheck.isVerified;
          updated.confidence = recheck.isVerified ? "✔ Verified" : "Edited";
        }
        return updated;
      })
    );
  };

  const removePendingMed = (id) => {
    setPendingMeds((prev) => prev.filter((m) => m.id !== id));
  };

  const addManualRow = () => {
    setPendingMeds((prev) => [
      ...prev,
      { id: Date.now(), rawOcr: "Manual", name: "Paracetamol 650 mg", isVerified: true, confidence: "✔ Verified", time: "20:00", vibration: defaultVibration },
    ]);
  };

  const handleDoctorConfirm = () => {
    const validMeds = pendingMeds.filter((m) => m.name.trim() !== "");
    if (validMeds.length === 0) return;

    const newReminders = validMeds.map((m) => ({
      id: Date.now() + Math.random(),
      time: m.time,
      name: m.name,
      status: "Upcoming",
      vibration: m.vibration || defaultVibration,
    }));
    setMedications((prev) => [...prev, ...newReminders]);

    const pdfRecord = {
      id: Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().slice(0, 10),
      doctorName,
      doctorReg,
      medicines: validMeds,
      rawText: fullRawText,
    };

    setDriveRecords((prev) => [
      {
        id: pdfRecord.id,
        title: `Verified Rx (${pdfRecord.date})`,
        date: pdfRecord.date,
        doctor: doctorName,
        notes: validMeds.map((m) => `${m.name} (${m.time})`).join(", "),
        pdfData: pdfRecord,
      },
      ...prev,
    ]);

    setConfirmedPdfData(pdfRecord);
    setPendingMeds([]);
    speakText("Doctor verified. Reminders active.");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* TOP BAR: PAST PROGRESS ANALYTICS */}
      <div className="responsive-grid">
        <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "18px" }}>
          <div style={{ color: theme.muted, fontSize: "0.85rem" }}>Total Doses Taken</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#10b981", marginTop: "4px" }}>
            {totalTakenCount} Doses
          </div>
        </div>

        <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "18px" }}>
          <div style={{ color: theme.muted, fontSize: "0.85rem" }}>Most Taken Medicine</div>
          <div style={{ fontSize: "1.35rem", fontWeight: "bold", color: theme.accent, marginTop: "4px" }}>
            {mostTakenMed[0]} ({mostTakenMed[1]}×)
          </div>
        </div>

        <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "18px" }}>
          <div style={{ color: theme.muted, fontSize: "0.85rem" }}>Today's Remaining</div>
          <div style={{ fontSize: "1.8rem", fontWeight: "bold", marginTop: "4px" }}>
            {medications.filter((m) => m.status !== "Taken").length} Pending
          </div>
        </div>
      </div>

      {/* MAIN GRID: READER + REMINDERS */}
      <div className="responsive-grid">
        
        {/* 1. PRESCRIPTION READER */}
        <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "20px" }}>
          <h3 style={{ marginTop: 0 }}>{t.readerHeading}</h3>
          <input type="file" accept="image/*" onChange={handleWholePrescriptionUpload} style={{ marginBottom: "14px", display: "block" }} />

          {isReading && <p style={{ color: theme.accent, fontWeight: "bold" }}>⏳ {progressText}</p>}

          {imagePreview && (
            <img
              src={imagePreview}
              alt="Prescription"
              style={{ width: "100%", maxHeight: "220px", objectFit: "contain", borderRadius: "8px", background: "#fff", marginBottom: "14px" }}
            />
          )}

          {pendingMeds.length > 0 && (
            <div style={{ border: "2px solid #f59e0b", background: theme.subCard, padding: "14px", borderRadius: "10px" }}>
              <h4 style={{ margin: "0 0 10px", color: "#f59e0b" }}>🩺 Doctor Verification</h4>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  placeholder="Doctor Name"
                  style={{ padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}
                />
                <input
                  type="text"
                  value={doctorReg}
                  onChange={(e) => setDoctorReg(e.target.value)}
                  placeholder="Reg No."
                  style={{ padding: "8px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }}
                />
              </div>

              {pendingMeds.map((med) => (
                <div key={med.id} style={{ background: theme.bg, border: `1px solid ${med.isVerified ? "#10b981" : "#f59e0b"}`, padding: "8px", borderRadius: "8px", marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "4px" }}>
                    <span style={{ color: med.isVerified ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>
                      {med.isVerified ? `✔ ${med.confidence}` : `⚠️ Check: "${med.rawOcr}"`}
                    </span>
                    <button onClick={() => removePendingMed(med.id)} style={{ background: "transparent", color: "#ef4444", border: "none", cursor: "pointer" }}>✕</button>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updatePendingMed(med.id, "name", e.target.value)}
                      style={{ flex: 1, minWidth: "120px", padding: "6px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text }}
                    />
                    <select
                      value=""
                      onChange={(e) => e.target.value && updatePendingMed(med.id, "name", e.target.value)}
                      style={{ padding: "6px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text }}
                    >
                      <option value="">Pick Med...</option>
                      {KNOWN_MEDICINES.map((km) => (
                        <option key={km} value={km}>{km}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={med.time}
                      onChange={(e) => updatePendingMed(med.id, "time", e.target.value)}
                      style={{ padding: "6px", borderRadius: "6px", border: `1px solid ${theme.border}`, background: theme.subCard, color: theme.text }}
                    />
                  </div>
                </div>
              ))}

              <button onClick={addManualRow} style={{ width: "100%", padding: "6px", background: "transparent", color: theme.accent, border: `1px dashed ${theme.accent}`, borderRadius: "6px", cursor: "pointer", marginBottom: "10px" }}>
                + Add Row
              </button>

              <button className="med-btn" onClick={handleDoctorConfirm} style={{ width: "100%", background: "#10b981", color: "#fff", border: "none" }}>
                {t.doctorConfirmBtn}
              </button>
            </div>
          )}
        </div>

        {/* 2. VERIFIED REMINDERS + FLASH DEMO */}
        <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0 }}>{t.reminderHeading}</h3>
            {medications.find((m) => m.status !== "Taken") && (
              <button
                onClick={() => onTriggerFlashAlert(medications.find((m) => m.status !== "Taken"))}
                style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
              >
                ⚡ Test Flash Alert
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {medications.map((med) => (
              <div
                key={med.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: theme.subCard,
                  padding: "12px 14px",
                  borderRadius: "10px",
                }}
              >
                <div>
                  <strong style={{ color: theme.accent, marginRight: "10px" }}>{med.time}</strong>
                  <span>{med.name}</span>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {showVoiceBtn && (
                    <button
                      onClick={() => triggerAccessibilityAlert(t.speakMedSchedule(med.name, med.time), med.vibration || defaultVibration)}
                      style={{ background: "transparent", border: `1px solid ${theme.border}`, color: theme.text, borderRadius: "6px", padding: "5px 8px", cursor: "pointer" }}
                    >
                      🔊
                    </button>
                  )}
                  {med.status !== "Taken" ? (
                    <button
                      onClick={() => onMarkTaken(med.id)}
                      style={{ background: theme.accent, color: "#fff", border: "none", padding: "6px 12px", borderRadius: "20px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Take
                    </button>
                  ) : (
                    <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "0.9rem" }}>✔ Taken</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PAST DOSE LOG TABLE */}
      <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "20px" }}>
        <h3 style={{ marginTop: 0 }}>📊 Past Progress Log</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {doseHistory.map((item, idx) => (
            <div key={idx} style={{ background: theme.subCard, padding: "8px 14px", borderRadius: "8px", fontSize: "0.9rem" }}>
              ✔ <strong>{item.name}</strong> • <span style={{ color: theme.muted }}>{item.takenAt}</span>
            </div>
          ))}
        </div>
      </div>

      <PrescriptionPdfModal prescriptionData={confirmedPdfData} personalInfo={personalInfo} onClose={() => setConfirmedPdfData(null)} />
    </div>
  );
}