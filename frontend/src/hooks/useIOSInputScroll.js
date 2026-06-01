import { useEffect, useRef } from 'react';

export const useIOSInputScroll = () => {
  const timerRef = useRef(null);

  useEffect(() => {
    // Apply on mobile and tablet devices where virtual keyboard appears
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (!isMobile) return;

    const handleFocus = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        clearTimeout(timerRef.current);
        
        // Add keyboard-open class to body to expand page scrolling height
        document.body.classList.add('keyboard-open');
        
        // Use a short delay to allow the soft keyboard to finish opening
        // so the viewport measurements are accurate
        timerRef.current = setTimeout(() => {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'center', // Centers the input in the visible viewport (perfectly above keyboard)
          });
        }, 300);
      }
    };

    const handleBlur = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        clearTimeout(timerRef.current);
        // Short timeout to verify if focus shifted to another input or is truly closed
        timerRef.current = setTimeout(() => {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
            // Another input got focused, do not remove keyboard-open
            return;
          }
          document.body.classList.remove('keyboard-open');
        }, 150);
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
