"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  ownerId: string;
  contentPreview?: string;
  createdAt: string;
  updatedAt: string;
  owner: { id: string; name: string; email: string; avatarUrl?: string | null };
  collaborators: Array<{
    id: string;
    role: string;
    user: { id: string; name: string; email: string; avatarUrl?: string | null };
  }>;
}

export default function DocumentsPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDocuments();
  }, [fetchDocuments]);

  async function handleCreate() {
    if (!newTitle.trim()) return;
    setIsCreating(true);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!res.ok) throw new Error("Failed to create document");

      const data = await res.json();
      toast.success("Document created!");
      setShowCreateDialog(false);
      setNewTitle("");
      router.push(`/documents/${data.document.id}`);
    } catch {
      toast.error("Failed to create document");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, docId: string) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const res = await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Document deleted");
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch {
      toast.error("Failed to delete document");
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-8 pb-24">
      {/* "Start a new document" gallery */}
      <div className="bg-[var(--bg-secondary)]/50 rounded-3xl p-8 mb-12 border border-[var(--border-color)]">
        <h2 className="text-lg font-medium text-[var(--text-primary)] mb-6">Start a new document</h2>
        <div className="flex gap-6">
          <button
            id="create-document-btn"
            onClick={() => setShowCreateDialog(true)}
            className="flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform group"
          >
            <div className="w-36 h-48 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] group-hover:border-[var(--color-primary-500)] flex items-center justify-center shadow-sm relative overflow-hidden">
              {/* Paper line decorations */}
              <div className="absolute inset-0 p-4 pt-12 flex flex-col gap-2 opacity-10">
                <div className="h-1 bg-current w-full rounded-full" />
                <div className="h-1 bg-current w-[80%] rounded-full" />
                <div className="h-1 bg-current w-[90%] rounded-full" />
              </div>
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] flex items-center justify-center z-10 group-hover:bg-[var(--color-primary-500)] group-hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Blank Document</span>
          </button>
        </div>
      </div>

      {/* Recent documents header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-[var(--text-primary)]">
          Recent documents
        </h2>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 rounded-2xl animate-shimmer"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && documents.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center animate-float">
            <svg className="w-10 h-10 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            No documents yet
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Create your first document to start writing and collaborating
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all"
          >
            Create Document
          </button>
        </div>
      )}

      {/* Document grid */}
      {!isLoading && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              onClick={() => router.push(`/documents/${doc.id}`)}
              className="group p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--color-primary-400)]/50 cursor-pointer transition-all duration-200 hover-lift animate-fade-in flex flex-col justify-between min-h-[120px]"
              style={{ animationDelay: `${index * 50}ms` }}
              role="button"
              tabIndex={0}
              id={`document-card-${doc.id}`}
            >
              {/* Icon + Title */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary-100)] to-purple-100 dark:from-[var(--color-primary-900)]/30 dark:to-purple-900/30 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-[var(--color-primary-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--color-primary-500)] transition-colors">
                    {doc.title}
                  </h3>
                </div>
                <button
                  onClick={(e) => handleDelete(e, doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-500 transition-all"
                  title="Delete document"
                  aria-label={`Delete ${doc.title}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                <span>{formatDate(doc.updatedAt)}</span>
                <div className="flex -space-x-2">
                  {doc.collaborators.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-purple-400 flex items-center justify-center text-[10px] font-semibold text-white border-2 border-[var(--bg-secondary)]"
                      title={c.user.name}
                    >
                      {c.user.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {doc.collaborators.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[10px] font-medium text-[var(--text-secondary)] border-2 border-[var(--bg-secondary)]">
                      +{doc.collaborators.length - 3}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateDialog(false)}
          />
          <div className="relative glass rounded-2xl p-6 w-full max-w-md animate-scale-in shadow-2xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Create New Document
            </h2>
            <input
              id="new-document-title"
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent transition-all mb-4"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                Cancel
              </button>
              <button
                id="confirm-create-document"
                onClick={handleCreate}
                disabled={isCreating || !newTitle.trim()}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
