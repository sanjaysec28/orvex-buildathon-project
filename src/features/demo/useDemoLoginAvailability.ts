import { useEffect, useState } from 'react';
import { fetchAuthSession } from '../../services/transporter/transporterDashboardService';

export function useDemoLoginAvailability(): boolean {
  const isProdBundle = import.meta.env.PROD === true;
  const [serverEnabled, setServerEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (isProdBundle) {
      setServerEnabled(false);
      return;
    }
    let active = true;
    void fetchAuthSession().then((res) => {
      if (!active) return;
      setServerEnabled(Boolean(res.demoModeEnabled));
    });
    return () => {
      active = false;
    };
  }, [isProdBundle]);

  return !isProdBundle && serverEnabled;
}
