import React from "react";

export default function PrescriptionPdfModal({ prescriptionData, personalInfo, onClose }) {
  if (!prescriptionData) return null;

  const handlePrintPdf = () => {
    window.print(); // Opens browser's native "Save as PDF" dialog cleanly
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
      <div style={{ background: "#ffffff", color: "#0f172a", width: "100%", maxWidth: "700px", borderRadius: "10px", padding: "30px", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Action Buttons (Hidden when printing to PDF) */}
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid #cbd5e1", paddingBottom: "10px" }}>
          <button onClick={handlePrintPdf} style={{ background: "#2563eb", color: "#fff", border: "none", padding: "10px 18px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            🖨️ Save / Download Proper PDF
          </button>
          <button onClick={onClose} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "6px", cursor: "pointer" }}>
            Close
          </button>
        </div>

        {/* Official Clean Prescription Layout */}
        <div id="printable-prescription" style={{ border: "2px solid #1e293b", padding: "24px", borderRadius: "8px", fontFamily: "Georgia, serif" }}>
          <div style={{ borderBottom: "2px solid #1e293b", paddingBottom: "12px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ margin: 0, color: "#1e3a8a" }}>SmartRx Digital Medical Prescription</h2>
              <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#475569" }}>Verified & Digitized Handwritten Record</p>
            </div>
            <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
              <strong>Date:</strong> {prescriptionData.date}<br />
              <strong>Rx ID:</strong> #{prescriptionData.id}
            </div>
          </div>

          {/* Patient & Doctor Details */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "6px", marginBottom: "18px", fontSize: "0.95rem" }}>
            <div><strong>Patient Name:</strong> {personalInfo.fullName}</div>
            <div><strong>Age / Blood Group:</strong> {personalInfo.age} yrs / {personalInfo.bloodGroup}</div>
            <div><strong>Verified By:</strong> {prescriptionData.doctorName}</div>
            <div><strong>Reg. No:</strong> {prescriptionData.doctorReg}</div>
          </div>

          {/* Clean Typed Medicine Table */}
          <h3 style={{ margin: "0 0 10px", color: "#1e3a8a" }}>℞ Prescribed Medications</h3>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
            <thead>
              <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1" }}>#</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Medicine Name & Dosage</th>
                <th style={{ padding: "8px", border: "1px solid #cbd5e1" }}>Reminder Time</th>
              </tr>
            </thead>
            <tbody>
              {prescriptionData.medicines.map((med, index) => (
                <tr key={index}>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>{index + 1}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1", fontWeight: "bold" }}>{med.name}</td>
                  <td style={{ padding: "8px", border: "1px solid #cbd5e1" }}>{med.time}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Original Full OCR Text Summary */}
          <div style={{ background: "#f1f5f9", padding: "10px", borderRadius: "6px", fontSize: "0.85rem", marginBottom: "20px" }}>
            <strong>Full Extracted Notes:</strong>
            <p style={{ whiteSpace: "pre-line", margin: "6px 0 0" }}>{prescriptionData.rawText}</p>
          </div>

          {/* Doctor Approval Stamp */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "30px" }}>
            <div style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: "bold" }}>
              ✔ DIGITALLY CONFIRMED BY DOCTOR BEFORE REMINDER ACTIVATION
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "cursive", fontSize: "1.2rem", color: "#1e3a8a" }}>{prescriptionData.doctorName}</div>
              <div style={{ borderTop: "1px solid #0f172a", paddingTop: "4px", fontSize: "0.85rem" }}>Authorized Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}