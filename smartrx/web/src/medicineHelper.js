// Common Indian & Standard Prescription Medicines Database
export const KNOWN_MEDICINES = [
  "Paracetamol 650 mg",
  "Paracetamol 500 mg",
  "Metformin 500 mg",
  "Atorvastatin 10 mg",
  "Amlodipine 5 mg",
  "Amoxicillin 500 mg",
  "Azithromycin 500 mg",
  "Pantoprazole 40 mg",
  "Omeprazole 20 mg",
  "Cetirizine 10 mg",
  "Ibuprofen 400 mg",
  "Dolo 650 mg",
  "Crocin 500 mg",
  "Telmisartan 40 mg",
  "Losartan 50 mg",
  "Vitamin D3 60K",
  "Calcium + Vitamin D3",
  "B-Complex Capsule",
  "Cough Syrup 100 ml",
  "Montelukast 10 mg",
];

export function isGarbageOcrLine(rawLine) {
  const lettersOnly = rawLine.replace(/[^a-zA-Z]/g, "");
  const symbolsOnly = rawLine.replace(/[a-zA-Z0-9\s]/g, "");
  if (lettersOnly.length < 4) return true;
  if (symbolsOnly.length > lettersOnly.length * 0.4) return true;
  return false;
}

// Simple similarity check between OCR text and known medicine names
export function verifyMedicineName(rawLine) {
  const clean = rawLine.replace(/[^a-zA-Z0-9\s]/g, "").trim().toLowerCase();
  if (clean.length < 3) {
    return { isVerified: false, matchedName: rawLine, confidence: "Low (Noise)" };
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const med of KNOWN_MEDICINES) {
    const medLower = med.toLowerCase();
    const medFirstWord = medLower.split(" ")[0];

    // Check if first word or major letters match
    if (clean.includes(medFirstWord) || medFirstWord.includes(clean.split(" ")[0])) {
      bestMatch = med;
      bestScore = 90;
      break;
    }

    // Count matching characters in order
    let matches = 0;
    for (let char of medFirstWord) {
      if (clean.includes(char)) matches++;
    }
    const score = Math.round((matches / medFirstWord.length) * 100);
    if (score > bestScore && score >= 65) {
      bestScore = score;
      bestMatch = med;
    }
  }

  if (bestMatch) {
    return {
      isVerified: true,
      matchedName: bestMatch,
      confidence: `${bestScore}% Match`,
    };
  }

  return {
    isVerified: false,
    matchedName: rawLine,
    confidence: "Unverified Handwriting",
  };
}

// Convert uploaded prescription image to High-Contrast Black & White before OCR
export function enhanceImageForOcr(file) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = 2; // Upscale 2x so small handwriting is clearer
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Increase contrast & convert to grayscale
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        const contrasted = gray > 140 ? 255 : gray * 0.7;
        data[i] = contrasted;
        data[i + 1] = contrasted;
        data[i + 2] = contrasted;
      }
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.src = URL.createObjectURL(file);
  });
}