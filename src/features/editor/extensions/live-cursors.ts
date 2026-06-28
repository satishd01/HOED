import { Extension } from "@tiptap/core";
import { yCursorPlugin } from "@tiptap/y-tiptap";
import type { Awareness } from "y-protocols/awareness";

export interface LiveCursorsOptions {
  awareness: Awareness | null;
}

export const LiveCursors = Extension.create<LiveCursorsOptions>({
  name: "liveCursors",

  addOptions() {
    return {
      awareness: null,
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.awareness) {
      return [];
    }

    return [
      yCursorPlugin(this.options.awareness, {
        cursorBuilder: (user) => {
          const cursor = document.createElement("span");
          cursor.classList.add("collaboration-cursor__caret");
          
          // Use user color for caret border
          if (user?.color) {
            cursor.setAttribute("style", `border-color: ${user.color}`);
          }

          const label = document.createElement("div");
          label.classList.add("collaboration-cursor__label");
          
          // Use user color for label background
          if (user?.color) {
            label.setAttribute("style", `background-color: ${user.color}`);
          }
          
          label.insertBefore(document.createTextNode(user.name || "Anonymous"), null);
          cursor.insertBefore(label, null);
          
          return cursor;
        },
      }),
    ];
  },
});
