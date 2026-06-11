import { useState, useCallback } from 'react';

export function useLockAxes() {
  const [lockedAxes, setLockedAxes] = useState<ReadonlySet<string>>(new Set());

  const toggleLock = useCallback((axis: string) => {
    setLockedAxes(prev => {
      const next = new Set(prev);
      if (next.has(axis)) {
        next.delete(axis);
      } else {
        next.add(axis);
      }
      return next;
    });
  }, []);

  return { lockedAxes, toggleLock, lockedCount: lockedAxes.size };
}
