"use client";

import { useState, useRef, useEffect } from "react";
import { useCompletion } from "@ai-sdk/react";

interface AiAssistantProps {
  documentId: string;
  getDocumentText: () => string;
  onInsert: (text: string) => void;
  onClose: () => void;
}

type AiAction = "summarize" | "continue" | "improve" | "translate" | "brainstorm" | "custom";

const AI_ACTIONS: Array<{ id: AiAction; label: string; icon: string; description: string }> = [
  { id: "summarize", label: "Summarize", icon: "📝", description: "Generate a concise summary" },
  { id: "continue", label: "Continue Writing", icon: "✍️", description: "AI continues from your text" },
  { id: "improve", label: "Improve Writing", icon: "✨", description: "Fix grammar & enhance clarity" },
  { id: "translate", label: "Translate", icon: "🌐", description: "Translate to another language" },
  { id: "brainstorm", label: "Brainstorm", icon: "💡", description: "Generate related ideas" },
  { id: "custom", label: "Custom Prompt", icon: "🤖", description: "Ask AI anything about your doc" },
];

export default function AiAssistant({
  documentId,
  getDocumentText,
  onInsert,
  onClose,
}: AiAssistantProps) {
  const [selectedAction, setSelectedAction] = useState<AiAction | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [translateLang, setTranslateLang] = useState("Spanish");
  const [result, setResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Auto-scroll result area
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  async function handleExecute(action: AiAction) {
    setSelectedAction(action);
    setResult("");
    setIsStreaming(true);

    const content = getDocumentText();
    if (!content.trim()) {
      setResult("The document is empty. Please add some content first.");
      setIsStreaming(false);
      return;
    }

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          content: content.slice(0, 8000), // Limit context to prevent token overflow
          prompt: action === "translate" ? translateLang : action === "custom" ? customPrompt : undefined,
        }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No stream available");

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE data stream
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              fullText += text;
              setResult(fullText);
            } catch {
              // Skip non-JSON lines
            }
          }
        }
      }
    } catch (error) {
      setResult("Failed to generate response. Please check your AI API key and try again.");
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="w-80 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col h-full animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="text-sm">✨</span>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            AI Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-[var(--bg-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Close AI panel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Actions grid */}
      <div className="p-3 border-b border-[var(--border-color)]">
        <div className="grid grid-cols-2 gap-2">
          {AI_ACTIONS.map((action) => (
            <button
              key={action.id}
              id={`ai-action-${action.id}`}
              onClick={() => {
                if (action.id === "custom" || action.id === "translate") {
                  setSelectedAction(action.id);
                } else {
                  handleExecute(action.id);
                }
              }}
              disabled={isStreaming}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all duration-200 ${
                selectedAction === action.id
                  ? "bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/30"
                  : "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] border border-transparent"
              } disabled:opacity-50`}
            >
              <span className="text-lg">{action.icon}</span>
              <span className="text-[10px] font-medium text-[var(--text-primary)]">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom prompt / translate input */}
      {selectedAction === "custom" && (
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex gap-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Ask AI anything..."
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
              onKeyDown={(e) => e.key === "Enter" && handleExecute("custom")}
            />
            <button
              onClick={() => handleExecute("custom")}
              disabled={isStreaming || !customPrompt.trim()}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-[var(--color-primary-500)] disabled:opacity-50 transition-all"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {selectedAction === "translate" && (
        <div className="p-3 border-b border-[var(--border-color)]">
          <div className="flex gap-2">
            <select
              value={translateLang}
              onChange={(e) => setTranslateLang(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary-500)]"
            >
              {["Spanish", "French", "German", "Japanese", "Chinese", "Korean", "Hindi", "Arabic", "Portuguese", "Italian"].map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
            <button
              onClick={() => handleExecute("translate")}
              disabled={isStreaming}
              className="px-3 py-2 rounded-lg text-xs font-medium text-white bg-[var(--color-primary-500)] disabled:opacity-50 transition-all"
            >
              Translate
            </button>
          </div>
        </div>
      )}

      {/* Result area */}
      <div ref={resultRef} className="flex-1 overflow-y-auto p-4">
        {result ? (
          <div className="space-y-3">
            <div className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {result}
            </div>
            {!isStreaming && result && (
              <button
                onClick={() => onInsert(result)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all w-full justify-center"
                id="ai-insert-btn"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Insert into document
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-tertiary)] flex items-center justify-center mb-3">
              <span className="text-xl">🤖</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              Select an action above
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              AI will analyze your document and generate a response
            </p>
          </div>
        )}

        {isStreaming && (
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse" />
            <span className="text-xs text-[var(--text-tertiary)]">
              AI is thinking...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
