"use client";

interface CollaborationBarProps {
  users: Array<{ name: string; color: string }>;
}

export default function CollaborationBar({ users }: CollaborationBarProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" id="collaboration-bar">
      <span className="text-xs text-[var(--text-tertiary)] mr-1">
        {users.length} online
      </span>
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user, i) => (
          <div
            key={`${user.name}-${i}`}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[var(--bg-secondary)] transition-transform hover:scale-110 hover:z-10"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] font-medium text-[var(--text-secondary)] border-2 border-[var(--bg-secondary)]">
            +{users.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}
