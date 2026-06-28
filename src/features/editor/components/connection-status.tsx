"use client";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "connecting";
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const config = {
    connected: {
      dot: "bg-emerald-500",
      pulse: "bg-emerald-400",
      label: "Synced",
      textColor: "text-emerald-600 dark:text-emerald-400",
      animate: false,
    },
    disconnected: {
      dot: "bg-red-500",
      pulse: "bg-red-400",
      label: "Offline — editing locally",
      textColor: "text-red-600 dark:text-red-400",
      animate: false,
    },
    connecting: {
      dot: "bg-amber-500",
      pulse: "bg-amber-400",
      label: "Syncing...",
      textColor: "text-amber-600 dark:text-amber-400",
      animate: true,
    },
  }[status];

  return (
    <div className="flex items-center gap-2" id="connection-status" aria-live="polite" aria-label={`Connection status: ${config.label}`}>
      {/* Pulsing dot */}
      <span className="relative flex h-2 w-2">
        {config.animate && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulse} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span className={`text-xs font-medium ${config.textColor} transition-colors duration-300`}>
        {config.label}
      </span>
    </div>
  );
}
