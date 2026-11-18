import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera } from 'react-native-vision-camera';
import { alertUser, speak } from '../accessibility';
import BigButton from '../components/BigButton';
import ScanResults from '../components/ScanResults';
import { useDoses } from '../context/DosesContext';
import { useCameraCapture } from '../hooks/useCameraCapture';
import { useOcrPipeline } from '../hooks/useOcrPipeline';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { RootStackParamList } from '../navigation/types';
import { pickPrescriptionImage } from '../services/imagePicker.service';
import { createCommonStyles } from '../styles/common.styles';
import { createScannerStyles } from '../styles/scanner.styles';

/**
 * SAFETY: handwriting OCR is error-prone. Nothing is scheduled until the person
 * (or a guardian) taps "Add to schedule" on a specific result.
 */
export default function ScanScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Scan'>) {
  const c = useThemedStyles(createCommonStyles);
  const s = useThemedStyles(createScannerStyles);
  const { addFromScan } = useDoses();
  const ocr = useOcrPipeline();

  const onBinary = useCallback((bin: Uint8Array, width: number, height: number) => void ocr.run({ kind: 'binary', bin, width, height }), [ocr.run]);
  const cam = useCameraCapture(onBinary);

  useEffect(() => {
    if (!cam.hasPermission) void cam.requestPermission();
    void speak('Scanner ready. Press Scan to use the camera, or Choose from gallery to pick a saved photo.');
  }, [cam.hasPermission]);

  const fromGallery = async () => {
    try {
      const img = await pickPrescriptionImage();
      if (img) await ocr.run({ kind: 'gallery', base64: img.base64, mime: img.mime });
    } catch {
      await alertUser('critical', 'I could not open your photos. Check the photo permission in settings.');
    }
  };

  const controls = (
    <>
      <BigButton label="Scan with camera" hint="Takes a picture of the paper in front of the camera" disabled={ocr.busy || !cam.device} onPress={() => { void alertUser('success', 'Capturing.'); cam.capture(); }} />
      <BigButton label="Choose from gallery" hint="Pick a saved prescription photo from your gallery or camera roll" disabled={ocr.busy} onPress={() => void fromGallery()} />
      <Pressable style={s.ghost} onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Close scanner">
        <Text style={s.ghostText}>Close</Text>
      </Pressable>
    </>
  );

  if (!cam.hasPermission || !cam.device) {
    // The gallery still works without camera access.
    return (
      <View style={c.center}>
        <Text style={c.h1} accessibilityRole="alert">Camera not available. You can still choose a photo from your gallery.</Text>
        {controls}
      </View>
    );
  }

  return (
    <View style={s.root}>
      <Camera style={StyleSheet.absoluteFill} device={cam.device} isActive frameProcessor={cam.frameProcessor} pixelFormat="yuv" />
      <View style={s.panel}>
        {ocr.busy ? (
          <View accessible accessibilityLiveRegion="polite" accessibilityLabel="Reading prescription">
            <ActivityIndicator size="large" color="#fff" />
            <Text style={s.status}>Reading prescription…</Text>
          </View>
        ) : ocr.phase === 'results' && ocr.results.length ? (
          <ScanResults items={ocr.results} onAdd={(m) => void addFromScan(m)} />
        ) : null}
        {ocr.phase === 'error' && <Text style={s.warn}>Scan failed. Try again.</Text>}
        {controls}
      </View>
    </View>
  );
}
