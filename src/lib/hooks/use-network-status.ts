import { useSyncExternalStore } from "react";

type NetworkState = {
  isOnline: boolean;
  wasOffline: boolean;
};

// Initial state matches the server to avoid hydration mismatch
const initialState: NetworkState = {
  isOnline: true,
  wasOffline: false,
};

let currentState = initialState;
let isInitialized = false;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

function emitChange() {
  listeners.forEach((listener) => listener());
}

function handleOnline() {
  currentState = { isOnline: true, wasOffline: true };
  emitChange();
  
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    currentState = { ...currentState, wasOffline: false };
    emitChange();
  }, 4000);
}

function handleOffline() {
  currentState = { isOnline: false, wasOffline: false };
  emitChange();
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  if (!isInitialized) {
    currentState = { ...currentState, isOnline: navigator.onLine };
    isInitialized = true;
  }

  if (listeners.size === 0) {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  listeners.add(callback);

  return () => {
    listeners.delete(callback);
    if (listeners.size === 0) {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
  };
}

function getSnapshot() {
  return currentState;
}

function getServerSnapshot() {
  return initialState;
}

/**
 * Tracks the browser's online/offline state.
 * Uses useSyncExternalStore to fix hydration mismatches and ESLint set-state-in-effect warnings.
 */
export function useNetworkStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
