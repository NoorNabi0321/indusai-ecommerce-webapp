import { useEffect, useState } from 'react';

export interface Countdown {
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function diff(target: number): Countdown {
  const ms = Math.max(0, target - Date.now());
  return {
    hours: Math.floor(ms / 3_600_000),
    minutes: Math.floor((ms % 3_600_000) / 60_000),
    seconds: Math.floor((ms % 60_000) / 1000),
    done: ms === 0,
  };
}

/** Live countdown to a target timestamp, ticking every second. */
export function useCountdown(target: number): Countdown {
  const [state, setState] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setState(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return state;
}
