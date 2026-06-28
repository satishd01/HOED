"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
// NOTE: @tiptap/extension-collaboration-cursor@3.0.0 is a mislabeled v2 package that uses
// y-prosemirror directly, conflicting with @tiptap/extension-collaboration@3.27.1 which uses
// @tiptap/y-tiptap. Both register competing ySyncPluginKey instances → `.doc` crash.
// Cursor awareness is handled via HocuspocusProvider's onAwarenessUpdate instead.
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { PageBreak } from "../extensions/page-break";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { HocuspocusProvider } from "@hocuspocus/provider";
import { toast } from "sonner";
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
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");
  const [connectedUsers, setConnectedUsers] = useState<
    Array<{ name: string; color: string }>
  >([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const restoreAppliedRef = useRef(false);

  // Create Yjs document — stable across renders
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Hold providers in refs so they are stable but created after mount
  const localProviderRef = useRef<IndexeddbPersistence | null>(null);
  const remoteProviderRef = useRef<HocuspocusProvider | null>(null);

  // Create providers after mount — avoids setState-before-mount warning
  useEffect(() => {
    // IndexedDB persistence — loads document from local cache instantly
    const localProvider = new IndexeddbPersistence(`syncforge-${documentId}`, ydoc);

    // Safety timeout: if 'synced' never fires (new document or IDB unavailable),
    // unblock the editor after 2 seconds rather than hanging forever.
    const syncTimeout = setTimeout(() => {
      setIsLocalSynced(true);
    }, 2000);

    localProvider.on("synced", () => {
      clearTimeout(syncTimeout);
      setIsLocalSynced(true);
    });
    localProviderRef.current = localProvider;

    // WebSocket provider — syncs with Hocuspocus collaboration server
    const remoteProvider = new HocuspocusProvider({
      url: WS_SERVER_URL,
      name: documentId,
      document: ydoc,
      token: async () => {
        const res = await fetch(`/api/documents/${documentId}/collaboration-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch collaboration token");
        const data = await res.json();
        return data.token as string;
      },
      onConnect: () => setConnectionStatus("connected"),
      onDisconnect: () => setConnectionStatus("disconnected"),
      onStatus: ({ status }) => {
        setConnectionStatus(
          status === "connected" ? "connected" : status === "connecting" ? "connecting" : "disconnected"
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

    // Broadcast this user's presence for the awareness bar
    remoteProvider.setAwarenessField("user", { name: userName, color: userColor });

    remoteProviderRef.current = remoteProvider;

    return () => {
      remoteProvider.destroy();
      localProvider.destroy();
      ydoc.destroy();
      localProviderRef.current = null;
      remoteProviderRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // Initialize TipTap editor.
  // CRITICAL: StarterKit's `history` plugin MUST be disabled when using Yjs Collaboration.
  // StarterKit's history and @tiptap/y-tiptap's ySyncPlugin both try to own the
  // ProseMirror history state, causing ySyncPluginKey.getState() to return undefined → crash.
  const editor = useEditor(
    {
      immediatelyRender: false,
      editable: !isReadOnly,
      extensions: [
        StarterKit.configure({
          // Yjs handles undo/redo via its own UndoManager — disable StarterKit's history
          // @ts-expect-error - history is a valid option but missing from StarterKitOptions type
          history: false,
        }),
        Collaboration.configure({
          document: ydoc,
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
        PageBreak,
      ],
    },
    [documentId, isReadOnly]
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

  // Auto-snapshot: after 5 minutes of inactivity while online, create an auto-save
  const autoSnapshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSnapshotContentRef = useRef<string>("");

  useEffect(() => {
    if (!editor || isReadOnly) return;

    const scheduleAutoSnapshot = () => {
      if (autoSnapshotTimerRef.current) clearTimeout(autoSnapshotTimerRef.current);
      autoSnapshotTimerRef.current = setTimeout(async () => {
        if (!navigator.onLine) return; // Only auto-save when online
        const currentText = editor.getText();
        if (!currentText.trim() || currentText === lastAutoSnapshotContentRef.current) return;

        const state = Y.encodeStateAsUpdate(ydoc);
        const base64 = Buffer.from(state).toString("base64");
        const label = `Auto-save ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

        try {
          await fetch(`/api/documents/${documentId}/versions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              label,
              yjsSnapshot: base64,
              contentPreview: currentText.slice(0, 500),
              contentHtml: editor.getHTML(),
            }),
          });
          lastAutoSnapshotContentRef.current = currentText;
        } catch {
          // Silent fail — auto-save is best-effort
        }
      }, 5 * 60 * 1000); // 5 minutes
    };

    // Reset the timer on every transaction (typing activity)
    editor.on("transaction", scheduleAutoSnapshot);

    return () => {
      editor.off("transaction", scheduleAutoSnapshot);
      if (autoSnapshotTimerRef.current) clearTimeout(autoSnapshotTimerRef.current);
    };
  }, [editor, isReadOnly, documentId, ydoc]);

  // Keyboard shortcuts: Ctrl+S → snapshot prompt, Ctrl+/ → toggle AI panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isReadOnly || !editor) return;
        const label = prompt("Enter a label for this snapshot:");
        if (!label) return;
        const doSave = async () => {
          const state = Y.encodeStateAsUpdate(ydoc);
          const base64 = Buffer.from(state).toString("base64");
          try {
            const res = await fetch(`/api/documents/${documentId}/versions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                label,
                yjsSnapshot: base64,
                contentPreview: editor.getText().slice(0, 500),
                contentHtml: editor.getHTML(),
              }),
            });
            if (!res.ok) throw new Error();
            const { toast: showToast } = await import("sonner");
            showToast.success("Snapshot saved!");
          } catch {
            const { toast: showToast } = await import("sonner");
            showToast.error("Failed to save snapshot");
          }
        };
        void doSave();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowAiPanel((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editor, isReadOnly, documentId, ydoc]);

  useEffect(() => {
    if (!editor || !isLocalSynced || restoreAppliedRef.current) {
      return;
    }

    const rawRestore = sessionStorage.getItem(`syncforge-restore:${documentId}`);
    if (!rawRestore) return;

    const applyRestore = async () => {
      try {
        const restoreData = JSON.parse(rawRestore) as {
          documentId: string;
          versionId: string;
          versionLabel: string;
        };

        if (restoreData.documentId !== documentId || !restoreData.versionId) {
          return;
        }

        const res = await fetch(
          `/api/documents/${documentId}/versions/${restoreData.versionId}/restore`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error("Failed to fetch restore snapshot");

        const data = await res.json();
        const snapshotBase64 = data.version?.yjsSnapshot as string;
        if (!snapshotBase64) throw new Error("Restore snapshot missing");

        const snapshotBytes = Uint8Array.from(atob(snapshotBase64), (char) => char.charCodeAt(0));

        Y.applyUpdate(ydoc, snapshotBytes);
        restoreAppliedRef.current = true;
        sessionStorage.removeItem(`syncforge-restore:${documentId}`);
        toast.success(`Restored ${restoreData.versionLabel}`);
      } catch {
        sessionStorage.removeItem(`syncforge-restore:${documentId}`);
        toast.error("Unable to restore that version");
      }
    };

    void applyRestore();
  }, [documentId, editor, isLocalSynced, ydoc]);

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
    <div className="flex h-full relative bg-[var(--bg-tertiary)] overflow-hidden">
      <div className="flex-1 flex flex-col h-full">
        {/* Toolbar & Status Row */}
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm z-10 shrink-0">
          <div className="flex-1 min-w-0 overflow-x-auto scrollbar-hide mr-4">
            {editor && !isReadOnly && <EditorToolbar editor={editor} />}
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--border-color)] shrink-0">
            <CollaborationBar users={connectedUsers} />
            
            <div className="flex items-center gap-2">
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
                  title="Save Snapshot"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                  </svg>
                  <span className="hidden lg:inline">Save</span>
                </button>
              )}

              <button
                id="toggle-ai-panel-btn"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showAiPanel 
                    ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]" 
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
                }`}
                title="AI Assistant (Ctrl+/)"
              >
                ✨
              </button>
            </div>
          </div>
        </div>

        {/* Editor canvas content */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          <EditorContent
            editor={editor}
            className="paper-canvas prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none"
          />
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
