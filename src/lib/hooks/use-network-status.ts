import { useState, useEffect, useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function getServerSnapshot() {
  return true;
}

/**
 * Tracks the browser's online/offline state.
 * Uses useSyncExternalStore to fix hydration mismatches and ESLint set-state-in-effect warnings.
 */
export function useNetworkStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [wasOffline, setWasOffline] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
    } else if (isOnline && hasBeenOffline) {
      setWasOffline(true);
      setHasBeenOffline(false);
      const timer = setTimeout(() => setWasOffline(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  return { isOnline, wasOffline };
}
