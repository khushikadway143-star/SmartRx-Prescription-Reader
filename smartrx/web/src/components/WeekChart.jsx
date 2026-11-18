import React from 'react';
import { DAYS } from '../utils/format';

export default function WeekChart({ week }) {
  return (
    <section className="rx-panel" aria-labelledby="week-h">
      <h2 id="week-h">Last 7 days</h2>
      <div className="rx-bars" role="img" aria-label={`Adherence by day: ${week.map((v, i) => `${DAYS[i]} ${v} percent`).join(', ')}`}>
        {week.map((v, i) => (
          <div key={i} className="rx-bar">
            <div className="rx-fill" style={{ height: `${v}%` }} data-low={v < 80} />
            <span>{DAYS[i]}</span>
            <span className="rx-pct">{v}%</span>
          </div>
        ))}
      </div>
    </section>
  );
}
