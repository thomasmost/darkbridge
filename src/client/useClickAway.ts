import { useEffect } from 'react';

const EVENT = 'mousedown';

export function useClickAway<T extends HTMLElement>(
  ref: React.RefObject<T>,
  callback: (e: MouseEvent) => void,
) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (!ref || !ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      callback(event);
    };
    document.addEventListener(EVENT, listener);
    return () => {
      document.removeEventListener(EVENT, listener);
    };
  }, [ref, callback]);
}
