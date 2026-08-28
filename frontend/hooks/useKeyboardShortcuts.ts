import { useEffect, useCallback } from "react";

interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Global keyboard shortcut handler.
 * Usage:
 *   useKeyboardShortcuts({
 *     "ctrl+k": () => searchInputRef.current?.focus(),
 *     "escape": () => closeDialog(),
 *   });
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const handler = useCallback(
    (e: KeyboardEvent) => {
      if (!e.key) return; // Guard against synthetic/malformed events where e.key is undefined
      
      const parts: string[] = [];
      if (e.ctrlKey || e.metaKey) parts.push("ctrl");
      if (e.shiftKey) parts.push("shift");
      if (e.altKey) parts.push("alt");
      parts.push(e.key.toLowerCase());

      const combo = parts.join("+");

      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handler]);
}
