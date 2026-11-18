/**
 * WebSocket client for the guardian role. Reconnects with exponential backoff.
 * Returns a function that closes the connection.
 */
export function connectGuardianSocket({ wsUrl, getToken, onEvent, onStatus }) {
  let ws;
  let stopped = false;
  let timer;
  let retry = 0;

  const open = async () => {
    const token = await getToken?.();
    ws = new WebSocket(`${wsUrl}?role=guardian&token=${encodeURIComponent(token ?? '')}`);
    ws.onopen = () => {
      retry = 0;
      onStatus('live');
    };
    ws.onmessage = (m) => {
      try {
        onEvent(JSON.parse(m.data));
      } catch {
        /* ignore malformed frame */
      }
    };
    ws.onclose = () => {
      onStatus('reconnecting');
      if (!stopped) timer = setTimeout(open, Math.min(30000, 1000 * 2 ** retry++));
    };
    ws.onerror = () => ws.close();
  };
  open();

  return () => {
    stopped = true;
    clearTimeout(timer);
    ws?.close();
  };
}
