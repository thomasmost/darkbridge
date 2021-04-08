import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

function getWindowDimensions() {
  if (typeof window === 'undefined') {
    return {
      width: 1000,
      // height: 800,
    };
  }
  const { innerWidth: width /* innerHeight: height */ } = window;
  return {
    width,
    // height,
  };
}

function shouldRenderAsPWA() {
  const { width } = getWindowDimensions();
  return width < 600;
}

export function usePWA() {
  const [isPWAWidth, setIsPWA] = useState<boolean>(shouldRenderAsPWA());
  function handleResize() {
    const newVal = shouldRenderAsPWA();
    if (newVal !== isPWAWidth) {
      setIsPWA(newVal);
    }
  }
  // Important to debounce this so we don't constantly re-evaluate the window dimensions on scroll
  const debouncedHandler = useDebouncedCallback(handleResize, 200);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedHandler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', debouncedHandler);
      }
    };
  }, []);

  return { isPWAWidth };
}
