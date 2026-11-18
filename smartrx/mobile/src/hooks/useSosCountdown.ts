import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, vibrate } from '../accessibility';

/** 5-second spoken countdown so an accidental press can be cancelled with one large tap. */
export function useSosCountdown(onFire: () => void, seconds = 5) {
  const [count, setCount] = useState<number | null>(null);
  const fire = useRef(onFire);
  fire.current = onFire;

  useEffect(() => {
    if (count === null) return;
    if (count === 0) {
      setCount(null);
      fire.current();
      return;
    }
    void speak(String(count), { critical: true });
    vibrate('critical');
    const t = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const start = useCallback(() => setCount(seconds), [seconds]);
  const cancel = useCallback(() => {
    setCount(null);
    void speak('Emergency cancelled.', { critical: true });
  }, []);
  return { count, start, cancel };
}
