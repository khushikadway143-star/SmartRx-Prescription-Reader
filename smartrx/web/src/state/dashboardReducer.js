/** All dashboard state changes live here. Events from the phone map 1:1 to cases. */
export const initialState = { doses: [], week: [], devices: [], alerts: [], lastSeen: null, connection: 'connecting' };

export function reducer(s, e) {
  switch (e.type) {
    case 'connection':
      return { ...s, connection: e.value };
    case 'snapshot':
      return { ...s, doses: e.doses ?? [], week: e.week ?? [], devices: e.devices ?? [], lastSeen: new Date().toISOString() };
    case 'dose_taken':
    case 'dose_missed': {
      const status = e.type === 'dose_taken' ? 'taken' : 'missed';
      const dose = s.doses.find((d) => d.id === e.doseId);
      return {
        ...s,
        lastSeen: e.at,
        doses: s.doses.map((d) => (d.id === e.doseId ? { ...d, status } : d)),
        alerts: status === 'missed' ? [{ id: `${e.doseId}-m`, kind: 'missed', at: e.at, text: `Missed dose: ${dose?.drug ?? 'unknown medicine'}` }, ...s.alerts] : s.alerts,
      };
    }
    case 'sos':
      return { ...s, lastSeen: e.at, alerts: [{ id: `sos-${e.at}`, kind: 'sos', at: e.at, text: 'SOS pressed', lat: e.lat, lng: e.lng }, ...s.alerts] };
    case 'device_status':
      return { ...s, devices: s.devices.map((d) => (d.id === e.deviceId ? { ...d, batteryPct: e.batteryPct, at: e.at } : d)) };
    case 'heartbeat':
      return { ...s, lastSeen: e.at };
    case 'dismiss':
      return { ...s, alerts: s.alerts.filter((a) => a.id !== e.id) };
    default:
      return s;
  }
}
