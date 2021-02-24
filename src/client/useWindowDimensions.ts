import { useState, useEffect } from 'react';

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

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState<{
    // height: number;
    width: number;
  }>(getWindowDimensions());

  useEffect(() => {
    function handleResize() {
      const { width } = getWindowDimensions();
      if (width !== windowDimensions.width) setWindowDimensions({ width });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return windowDimensions;
}
