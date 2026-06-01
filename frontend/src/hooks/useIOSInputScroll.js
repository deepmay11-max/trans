import { useEffect, useRef } from 'react';

export const useIOSInputScroll = () => {
  const keyboardOpenRef = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Only apply on iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (!isIOS) return;

    const handleFocus = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          target.scrollIntoView({
            behavior: 'instant', // instant avoids smooth-scroll animation conflicts
            block: 'center',
          });
        }, 350);
      }
    };

    const handleBlur = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Mark keyboard as open briefly — if another input gets focus within
        // 200ms, we know user is switching inputs (not closing keyboard)
        keyboardOpenRef.current = true;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          keyboardOpenRef.current = false;
        }, 200);
      }
    };

    // Use capture phase to catch all focus events reliably
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);
    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      clearTimeout(timerRef.current);
    };
  }, []);
};
