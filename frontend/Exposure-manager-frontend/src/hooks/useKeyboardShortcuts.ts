import { useEffect } from "react";

export function useKeyboardShortcuts(
  onSave: () => void,
  onRefresh: () => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.ctrlKey && key === "s") {
        event.preventDefault();
        onSave();
      }

      if (event.ctrlKey && key === "r") {
        event.preventDefault();
        onRefresh();
      }
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onSave, onRefresh]);
}
