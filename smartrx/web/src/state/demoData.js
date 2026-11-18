/** Simulated patient data used when no wsUrl is given. */
const today = (h, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const DEMO = {
  doses: [
    { id: 'd1', drug: 'Metformin 500 mg', time: today(8), status: 'taken' },
    { id: 'd2', drug: 'Amlodipine 5 mg', time: today(9), status: 'taken' },
    { id: 'd3', drug: 'Metformin 500 mg', time: today(14), status: 'missed' },
    { id: 'd4', drug: 'Atorvastatin 10 mg', time: today(21), status: 'pending' },
  ],
  week: [100, 100, 75, 100, 50, 100, 75],
  devices: [
    { id: 'pillbox', name: 'Smart pillbox', batteryPct: 82, at: new Date().toISOString() },
    { id: 'watch', name: 'Smartwatch', batteryPct: 18, at: new Date().toISOString() },
  ],
};
