import { LIMITS } from '../config/env';

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** fetch + timeout + JSON parsing + typed errors. Every API module goes through this. */
export async function http<T>(url: string, init: RequestInit & { timeoutMs?: number } = {}): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), init.timeoutMs ?? LIMITS.HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new HttpError(res.status, `${init.method ?? 'GET'} ${url} -> ${res.status}`);
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } finally {
    clearTimeout(timer);
  }
}
