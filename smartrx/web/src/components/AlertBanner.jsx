import React from 'react';
import { fmtTime } from '../utils/format';

export default function AlertBanner({ alerts, onDismiss }) {
  return (
    <div role="alert" aria-live="assertive" className="rx-alerts">
      {alerts.map((a) => (
        <div key={a.id} className={`rx-alert ${a.kind}`}>
          <div>
            <strong>{a.text}</strong>
            <span> at {fmtTime(a.at)}</span>
            {a.lat != null && (
              <>
                {' '}
                <a href={`https://maps.google.com/?q=${a.lat},${a.lng}`} target="_blank" rel="noreferrer">
                  Open location
                </a>
              </>
            )}
          </div>
          <button className="rx-btn ghost" onClick={() => onDismiss(a.id)}>
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
