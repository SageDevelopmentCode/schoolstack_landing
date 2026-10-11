import { useEffect, useState } from 'react';

import { userCanSwitchSchool } from '@/lib/auth/list-accessible-organizations';

export function useCanSwitchSchool(userId: string | undefined): boolean {
  const [canSwitch, setCanSwitch] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCanSwitch(false);
      return;
    }

    let cancelled = false;

    void userCanSwitchSchool(userId).then((result) => {
      if (!cancelled) {
        setCanSwitch(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return canSwitch;
}
