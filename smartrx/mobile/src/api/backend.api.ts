/**
 * Your own backend. Twilio and SendGrid keys live THERE, never in the app.
 *   POST /v1/alerts/sms        { to, body }
 *   POST /v1/escalations       { doseId, dueAt, deadlineAt, guardianIds }
 *   DELETE /v1/escalations/:id
 *   POST /v1/reports/email     { to, subject, html }
 */
import { ENV } from '../config/env';
import { getAuthToken } from './auth';
import { http } from './http';

async function call<T = void>(path: string, init: RequestInit = {}) {
  const token = await getAuthToken();
  return http<T>(`${ENV.API_BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
}

export const backendApi = {
  sendSms: (to: string[], body: string) => call('/v1/alerts/sms', { method: 'POST', body: JSON.stringify({ to, body }) }),
  createEscalation: (p: { doseId: string; dueAt: string; deadlineAt: string; guardianIds: string[] }) =>
    call('/v1/escalations', { method: 'POST', body: JSON.stringify(p) }),
  cancelEscalation: (doseId: string) => call(`/v1/escalations/${doseId}`, { method: 'DELETE' }),
  sendEmail: (to: string[], subject: string, html: string) =>
    call('/v1/reports/email', { method: 'POST', body: JSON.stringify({ to, subject, html }) }),
};
