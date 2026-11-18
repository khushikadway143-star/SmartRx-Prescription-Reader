/** Gallery / camera-roll input (Samsung Gallery and Google Photos both work via the system picker). */
import { launchImageLibrary } from 'react-native-image-picker';
import { LIMITS } from '../config/env';

export interface PickedImage {
  base64: string;
  mime: string;
}

/** Android 13+ uses the system photo picker, so no storage permission is required. */
export async function pickPrescriptionImage(): Promise<PickedImage | null> {
  const r = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
    includeBase64: true,
    maxWidth: LIMITS.GALLERY_MAX_PX,
    maxHeight: LIMITS.GALLERY_MAX_PX,
    quality: 0.9,
  });
  if (r.didCancel) return null;
  if (r.errorCode) throw new Error(r.errorMessage ?? r.errorCode);
  const a = r.assets?.[0];
  return a?.base64 ? { base64: a.base64, mime: a.type ?? 'image/jpeg' } : null;
}
