import React from 'react';
import { STATUS, fmtTime } from '../utils/format';

export default function TodayTimeline({ doses }) {
  return (
    <section className="rx-panel" aria-labelledby="sched-h">
      <h2 id="sched-h">Today</h2>
      <ol className="rx-line">
        {[...doses]
          .sort((a, b) => new Date(a.time) - new Date(b.time))
          .map((d) => (
            <li key={d.id} className={d.status}>
              <span className="rx-time">{fmtTime(d.time)}</span>
              <span className="rx-drug">{d.drug}</span>
              <span className={`rx-chip ${d.status}`}>{STATUS[d.status]}</span>
            </li>
          ))}
        {!doses.length && <li className="rx-sub">No doses scheduled yet.</li>}
      </ol>
    </section>
  );
}
