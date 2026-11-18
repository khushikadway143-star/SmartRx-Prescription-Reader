/** Your handwriting-recognition service (CRNN + CTC model, or Google Document AI behind a proxy). */
import { Buffer } from 'buffer';
import { ENV } from '../config/env';
import type { OcrLine } from '../types';
import { http } from './http';

const post = (body: object) =>
  http<{ lines: OcrLine[] }>(ENV.OCR_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeoutMs: 45000,
  }).then((r) => r.lines);

/** Already pre-processed 8-bit image (grayscale / Otsu binary). */
export const recognizeGray = (bin: Uint8Array, width: number, height: number) =>
  post({ width, height, format: 'gray8', data: Buffer.from(bin).toString('base64') });

/** Fallback: send the original gallery image and let the server pre-process it. */
export const recognizeEncodedImage = (base64: string, mime: string) => post({ format: 'encoded', mime, data: base64 });
