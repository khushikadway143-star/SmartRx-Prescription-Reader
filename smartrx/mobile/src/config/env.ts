/** Every URL and tunable number lives here, so nothing is hard-coded elsewhere. */
export const ENV = {
  API_BASE: 'https://api.example.com',
  WS_URL: 'wss://api.example.com/v1/guardian-link',
  OCR_ENDPOINT: 'https://api.example.com/v1/ocr/handwriting',
  RXNAV_BASE: 'https://rxnav.nlm.nih.gov/REST',
  OPENFDA_LABEL: 'https://api.fda.gov/drug/label.json',
  EMERGENCY_NUMBER: '112', // India; change per locale
} as const;

export const LIMITS = {
  MISSED_DOSE_GRACE_MS: 30 * 60 * 1000,
  MATCH_MIN_SCORE: 50, // RxNorm approximateTerm score; tune on your own test set
  OCR_MIN_CONF: 0.6,
  FRAME_W: 960,
  FRAME_H: 720,
  GALLERY_MAX_PX: 1600,
  HTTP_TIMEOUT_MS: 15000,
} as const;
