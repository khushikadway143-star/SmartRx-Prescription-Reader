/** Live camera: on request, grabs one frame, resizes it, grayscales + Otsu-thresholds it inside the worklet. */
import { useCallback } from 'react';
import { useCameraDevice, useCameraPermission, useFrameProcessor } from 'react-native-vision-camera';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { LIMITS } from '../config/env';
import { grayscaleOtsu } from '../ocr/preprocess';

export function useCameraCapture(onBinary: (bin: Uint8Array, width: number, height: number) => void) {
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const { resize } = useResizePlugin();
  const wantFrame = useSharedValue(false);
  const onFrameJS = Worklets.createRunOnJS(onBinary);
  const W = LIMITS.FRAME_W;
  const H = LIMITS.FRAME_H;

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      if (!wantFrame.value) return;
      wantFrame.value = false;
      // If text appears sideways on your device, set the plugin's `rotation` option.
      const rgb = resize(frame, { scale: { width: W, height: H }, pixelFormat: 'rgb', dataType: 'uint8' });
      onFrameJS(grayscaleOtsu(rgb, W * H, 3), W, H);
    },
    [resize, onFrameJS],
  );

  const capture = useCallback(() => {
    wantFrame.value = true;
  }, [wantFrame]);

  return { hasPermission, requestPermission, device, frameProcessor, capture };
}
