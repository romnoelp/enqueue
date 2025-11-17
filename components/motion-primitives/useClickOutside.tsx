import { RefObject, useEffect } from "react";

function isEventInsideNode(event: Event, node: Node | null) {
  if (!node) return false;
  // Prefer composedPath when available (works with Shadow DOM & portals)
  const path = (event as any).composedPath?.() as EventTarget[] | undefined;
  if (path && path.length > 0) {
    return (
      path.includes(node as unknown as EventTarget) ||
      path.some((n) => n === node)
    );
  }

  // Fallback: walk up from event.target
  let target = event.target as Node | null;
  while (target) {
    if (target === node) return true;
    // @ts-ignore
    target = target.parentNode || null;
  }
  return false;
}

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If click is inside our element, ignore
      if (!ref || !ref.current) return;

      // Use composedPath to check whether any node in the path is the container
      const path = (event as any).composedPath?.() as EventTarget[] | undefined;
      if (path) {
        if (path.includes(ref.current)) return;

        // Also ignore clicks inside Radix portals used by Select (they render outside the dialog).
        // Our Select adds `data-slot="select-content"` to the content element, so treat those as inside.
        for (const node of path) {
          try {
            if (
              node &&
              // @ts-ignore
              node.getAttribute &&
              // @ts-ignore
              String(node.getAttribute("data-slot")).startsWith("select")
            ) {
              return;
            }
          } catch (e) {
            // ignore non-elements
          }
        }
      } else {
        // Fallback to `contains`
        if (ref.current.contains(event.target as Node)) return;
      }

      handler(event);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [ref, handler]);
}

export default useClickOutside;
