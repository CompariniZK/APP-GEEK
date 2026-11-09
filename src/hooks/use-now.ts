import { useEffect, useState } from 'react';

/** Current timestamp, refreshed every `intervalMs` so "il y a X min" labels stay correct. */
export function useNow(intervalMs = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
