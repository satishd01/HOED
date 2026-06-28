import { Mark, mergeAttributes } from "@tiptap/core";

export interface CommentOptions {
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment mark
       */
      setComment: (commentId: string) => ReturnType;
      /**
       * Unset a comment mark
       */
      unsetComment: (commentId: string) => ReturnType;
    };
  }
}

export const Comment = Mark.create<CommentOptions>({
  name: "comment",

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-comment-id"),
        renderHTML: (attributes) => {
          if (!attributes.commentId) {
            return {};
          }
          return {
            "data-comment-id": attributes.commentId,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-comment-id]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "comment-highlight",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (commentId) =>
        ({ commands }) => {
          return commands.setMark(this.name, { commentId });
        },
      unsetComment:
        (commentId) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return false;
          
          const { doc } = tr;
          const markType = this.type;
          
          // Find all text nodes in the document that have this exact commentId
          let hasChanged = false;
          doc.descendants((node, pos) => {
            if (node.isText && node.marks.length > 0) {
              const commentMark = node.marks.find(
                (m) => m.type === markType && m.attrs.commentId === commentId
              );
              if (commentMark) {
                tr.removeMark(pos, pos + node.nodeSize, markType);
                hasChanged = true;
              }
            }
          });

          return hasChanged;
        },
    };
  },
});
