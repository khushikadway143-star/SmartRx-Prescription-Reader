import React, { useState } from "react";
import PrescriptionPdfModal from "./PrescriptionPdfModal";

export default function DrivePage({ theme, t, driveRecords, setDriveRecords, personalInfo, speakText, showVoiceBtn }) {
  const [selectedPdf, setSelectedPdf] = useState(null);

  const handleUploadOldRecord = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDriveRecords((prev) => [
      {
        id: Date.now(),
        title: file.name,
        date: new Date().toISOString().slice(0, 10),
        doctor: "Uploaded Old Record",
        notes: "Stored in SmartRx Personal Medical Drive.",
        imageUrl: url,
      },
      ...prev,
    ]);
  };

  return (
    <div className="med-card" style={{ background: theme.card, border: `1px solid ${theme.border}`, padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
        <div>
          <h2 style={{ margin: 0 }}>📁 Medical Drive (Prescriptions & Old Records)</h2>
          <p style={{ color: theme.muted, margin: "4px 0 0" }}>
            All doctor-verified PDFs and uploaded history files. Tap "Read Report Aloud" to listen in your selected language.
          </p>
        </div>
        <label style={{ background: theme.accent, color: "#fff", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          + Upload Old Medical Record
          <input type="file" accept="image/*,.pdf" onChange={handleUploadOldRecord} style={{ display: "none" }} />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
        {driveRecords.map((rec) => (
          <div key={rec.id} style={{ background: theme.subCard, padding: "16px", borderRadius: "10px", border: `1px solid ${theme.border}` }}>
            <h4 style={{ margin: "0 0 6px" }}>{rec.title}</h4>
            <p style={{ fontSize: "0.85rem", color: theme.muted, margin: "0 0 8px" }}>
              Date: {rec.date} • {rec.doctor}
            </p>
            <p style={{ fontSize: "0.95rem" }}>{rec.notes}</p>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
              {showVoiceBtn && (
                <button
                  onClick={() => speakText(t.speakReportIntro(rec.title, rec.notes))}
                  style={{ background: theme.accent, color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}
                >
                  🔊 Read Report Aloud
                </button>
              )}
              {rec.pdfData && (
                <button
                  onClick={() => setSelectedPdf(rec.pdfData)}
                  style={{ background: "#10b981", color: "#fff", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}
                >
                  📄 Open / Download PDF
                </button>
              )}
            </div>

            {rec.imageUrl && (
              <img src={rec.imageUrl} alt={rec.title} style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "6px", marginTop: "10px" }} />
            )}
          </div>
        ))}
      </div>

      <PrescriptionPdfModal prescriptionData={selectedPdf} personalInfo={personalInfo} onClose={() => setSelectedPdf(null)} />
    </div>
  );
}