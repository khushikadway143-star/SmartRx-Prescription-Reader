export const fmtTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const STATUS = { taken: 'Taken', missed: 'Missed', pending: 'Upcoming' };
