import React from 'react';

export default function DevicesPanel({ devices }) {
  return (
    <section className="rx-panel" aria-labelledby="dev-h">
      <h2 id="dev-h">Connected devices</h2>
      <ul className="rx-dev">
        {devices.map((d) => (
          <li key={d.id}>
            <span>{d.name}</span>
            <span className={d.batteryPct < 20 ? 'low' : ''}>
              Battery {d.batteryPct}%{d.batteryPct < 20 ? ' (low)' : ''}
            </span>
          </li>
        ))}
        {!devices.length && <li className="rx-sub">No devices paired.</li>}
      </ul>
    </section>
  );
}
