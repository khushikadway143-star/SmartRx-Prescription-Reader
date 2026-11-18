/** WebSocket link from the patient app to the guardian dashboard. */
export type LinkEvent =
  | { type: 'dose_taken'; doseId: string; at: string }
  | { type: 'dose_missed'; doseId: string; at: string }
  | { type: 'sos'; at: string; lat?: number; lng?: number }
  | { type: 'device_status'; deviceId: string; batteryPct: number; at: string }
  | { type: 'heartbeat'; at: string };

/** Reconnects with exponential backoff and queues events while offline. */
export class GuardianLink {
  private ws?: WebSocket;
  private retry = 0;
  private closed = false;
  private hb?: ReturnType<typeof setInterval>;
  private queue: LinkEvent[] = [];

  constructor(private wsUrl: string, private getToken: () => Promise<string>) {}

  async connect() {
    this.closed = false;
    const token = await this.getToken();
    this.ws = new WebSocket(`${this.wsUrl}?role=patient&token=${encodeURIComponent(token)}`);
    this.ws.onopen = () => {
      this.retry = 0;
      this.queue.splice(0).forEach((e) => this.ws?.send(JSON.stringify(e)));
      this.hb = setInterval(() => this.send({ type: 'heartbeat', at: new Date().toISOString() }), 30_000);
    };
    this.ws.onclose = () => {
      clearInterval(this.hb);
      if (!this.closed) setTimeout(() => void this.connect(), Math.min(30_000, 1000 * 2 ** this.retry++));
    };
    this.ws.onerror = () => this.ws?.close();
  }

  send(e: LinkEvent) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(e));
    else if (e.type !== 'heartbeat') this.queue.push(e);
  }

  close() {
    this.closed = true;
    clearInterval(this.hb);
    this.ws?.close();
  }
}
