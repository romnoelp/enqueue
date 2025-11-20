import React, { useEffect } from "react";

// Accept refs that may be initially null (useRef<HTMLDivElement | null>)
export function useOutsideClick<T extends HTMLElement = HTMLDivElement>(
  ref: React.RefObject<T | null>,
  callback: (event: Event) => void
) {
  useEffect(() => {
    const listener = (event: Event) => {
      // Ignore non-Node event targets
      const target = event.target;
      if (!(target instanceof Node)) return;

      // DO NOTHING if the element being clicked is the target element or their children
      if (!ref.current || ref.current.contains(target)) {
        return;
      }
      callback(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, callback]);
}
