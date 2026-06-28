/** Maximum sync payload size in bytes (5MB) — prevents OOM attacks */
export const MAX_SYNC_PAYLOAD_SIZE = 5 * 1024 * 1024;

/** Maximum document title length */
export const MAX_TITLE_LENGTH = 255;

/** Debounce delay for title auto-save (ms) */
export const TITLE_SAVE_DEBOUNCE_MS = 800;

/** WebSocket reconnection interval (ms) */
export const WS_RECONNECT_INTERVAL_MS = 3000;

/** Maximum reconnection attempts */
export const WS_MAX_RECONNECT_ATTEMPTS = 50;

/** Application name */
export const APP_NAME = "SyncForge";

/** Document roles in order of privilege */
export const DOCUMENT_ROLES = ["viewer", "editor", "owner"] as const;

/** Hocuspocus WebSocket server URL */
export const WS_SERVER_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:1234";

/** Colors assigned to collaboration cursors */
export const COLLABORATION_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEAA7",
  "#DDA0DD",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85C1E9",
  "#F8C471",
  "#82E0AA",
] as const;
