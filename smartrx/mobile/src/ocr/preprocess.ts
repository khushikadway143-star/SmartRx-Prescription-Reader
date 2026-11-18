import { Buffer } from 'buffer';
import jpeg from 'jpeg-js';

/**
 * Interleaved pixels (3 = RGB, 4 = RGBA) -> grayscale -> Otsu threshold -> binary (0/255).
 * Marked 'worklet' so the camera frame processor can call it; it is plain JS everywhere else.
 */
export function grayscaleOtsu(pix: Uint8Array, pixelCount: number, channels = 3): Uint8Array {
  'worklet';
  const gray = new Uint8Array(pixelCount);
  const hist = new Uint32Array(256);
  for (let i = 0; i < pixelCount; i++) {
    const o = i * channels;
    const g = (0.299 * pix[o] + 0.587 * pix[o + 1] + 0.114 * pix[o + 2]) | 0;
    gray[i] = g;
    hist[g]++;
  }
  let sumAll = 0;
  for (let t = 0; t < 256; t++) sumAll += t * hist[t];
  let sumB = 0;
  let wB = 0;
  let best = -1;
  let thr = 127;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    const wF = pixelCount - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) {
      best = between;
      thr = t;
    }
  }
  const out = new Uint8Array(pixelCount);
  for (let i = 0; i < pixelCount; i++) out[i] = gray[i] > thr ? 255 : 0;
  return out;
}

/** Decodes a gallery JPEG in JS and runs the same pre-processing as the live camera. Throws for non-JPEG input. */
export function binarizeJpeg(base64: string): { bin: Uint8Array; width: number; height: number } {
  const img = jpeg.decode(Buffer.from(base64, 'base64'), { useTArray: true, formatAsRGBA: true, maxMemoryUsageInMB: 256 });
  return { bin: grayscaleOtsu(img.data, img.width * img.height, 4), width: img.width, height: img.height };
}
