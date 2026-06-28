"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Version {
  id: string;
  documentId: string;
  versionNumber: number;
  label: string;
  contentPreview?: string;
  contentHtml?: string;
  createdAt: string;
  creator: { id: string; name: string; email: string };
}

export default function VersionHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadVersions = async () => {
      try {
        const res = await fetch(`/api/documents/${id}/versions`);
        if (!res.ok) throw new Error("Failed to fetch versions");
        const data = await res.json();
        if (isMounted) {
          setVersions(data.versions || []);
        }
      } catch {
        toast.error("Failed to load version history");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadVersions();

    return () => {
      isMounted = false;
    };
  }, [id]);

  function handleRestore(versionId: string) {
    if (!confirm("Are you sure you want to restore this version? This will create a new CRDT state from the chosen snapshot.")) return;

    sessionStorage.setItem(
      `syncforge-restore:${id}`,
      JSON.stringify({
        documentId: id,
        versionId,
        versionLabel: selectedVersion?.label || "Snapshot",
      })
    );

    toast.success("Restoration queued. Opening the editor now.");
    router.push(`/documents/${id}`);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      relative: getRelativeTime(date),
    };
  }

  function getRelativeTime(date: Date) {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <div className="flex h-screen">
      {/* Timeline panel */}
      <div className="w-96 border-r border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col">
        {/* Header */}
        <div className="h-[var(--header-height)] flex items-center px-4 gap-3 border-b border-[var(--border-color)] shrink-0">
          <button
            onClick={() => router.push(`/documents/${id}`)}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            aria-label="Back to editor"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Version History
            </h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              {versions.length} snapshots
            </p>
          </div>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-xl animate-shimmer" />
              ))}
            </div>
          )}

          {!isLoading && versions.length === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mb-1">
                No snapshots yet
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Save a snapshot in the editor to see it here
              </p>
            </div>
          )}

          {!isLoading && versions.length > 0 && (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-[var(--border-color)]" />

              <div className="space-y-3">
                {versions.map((version, index) => {
                  const { date, time, relative } = formatDate(version.createdAt);
                  const isSelected = selectedVersion?.id === version.id;

                  return (
                    <div
                      key={version.id}
                      onClick={() => setSelectedVersion(version)}
                      className={`relative pl-10 cursor-pointer animate-fade-in`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-2.5 top-4 w-3 h-3 rounded-full border-2 transition-all ${
                          isSelected
                            ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)] scale-125"
                            : "bg-[var(--bg-secondary)] border-[var(--border-color)]"
                        }`}
                      />

                      <div
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          isSelected
                            ? "bg-[var(--color-primary-500)]/5 border-[var(--color-primary-500)]/30"
                            : "bg-[var(--bg-primary)] border-[var(--border-color)] hover:border-[var(--color-primary-400)]/30"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                            {version.label}
                          </h4>
                          <span className="text-[10px] font-medium text-[var(--text-tertiary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded-full">
                            v{version.versionNumber}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-tertiary)] mb-2">
                          {relative} · {time} · {date}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                          by {version.creator.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview panel */}
      <div className="flex-1 flex flex-col bg-[var(--bg-primary)]">
        {selectedVersion ? (
          <>
            <div className="h-[var(--header-height)] flex items-center justify-between px-6 border-b border-[var(--border-color)] shrink-0">
              <div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {selectedVersion.label}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Version {selectedVersion.versionNumber} · by {selectedVersion.creator.name}
                </p>
              </div>
              <button
                onClick={() => handleRestore(selectedVersion.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all shadow-md"
                id="restore-version-btn"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Restore This Version
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-3xl mx-auto">
                {selectedVersion.contentHtml ? (
                  <div
                    className="tiptap prose prose-neutral dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedVersion.contentHtml }}
                  />
                ) : selectedVersion.contentPreview ? (
                  <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                    {selectedVersion.contentPreview}
                  </div>
                ) : (
                  <p className="text-[var(--text-tertiary)] italic">
                    No preview available for this version
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Select a version to preview
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
