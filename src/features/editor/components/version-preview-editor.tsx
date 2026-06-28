"use client";

import { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { PageBreak } from "../extensions/page-break";
import { Comment } from "../extensions/comment";
import * as Y from "yjs";

interface VersionPreviewEditorProps {
  yjsSnapshotBase64: string;
}

export default function VersionPreviewEditor({ yjsSnapshotBase64 }: VersionPreviewEditorProps) {
  // Create an offline, local Yjs document and apply the snapshot
  const ydoc = useMemo(() => {
    const doc = new Y.Doc();
    try {
      if (yjsSnapshotBase64) {
        // Convert base64 to Uint8Array in the browser
        const binaryString = atob(yjsSnapshotBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        Y.applyUpdate(doc, bytes);
      }
    } catch (e) {
      console.error("Failed to decode Yjs snapshot:", e);
    }
    return doc;
  }, [yjsSnapshotBase64]);

  const editor = useEditor(
    {
      editable: false,
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          // @ts-expect-error - history is a valid option but missing from StarterKitOptions type
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        Placeholder.configure({
          placeholder: "",
        }),
        Highlight.configure({
          multicolor: true,
        }),
        TaskList,
        TaskItem.configure({
          nested: true,
        }),
        Underline,
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
        Link.configure({
          openOnClick: false,
        }),
        PageBreak,
        Comment,
      ],
    },
    [ydoc]
  );

  return (
    <div className="flex-1 overflow-y-auto w-full custom-scrollbar relative bg-[var(--bg-tertiary)] pt-8 pb-32">
      <EditorContent
        editor={editor}
        className="paper-canvas prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none pointer-events-none opacity-90"
      />
    </div>
  );
}
