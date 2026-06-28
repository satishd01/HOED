"use client";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "connecting";
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const labels = {
    connected: "Online",
    disconnected: "Offline",
    connecting: "Connecting...",
  };

  const dotClass = {
    connected: "online",
    disconnected: "offline",
    connecting: "syncing",
  };

  return (
    <div className="flex items-center gap-2" id="connection-status">
      <span className={`status-dot ${dotClass[status]}`} aria-hidden="true" />
      <span className="text-xs font-medium text-[var(--text-secondary)]">
        {labels[status]}
      </span>
    </div>
  );
}
