/** Tiny pub/sub so services can announce events without importing React code. */
type Handler = (payload: any) => void;
const subs: Record<string, Set<Handler>> = {};

export type BusEvent = 'dose_missed' | 'sos';

export const bus = {
  on(evt: BusEvent, fn: Handler) {
    (subs[evt] ??= new Set()).add(fn);
    return () => void subs[evt].delete(fn);
  },
  emit(evt: BusEvent, payload?: unknown) {
    subs[evt]?.forEach((fn) => fn(payload));
  },
};
