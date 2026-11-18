import React from 'react';

const LABEL = { live: 'Live', demo: 'Demo data', connecting: 'Connecting…', reconnecting: 'Connection lost. Reconnecting…' };

export default function DashboardHeader({ patientName, connection, minutesSince, onCall, canCall }) {
  const canAsk = typeof Notification !== 'undefined' && Notification.permission === 'default';
  return (
    <header className="rx-head">
      <div>
        <h1>{patientName}</h1>
        <p className="rx-sub" aria-live="polite">
          {LABEL[connection]}
          {minutesSince !== null && ` · last heard from phone ${minutesSince < 1 ? 'just now' : `${minutesSince} min ago`}`}
        </p>
      </div>
      <div className="rx-actions">
        {canAsk && (
          <button className="rx-btn ghost" onClick={() => Notification.requestPermission()}>
            Enable desktop alerts
          </button>
        )}
        <button className="rx-btn" onClick={onCall} disabled={!canCall}>
          Call {patientName}
        </button>
      </div>
    </header>
  );
}
