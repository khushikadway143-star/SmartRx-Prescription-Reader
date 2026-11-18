import React from 'react';
import { createRoot } from 'react-dom/client';
import WebDashboard from './WebDashboard';

const env = import.meta.env;

createRoot(document.getElementById('root')).render(
  <WebDashboard
    wsUrl={env.VITE_WS_URL || undefined}
    getToken={() => env.VITE_TOKEN}
    patientName="Asha"
    patientPhone={env.VITE_PATIENT_PHONE || undefined}
  />,
);
