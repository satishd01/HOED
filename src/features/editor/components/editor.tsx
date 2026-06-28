"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { WS_SERVER_URL } from "@/lib/utils/constants";
import EditorToolbar from "./toolbar";
import ConnectionStatus from "./connection-status";
import CollaborationBar from "./collaboration-bar";
import AiAssistant from "./ai-assistant";

interface CollaborativeEditorProps {
  documentId: string;
  userName: string;
  userColor: string;
  isReadOnly: boolean;
}

export default function CollaborativeEditor({
  documentId,
  userName,
  userColor,
  isReadOnly,
}: CollaborativeEditorProps) {
  const [isLocalSynced, setIsLocalSynced] = useState(false);
  const [isRemoteSynced, setIsRemoteSynced] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const [connectedUsers, setConnectedUsers] = useState<
    Array<{ name: string; color: string }>
  >([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Create Yjs document — stable across renders
  const ydoc = useMemo(() => new Y.Doc(), []);

  // IndexedDB persistence — loads document from local storage instantly
  const localProvider = useMemo(() => {
    const provider = new IndexeddbPersistence(`syncscribe-${documentId}`, ydoc);
    provider.on("synced", () => {
      setIsLocalSynced(true);
    });
    return provider;
  }, [documentId, ydoc]);

  // WebSocket provider — syncs with Hocuspocus server
  const remoteProvider = useMemo(() => {
    const provider = new HocuspocusProvider({
      url: WS_SERVER_URL,
      name: documentId,
      document: ydoc,
      token: "auth-token-placeholder", // Will be replaced with real JWT
      onConnect: () => {
        setConnectionStatus("connected");
        setIsRemoteSynced(true);
      },
      onDisconnect: () => {
        setConnectionStatus("disconnected");
      },
      onStatus: ({ status }) => {
        setConnectionStatus(
          status === "connected"
            ? "connected"
            : status === "connecting"
            ? "connecting"
            : "disconnected"
        );
      },
      onAwarenessUpdate: ({ states }) => {
        const users: Array<{ name: string; color: string }> = [];
        states.forEach((state: Record<string, unknown>) => {
          if (state.user && typeof state.user === "object") {
            const user = state.user as { name: string; color: string };
            users.push({ name: user.name, color: user.color });
          }
        });
        setConnectedUsers(users);
      },
    });

    return provider;
  }, [documentId, ydoc]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      remoteProvider.destroy();
      localProvider.destroy();
      ydoc.destroy();
    };
  }, [remoteProvider, localProvider, ydoc]);

  // Initialize Tiptap editor with all extensions
  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: !isReadOnly,
      extensions: [
        StarterKit.configure({
          history: false, // Yjs handles undo/redo via collaboration
        }),
        Collaboration.configure({
          document: ydoc,
        }),
        CollaborationCursor.configure({
          provider: remoteProvider,
          user: {
            name: userName,
            color: userColor,
          },
        }),
        Placeholder.configure({
          placeholder: "Start writing... or press '/' for commands",
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
          autolink: true,
        }),
      ],
    },
    [ydoc, remoteProvider]
  );

  // Get document content as text for AI
  const getDocumentText = useCallback(() => {
    if (!editor) return "";
    return editor.getText();
  }, [editor]);

  // Get document content as HTML for AI
  const getDocumentHtml = useCallback(() => {
    if (!editor) return "";
    return editor.getHTML();
  }, [editor]);

  // Insert AI-generated text at cursor
  const insertAiText = useCallback(
    (text: string) => {
      if (!editor || isReadOnly) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor, isReadOnly]
  );

  // Show loading state until local sync completes
  if (!isLocalSynced) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-primary-500)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">
            Loading document from local storage...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-4">
            <ConnectionStatus status={connectionStatus} />
            <CollaborationBar users={connectedUsers} />
          </div>
          <div className="flex items-center gap-2">
            {/* Save snapshot button */}
            {!isReadOnly && (
              <button
                id="create-snapshot-btn"
                onClick={async () => {
                  const state = Y.encodeStateAsUpdate(ydoc);
                  const base64 = Buffer.from(state).toString("base64");
                  const label = prompt("Enter a label for this snapshot:");
                  if (!label) return;

                  try {
                    const res = await fetch(
                      `/api/documents/${documentId}/versions`,
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          label,
                          yjsSnapshot: base64,
                          contentPreview: getDocumentText().slice(0, 500),
                          contentHtml: getDocumentHtml(),
                        }),
                      }
                    );
                    if (!res.ok) throw new Error("Failed to save");
                    const { toast: showToast } = await import("sonner");
                    showToast.success("Snapshot saved!");
                  } catch {
                    const { toast: showToast } = await import("sonner");
                    showToast.error("Failed to save snapshot");
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] transition-all"
                title="Create a version snapshot"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" />
                </svg>
                Save Snapshot
              </button>
            )}

            {/* AI toggle */}
            <button
              id="ai-assistant-toggle"
              onClick={() => setShowAiPanel(!showAiPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                showAiPanel
                  ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              }`}
              title="AI Writing Assistant"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              AI Assistant
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {editor && !isReadOnly && <EditorToolbar editor={editor} />}

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>

        {/* Read-only banner */}
        {isReadOnly && (
          <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20 text-center">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              🔒 You have view-only access to this document
            </p>
          </div>
        )}
      </div>

      {/* AI Assistant Panel */}
      {showAiPanel && (
        <AiAssistant
          documentId={documentId}
          getDocumentText={getDocumentText}
          onInsert={insertAiText}
          onClose={() => setShowAiPanel(false)}
        />
      )}
    </div>
  );
}
