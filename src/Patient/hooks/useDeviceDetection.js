/**
 * Custom React hook for device detection and responsive behavior
 */

import { useState, useEffect } from 'react';
import { isMobileDevice, debounce } from '../utils';

/**
 * Hook to detect and track device type
 * @param {number} breakpoint - Mobile breakpoint in pixels (default: 768)
 * @returns {Object} Device detection state
 */
export const useDeviceDetection = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(isMobileDevice(breakpoint));
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth <= breakpoint);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }, 250);

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return {
    isMobile,
    isDesktop: !isMobile,
    windowWidth: windowSize.width,
    windowHeight: windowSize.height
  };
};

