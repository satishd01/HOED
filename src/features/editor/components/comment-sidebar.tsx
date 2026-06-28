import { useEffect, useState, useRef } from "react";
import * as Y from "yjs";
import { Editor } from "@tiptap/react";

interface CommentReply {
  id: string;
  content: string;
  authorName: string;
  authorColor: string;
  createdAt: number;
}

export interface ThreadedComment {
  id: string;
  content: string;
  authorName: string;
  authorColor: string;
  createdAt: number;
  resolved: boolean;
  replies: CommentReply[];
}

interface CommentSidebarProps {
  editor: Editor | null;
  ydoc: Y.Doc;
  currentUser: { name: string; color: string };
  activeCommentId: string | null;
  onClose: () => void;
}

export default function CommentSidebar({
  editor,
  ydoc,
  currentUser,
  activeCommentId,
  onClose,
}: CommentSidebarProps) {
  const [comments, setComments] = useState<ThreadedComment[]>([]);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const commentsMap = ydoc.getMap<ThreadedComment>("comments");
    const updateComments = () => {
      const allComments = Array.from(commentsMap.values()).filter((c) => !c.resolved);
      setComments(allComments.sort((a, b) => a.createdAt - b.createdAt));
    };

    commentsMap.observe(updateComments);
    updateComments();
    
    return () => {
      commentsMap.unobserve(updateComments);
    };
  }, [ydoc]);

  // Scroll to active comment if it changes
  useEffect(() => {
    if (activeCommentId) {
      const el = document.getElementById(`comment-thread-${activeCommentId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [activeCommentId]);

  const handleResolve = (commentId: string) => {
    if (!editor) return;
    
    const commentsMap = ydoc.getMap<ThreadedComment>("comments");
    const comment = commentsMap.get(commentId);
    if (comment) {
      // Mark as resolved
      commentsMap.set(commentId, { ...comment, resolved: true });
    }
    
    // Remove highlight mark from editor
    editor.commands.unsetComment(commentId);
  };

  const handleReplySubmit = (commentId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    const commentsMap = ydoc.getMap<ThreadedComment>("comments");
    const comment = commentsMap.get(commentId);
    if (comment) {
      const newReply: CommentReply = {
        id: crypto.randomUUID(),
        content,
        authorName: currentUser.name,
        authorColor: currentUser.color,
        createdAt: Date.now(),
      };
      
      commentsMap.set(commentId, {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      });
      
      // Clear input
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    }
  };

  const handleInitialCommentSubmit = (commentId: string) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    const commentsMap = ydoc.getMap<ThreadedComment>("comments");
    const comment = commentsMap.get(commentId);
    if (comment) {
      commentsMap.set(commentId, { ...comment, content });
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col h-full shadow-xl z-20 shrink-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
        <h3 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <svg className="w-4 h-4 text-[var(--color-primary-500)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comments
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[var(--bg-tertiary)]">
        {comments.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-xl">💬</span>
            </div>
            <p className="text-sm font-medium text-[var(--text-primary)]">No comments yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Highlight text and click Add Comment</p>
          </div>
        ) : (
          comments.map((thread) => (
            <div
              key={thread.id}
              id={`comment-thread-${thread.id}`}
              className={`bg-[var(--bg-primary)] rounded-xl border p-4 shadow-sm transition-all ${
                activeCommentId === thread.id
                  ? "border-[var(--color-primary-500)] ring-1 ring-[var(--color-primary-500)]/30"
                  : "border-[var(--border-color)]"
              }`}
            >
              {/* Original Comment */}
              <div className="flex gap-3">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: thread.authorColor }}
                >
                  {thread.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate pr-2">
                      {thread.authorName}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                      {formatDate(thread.createdAt)}
                    </span>
                  </div>
                  {thread.content ? (
                    <p className="text-sm text-[var(--text-secondary)] mt-1 break-words">
                      {thread.content.split(/(@[\w]+)/g).map((part, i) => 
                        part.startsWith('@') ? <span key={i} className="text-[var(--color-primary-500)] font-medium bg-[var(--color-primary-500)]/10 px-1 rounded">{part}</span> : part
                      )}
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      <textarea
                        autoFocus
                        placeholder="Type your comment... (use @ to mention)"
                        value={replyInputs[thread.id] || ""}
                        onChange={(e) => setReplyInputs({ ...replyInputs, [thread.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleInitialCommentSubmit(thread.id);
                          }
                        }}
                        className="w-full px-3 py-2 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)] resize-none"
                        rows={2}
                      />
                      <button
                        onClick={() => handleInitialCommentSubmit(thread.id)}
                        disabled={!replyInputs[thread.id]?.trim()}
                        className="self-end px-3 py-1.5 text-xs font-medium text-white bg-[var(--color-primary-500)] rounded-lg disabled:opacity-50"
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {thread.content && thread.replies && thread.replies.length > 0 && (
                <div className="mt-4 pl-4 border-l-2 border-[var(--border-color)] space-y-4">
                  {thread.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: reply.authorColor }}
                      >
                        {reply.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--text-primary)] truncate pr-2">
                            {reply.authorName}
                          </span>
                          <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5 break-words">
                          {reply.content.split(/(@[\w]+)/g).map((part, i) => 
                            part.startsWith('@') ? <span key={i} className="text-[var(--color-primary-500)] font-medium bg-[var(--color-primary-500)]/10 px-1 rounded">{part}</span> : part
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              {thread.content && (
                <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply... (type @ to mention)"
                      value={replyInputs[thread.id] || ""}
                      onChange={(e) => setReplyInputs({ ...replyInputs, [thread.id]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleReplySubmit(thread.id);
                      }}
                      className="flex-1 px-3 py-1.5 text-sm bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
                    />
                    <button
                      onClick={() => handleReplySubmit(thread.id)}
                      disabled={!replyInputs[thread.id]?.trim()}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-[var(--color-primary-500)] rounded-lg disabled:opacity-50"
                    >
                      Reply
                    </button>
                  </div>
                  <button
                    onClick={() => handleResolve(thread.id)}
                    className="w-full py-1.5 text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                  >
                    Resolve Thread
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={commentsEndRef} />
      </div>
    </div>
  );
}
