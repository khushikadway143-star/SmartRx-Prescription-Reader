import { useEffect, useRef } from 'react';

/** Beep, vibrate and (if allowed) show a desktop notification whenever a new alert arrives. */
export function useAlertCues(alerts) {
  const prev = useRef(0);
  useEffect(() => {
    if (alerts.length > prev.current) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        o.frequency.value = 880;
        o.connect(ctx.destination);
        o.start();
        o.stop(ctx.currentTime + 0.25);
      } catch {
        /* autoplay blocked */
      }
      navigator.vibrate?.([100, 50, 100, 50, 100]);
      if ('Notification' in window && Notification.permission === 'granted') new Notification('SmartRx alert', { body: alerts[0].text });
    }
    prev.current = alerts.length;
  }, [alerts]);
}
