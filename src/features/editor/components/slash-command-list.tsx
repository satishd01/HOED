import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";

export interface CommandItem {
  title: string;
  description: string;
  icon: string | React.ReactNode;
  command: (props: { editor: any; range: any }) => void;
}

interface CommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

export const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  if (!props.items.length) {
    return null;
  }

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl overflow-hidden flex flex-col w-64 animate-scale-in">
      <div className="px-3 py-2 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
        Basic Blocks
      </div>
      <div className="max-h-72 overflow-y-auto custom-scrollbar p-1.5">
        {props.items.map((item, index) => (
          <button
            key={index}
            className={`w-full text-left px-2 py-2 rounded-lg flex items-center gap-3 transition-colors ${
              index === selectedIndex
                ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-500)]"
                : "text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
            }`}
            onClick={() => selectItem(index)}
          >
            <div className={`w-8 h-8 rounded border flex items-center justify-center shrink-0 ${
              index === selectedIndex
                ? "bg-[var(--bg-primary)] border-[var(--color-primary-500)]/30 text-[var(--color-primary-500)]"
                : "bg-[var(--bg-primary)] border-[var(--border-color)] text-[var(--text-secondary)]"
            }`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm font-medium truncate ${index === selectedIndex ? "text-[var(--color-primary-500)]" : ""}`}>
                {item.title}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CommandList.displayName = "CommandList";
