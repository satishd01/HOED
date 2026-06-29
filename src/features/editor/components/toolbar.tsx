"use client";

import { useState, useRef, useEffect } from "react";

import type { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  editor: Editor;
}

const ToolButton = ({
  onClick,
  isActive = false,
  children,
  title,
  id,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  id: string;
}) => (
  <button
    id={id}
    onClick={onClick}
    title={title}
    className={`p-2 rounded-lg transition-all duration-150 ${
      isActive
        ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-500)]"
        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
    }`}
    aria-label={title}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

const Separator = () => (
  <div className="w-px h-5 bg-[var(--border-color)] mx-1" />
);

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const styleMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
      if (styleMenuRef.current && !styleMenuRef.current.contains(event.target as Node)) {
        setShowStyleMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownload = (format: "html" | "txt") => {
    let content = "";
    let mimeType = "";
    let extension = "";

    if (format === "html") {
      content = editor.getHTML();
      mimeType = "text/html";
      extension = "html";
    } else if (format === "txt") {
      content = editor.getText();
      mimeType = "text/plain";
      extension = "txt";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-4 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]" role="toolbar" aria-label="Text formatting">
      {/* Text formatting */}
      <ToolButton
        id="toolbar-bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-underline"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (Ctrl+U)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-strikethrough"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-highlight"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Highlight"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15.68 4.32l-2.83 2.83L4 16v4h4l8.85-8.85 2.83-2.83-4-4zM7.17 18H6v-1.17l8.85-8.85 1.17 1.17L7.17 18zM20.71 5.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
      </ToolButton>

      <Separator />

      {/* Text Styles Dropdown */}
      <div className="relative" ref={styleMenuRef}>
        <button
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-150 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] text-sm font-medium min-w-[120px] justify-between border border-transparent hover:border-[var(--border-color)]"
          title="Text Styles"
        >
          <span className="truncate">
            {editor.isActive("heading", { level: 1 }) ? "Heading 1" : 
             editor.isActive("heading", { level: 2 }) ? "Heading 2" : 
             editor.isActive("heading", { level: 3 }) ? "Heading 3" : 
             "Normal text"}
          </span>
          <svg className={`w-3 h-3 transition-transform ${showStyleMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showStyleMenu && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 py-1 flex flex-col animate-scale-in">
            <button
              onClick={() => { editor.chain().focus().setParagraph().run(); setShowStyleMenu(false); }}
              className={`px-4 py-2 text-sm text-left ${editor.isActive("paragraph") ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)] font-semibold' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
              Normal text
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowStyleMenu(false); }}
              className={`px-4 py-2 text-xl font-bold text-left ${editor.isActive("heading", { level: 1 }) ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
              Heading 1
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowStyleMenu(false); }}
              className={`px-4 py-2 text-lg font-bold text-left ${editor.isActive("heading", { level: 2 }) ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
              Heading 2
            </button>
            <button
              onClick={() => { editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowStyleMenu(false); }}
              className={`px-4 py-2 text-base font-bold text-left ${editor.isActive("heading", { level: 3 }) ? 'bg-[var(--color-primary-500)]/10 text-[var(--color-primary-500)]' : 'text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'}`}
            >
              Heading 3
            </button>
          </div>
        )}
      </div>

      <Separator />

      {/* Lists */}
      <ToolButton
        id="toolbar-bullet-list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-ordered-list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        title="Numbered List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-task-list"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        isActive={editor.isActive("taskList")}
        title="Task List"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 5.18L10.59 16.6l-4.24-4.24 1.41-1.41 2.83 2.83 10-10L22 5.18zm-2.21 5.04c.13.57.21 1.17.21 1.78 0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8c1.58 0 3.04.46 4.28 1.25l1.44-1.44A9.9 9.9 0 0012 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-1.19-.22-2.33-.6-3.39l-1.61 1.61z"/></svg>
      </ToolButton>

      <Separator />

      {/* Block elements */}
      <ToolButton
        id="toolbar-blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-code"
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Inline Code"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-code-block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-horizontal-rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 11h16v2H4z"/></svg>
      </ToolButton>

      <Separator />

      {/* Alignment */}
      <ToolButton
        id="toolbar-align-left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        isActive={editor.isActive({ textAlign: "left" })}
        title="Align Left"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-align-center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        isActive={editor.isActive({ textAlign: "center" })}
        title="Align Center"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-align-right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        isActive={editor.isActive({ textAlign: "right" })}
        title="Align Right"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>
      </ToolButton>

      <Separator />

      {/* Undo / Redo — handled by Yjs */}
      <ToolButton
        id="toolbar-undo"
        onClick={() => editor.chain().focus().undo().run()}
        title="Undo (Ctrl+Z)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
      </ToolButton>

      <ToolButton
        id="toolbar-redo"
        onClick={() => editor.chain().focus().redo().run()}
        title="Redo (Ctrl+Y)"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" fill="currentColor"/></svg>
      </ToolButton>

      <Separator />

      {/* Page Break */}
      <ToolButton
        id="toolbar-page-break"
        onClick={() => editor.chain().focus().setPageBreak().run()}
        title="Insert Page Break"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13h-4v4h-2v-4H9v-2h4V7h2v4h4v2zM5 3v18h14V3H5zm12 16H7V5h10v14z" />
        </svg>
      </ToolButton>

      <Separator />

      {/* Download Options */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowDownloadMenu(!showDownloadMenu)}
          className="flex items-center gap-1 p-2 rounded-lg transition-all duration-150 text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] text-sm font-medium"
          title="Download Document"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <svg className={`w-3 h-3 transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDownloadMenu && (
          <div className="absolute top-full right-0 mt-1 w-40 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-lg z-50 py-1 flex flex-col animate-scale-in origin-top-right">
            <button
              onClick={() => handleDownload("html")}
              className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] text-left flex items-center gap-2"
            >
              <span className="font-semibold text-[var(--color-primary-500)]">HTML</span> Web Page
            </button>
            <button
              onClick={() => handleDownload("txt")}
              className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] text-left flex items-center gap-2"
            >
              <span className="font-semibold text-gray-500">TXT</span> Plain Text
            </button>
            <div className="h-px bg-[var(--border-color)] my-1" />
            <button
              onClick={() => {
                window.print();
                setShowDownloadMenu(false);
              }}
              className="px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] text-left flex items-center gap-2"
            >
              <span className="font-semibold text-red-500">PDF</span> Print / Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
