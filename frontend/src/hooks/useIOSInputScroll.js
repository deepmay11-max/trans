import { useEffect, useRef } from 'react';

export const useIOSInputScroll = () => {
  const timerRef = useRef(null);

  useEffect(() => {
    // Apply on mobile and tablet devices where virtual keyboard appears
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isInputElement = (el) => {
      if (!el) return false;
      return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
    };

    const handleFocus = (e) => {
      const target = e.target;
      if (isInputElement(target)) {
        clearTimeout(timerRef.current);
        
        // Add keyboard-open class to body to expand page scrolling height
        document.body.classList.add('keyboard-open');
        
        // Only scroll INPUT and TEXTAREA to prevent competing select dropdown animations
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          timerRef.current = setTimeout(() => {
            if (document.activeElement === target) {
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest', // Use 'nearest' to avoid unnecessary layout jumping if already in view
              });
            }
          }, 300);
        }
      }
    };

    const handleBlur = (e) => {
      const target = e.target;
      if (isInputElement(target)) {
        clearTimeout(timerRef.current);
        // Short timeout to verify if focus shifted to another input/select or is truly closed
        timerRef.current = setTimeout(() => {
          const activeEl = document.activeElement;
          if (activeEl && isInputElement(activeEl)) {
            // Another input/select got focused, do not remove keyboard-open
            return;
          }
          document.body.classList.remove('keyboard-open');
        }, 200);
      }
    };

    // Use capture phase to catch all focus events reliably
    document.addEventListener('focus', handleFocus, true);
    document.addEventListener('blur', handleBlur, true);
    return () => {
      document.removeEventListener('focus', handleFocus, true);
      document.removeEventListener('blur', handleBlur, true);
      document.body.classList.remove('keyboard-open');
      clearTimeout(timerRef.current);
    };
  }, []);
};
