import { useEffect, useRef } from 'react';

export const useInterval = (
  callback: () => void,
  delay: number | null | false,
  immediate?: boolean,
) => {
  const savedCallback = useRef<() => void>(() => null);

  // Store the callback
  useEffect(() => {
    savedCallback.current = callback;
  });

  // Run callback if immediate
  useEffect(() => {
    if (!immediate) return;
    if (delay === null || delay === false) return;
    savedCallback.current();
  }, [immediate]);

  // Start the interval
  useEffect(() => {
    if (delay === null || delay === false) return undefined;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay]);
};
