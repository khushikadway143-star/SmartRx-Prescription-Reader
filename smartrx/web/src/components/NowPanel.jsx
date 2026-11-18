import React from 'react';
import { fmtTime } from '../utils/format';

export default function NowPanel({ doses, hasSos }) {
  const taken = doses.filter((d) => d.status === 'taken').length;
  const missed = doses.filter((d) => d.status === 'missed').length;
  const next = doses.filter((d) => d.status === 'pending').sort((a, b) => new Date(a.time) - new Date(b.time))[0];
  const headline = hasSos ? 'Needs help now' : missed ? 'A dose was missed' : next ? 'On track' : 'All done for today';
  return (
    <section className="rx-panel rx-now" aria-labelledby="now-h">
      <h2 id="now-h">{headline}</h2>
      <p className="rx-big">{next ? `Next: ${next.drug} at ${fmtTime(next.time)}` : 'No more doses today'}</p>
      <p className="rx-sub">
        {taken} of {doses.length || 1} taken today{missed ? `, ${missed} missed` : ''}
      </p>
    </section>
  );
}
