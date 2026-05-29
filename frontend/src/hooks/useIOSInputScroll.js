import { useEffect } from 'react';

export const useIOSInputScroll = () => {
  useEffect(() => {
    // Only apply on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (!isIOS) return;

    const handleFocus = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Delay scroll slightly to allow iOS keyboard to fully open
        setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Centers the input above the keyboard
          });
        }, 300); // 300ms is usually the sweet spot for the iOS keyboard animation
      }
    };

    // Use capture phase to catch all focus events reliably
    document.addEventListener('focus', handleFocus, true);
    return () => document.removeEventListener('focus', handleFocus, true);
  }, []);
};
