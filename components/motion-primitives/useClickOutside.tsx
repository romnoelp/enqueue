import { RefObject, useEffect } from "react";

type ComposedPathable = { composedPath?: () => EventTarget[] };

function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
): void {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // If click is inside our element, ignore
      if (!ref || !ref.current) return;

      // Use composedPath to check whether any node in the path is the container
      const path = (event as unknown as ComposedPathable).composedPath?.();
      if (path) {
        if (path.includes(ref.current)) return;

        // Also ignore clicks inside Radix portals used by Select or nested dialogs (they render outside the dialog).
        // Our Select adds `data-slot="select-content"` and Dialog content comes from portals too.
        // Treat elements with `data-slot` starting with `select` or `dialog` as inside.
        for (const node of path) {
          try {
            // Only Element nodes have attributes
            if (!node || !(node instanceof Element)) continue;

            // If the element has a `data-slot` marker for select/dialog-like portals,
            // consider the click inside. Some portals use prefixes like `dialog`,
            // `alert-dialog` or `select`.
            const slot = String(node.getAttribute("data-slot") || "");
            if (slot.startsWith("select") || slot.includes("dialog")) {
              return;
            }

            // Also treat explicit dialog elements (role/aria-modal) as inside clicks
            // to handle third-party/alternate portal implementations.
            const role = String(node.getAttribute("role") || "");
            const ariaModal = String(node.getAttribute("aria-modal") || "");
            if (role === "dialog" || ariaModal === "true") {
              return;
            }
          } catch {
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
