import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline state.
 * Uses navigator.onLine for initial state and listens to window events for changes.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Sync actual status on mount to avoid hydration mismatch
    if (typeof navigator !== "undefined") {
      setIsOnline(navigator.onLine);
    }
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Reset wasOffline after a short delay so the "back online" message shows briefly
      setTimeout(() => setWasOffline(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
