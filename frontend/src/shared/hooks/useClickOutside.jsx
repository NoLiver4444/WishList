import { useEffect } from 'react';

export const useClickOutside = (refs, handler) => {
  useEffect(() => {
    const refList = Array.isArray(refs) ? refs : [refs];
    const listener = (event) => {
      const isInside = refList.some(
        (ref) => ref.current && ref.current.contains(event.target)
      );

      if (isInside) return;

      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [refs, handler]);
};
