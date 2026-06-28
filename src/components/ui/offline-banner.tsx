"use client";

import { useNetworkStatus } from "@/lib/hooks/use-network-status";

/**
 * Animated banner that appears when the user goes offline.
 * Yjs + IndexedDB ensure all edits are preserved locally.
 * The banner disappears once reconnected.
 */
export default function OfflineBanner() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isOnline ? "translate-y-0" : "translate-y-0"
      }`}
    >
      {!isOnline ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 text-white text-sm font-medium shadow-lg">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
          </svg>
          <span>
            📡 You&apos;re offline — all edits are being saved locally and will sync when you reconnect
          </span>
        </div>
      ) : wasOffline ? (
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white text-sm font-medium shadow-lg animate-fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>✅ Back online — syncing your offline edits now</span>
        </div>
      ) : null}
    </div>
  );
}
