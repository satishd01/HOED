"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

// Lazy-load the editor to prevent SSR issues with Yjs/ProseMirror
const CollaborativeEditor = dynamic(
  () => import("@/features/editor/components/editor"),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

interface DocumentData {
  id: string;
  title: string;
  ownerId: string;
  currentUserRole: "owner" | "editor" | "viewer";
  owner: { id: string; name: string; email: string };
  collaborators: Array<{
    id: string;
    role: string;
    user: { id: string; name: string; email: string };
  }>;
}

function EditorSkeleton() {
  return (
    <div className="flex-1 p-8">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-10 w-64 animate-shimmer rounded-lg" />
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-4 w-3/4 animate-shimmer rounded" />
        <div className="h-4 w-5/6 animate-shimmer rounded" />
      </div>
    </div>
  );
}

export default function DocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<"editor" | "viewer">("editor");
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  async function fetchDocument() {
    try {
      const res = await fetch(`/api/documents/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Document not found");
          router.push("/documents");
          return;
        }
        throw new Error("Failed to fetch document");
      }
      const data = await res.json();
      setDocument(data.document);
      setTitle(data.document.title);
    } catch {
      toast.error("Failed to load document");
      router.push("/documents");
    } finally {
      setIsLoading(false);
    }
  }

  // Debounced title save
  const saveTitle = useCallback(
    async (newTitle: string) => {
      if (!newTitle.trim() || newTitle === document?.title) return;
      setIsSavingTitle(true);
      try {
        await fetch(`/api/documents/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
      } catch {
        // Silent fail for title save
      } finally {
        setIsSavingTitle(false);
      }
    },
    [id, document?.title]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== document?.title) {
        saveTitle(title);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [title, document?.title, saveTitle]);

  async function handleShare() {
    if (!shareEmail.trim()) return;
    setIsSharing(true);

    try {
      const res = await fetch(`/api/documents/${id}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: shareEmail, role: shareRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to share");
      }

      toast.success(`Shared with ${shareEmail} as ${shareRole}`);
      setShareEmail("");
      setShowShareDialog(false);
      fetchDocument(); // Refresh collaborators
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to share document"
      );
    } finally {
      setIsSharing(false);
    }
  }

  async function handleRemoveCollaborator(collabId: string) {
    try {
      const res = await fetch(
        `/api/documents/${id}/collaborators?collaboratorId=${collabId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove");
      toast.success("Collaborator removed");
      fetchDocument();
    } catch {
      toast.error("Failed to remove collaborator");
    }
  }

  if (isLoading) return <EditorSkeleton />;
  if (!document) return null;

  const isReadOnly = document.currentUserRole === "viewer";

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <header className="h-[var(--header-height)] border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center px-4 gap-4 shrink-0">
        {/* Back button */}
        <button
          onClick={() => router.push("/documents")}
          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
          aria-label="Back to documents"
          id="back-to-documents"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        {/* Title input */}
        <input
          id="document-title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isReadOnly}
          className="flex-1 bg-transparent text-lg font-semibold text-[var(--text-primary)] focus:outline-none placeholder:text-[var(--text-tertiary)] disabled:cursor-not-allowed"
          placeholder="Untitled Document"
        />

        {/* Saving indicator */}
        {isSavingTitle && (
          <span className="text-xs text-[var(--text-tertiary)] animate-pulse">
            Saving...
          </span>
        )}

        {/* Role badge */}
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            document.currentUserRole === "owner"
              ? "bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]"
              : document.currentUserRole === "editor"
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-amber-500/10 text-amber-500"
          }`}
        >
          {document.currentUserRole}
        </span>

        {/* Version history link */}
        <button
          onClick={() => router.push(`/documents/${id}/versions`)}
          className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
          title="Version History"
          id="version-history-btn"
          aria-label="Version history"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Share button (owner only) */}
        {document.currentUserRole === "owner" && (
          <button
            id="share-document-btn"
            onClick={() => setShowShareDialog(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all shadow-md"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Share
          </button>
        )}
      </header>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto bg-[var(--bg-primary)]">
        <CollaborativeEditor
          documentId={id}
          userName={session?.user?.name || "Anonymous"}
          userColor={`hsl(${(session?.user?.name?.charCodeAt(0) || 0) * 137.5 % 360}, 70%, 60%)`}
          isReadOnly={isReadOnly}
        />
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowShareDialog(false)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-lg animate-scale-in shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Share Document
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Invite collaborators by email
            </p>

            {/* Add collaborator form */}
            <div className="flex gap-2 mb-6">
              <input
                id="share-email-input"
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                placeholder="Email address..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent text-sm"
                onKeyDown={(e) => e.key === "Enter" && handleShare()}
              />
              <select
                id="share-role-select"
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value as "editor" | "viewer")}
                className="px-3 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
              >
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                id="confirm-share"
                onClick={handleShare}
                disabled={isSharing || !shareEmail.trim()}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 disabled:opacity-50 transition-all"
              >
                {isSharing ? "..." : "Invite"}
              </button>
            </div>

            {/* Current collaborators */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
                People with access
              </p>
              {document.collaborators.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-purple-400 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                    {c.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {c.user.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] truncate">
                      {c.user.email}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-[var(--text-secondary)] capitalize">
                    {c.role}
                  </span>
                  {c.role !== "owner" && (
                    <button
                      onClick={() => handleRemoveCollaborator(c.id)}
                      className="p-1 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 transition-colors"
                      aria-label={`Remove ${c.user.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowShareDialog(false)}
              className="mt-4 w-full py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
