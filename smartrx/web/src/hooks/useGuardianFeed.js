import { useEffect, useReducer } from 'react';
import { DEMO } from '../state/demoData';
import { initialState, reducer } from '../state/dashboardReducer';
import { connectGuardianSocket } from '../services/guardianSocket';

/** Live feed from the patient app, or simulated data when no wsUrl is provided. */
export function useGuardianFeed({ wsUrl, getToken }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (!wsUrl) {
      dispatch({ type: 'connection', value: 'demo' });
      dispatch({ type: 'snapshot', ...DEMO });
      const t = setTimeout(() => dispatch({ type: 'dose_missed', doseId: 'd3', at: new Date().toISOString() }), 2500);
      return () => clearTimeout(t);
    }
    return connectGuardianSocket({
      wsUrl,
      getToken,
      onEvent: dispatch,
      onStatus: (value) => dispatch({ type: 'connection', value }),
    });
  }, [wsUrl, getToken]);

  return [state, dispatch];
}
