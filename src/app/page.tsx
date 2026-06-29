import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import Footer from "@/components/ui/footer";

export default async function HomePage() {
  const session = await auth();
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-x-hidden relative">
      {/* Simple Background */}
      <div className="absolute inset-0 bg-[var(--bg-primary)] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-[var(--bg-primary)]/70 border-b border-[var(--border-color)] fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-purple-500 flex items-center justify-center shadow-lg shadow-[var(--color-primary-500)]/30">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">SyncForge</span>
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link
                href="/documents"
                className="relative group px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-500)] via-purple-500 to-[var(--color-primary-500)] animate-border-glow"></div>
                <div className="relative z-10 flex items-center gap-2">
                  Dashboard
                </div>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  id="hero-cta-register"
                  className="relative group px-5 py-2.5 rounded-xl text-sm font-semibold text-white overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-500)] via-purple-500 to-[var(--color-primary-500)] animate-border-glow"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-48 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center flex flex-col items-center">


          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-[var(--text-primary)]">
            Write and collaborate <br />
            <span className="text-[var(--color-primary-500)]">in real-time.</span>
          </h1>

          <p className="text-lg md:text-2xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-12 animate-fade-in leading-relaxed font-light" style={{ animationDelay: "200ms" }}>
            A fast, offline-capable document editor. Share links, edit with your team, and never lose your work.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl text-lg font-bold text-white bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] transition-all w-full sm:w-auto shadow-[0_0_40px_rgba(99,102,241,0.4)] hover-lift"
            >
              Start Writing for Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl text-lg font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors w-full sm:w-auto hover-lift"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-20 relative">
          <div className="relative rounded-2xl md:rounded-[2rem] p-1 md:p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl">
            <div className="absolute inset-0 bg-[var(--bg-primary)] rounded-2xl md:rounded-[2rem] z-0" />

            {/* Editor Window */}
            <div className="relative z-10 bg-[var(--bg-secondary)] rounded-xl md:rounded-3xl border border-[var(--border-color)] overflow-hidden shadow-2xl flex flex-col h-[500px] md:h-[700px]">

              {/* Header / Toolbar */}
              <div className="h-14 border-b border-[var(--border-color)] bg-[var(--bg-primary)] flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                  {/* Window Controls */}
                  <div className="flex gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
                  </div>
                  {/* Formatting Tools Mock */}
                  <div className="hidden md:flex items-center gap-1 bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--border-color)]">
                    <div className="w-8 h-8 rounded hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-serif font-bold">B</div>
                    <div className="w-8 h-8 rounded hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-serif italic">I</div>
                    <div className="w-8 h-8 rounded hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-primary)] font-serif underline">U</div>
                  </div>
                </div>

                {/* Avatars */}
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-purple-500 flex items-center justify-center text-xs text-white font-bold z-20">S</div>
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-blue-500 flex items-center justify-center text-xs text-white font-bold z-10">J</div>
                    <div className="w-8 h-8 rounded-full border-2 border-[var(--bg-primary)] bg-emerald-500 flex items-center justify-center text-xs text-white font-bold z-0">A</div>
                  </div>
                  <div className="hidden md:flex px-3 py-1.5 rounded-lg bg-[var(--color-primary-500)] text-white text-xs font-semibold">Share</div>
                </div>
              </div>

              {/* Editor Content Area */}
              <div className="flex-1 bg-[var(--bg-tertiary)] overflow-hidden relative flex justify-center p-4 md:p-8">
                {/* Paper Canvas */}
                <div className="w-full max-w-[816px] h-full bg-[var(--bg-primary)] shadow-md rounded-sm border border-[var(--border-color)] p-8 md:p-16 relative overflow-hidden">

                  {/* Content */}
                  <div className="space-y-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] tracking-tight">Project Phoenix: Q3 Roadmap</h1>

                    <div className="flex items-center gap-2 text-[var(--text-tertiary)] text-xs md:text-sm border-b border-[var(--border-color)] pb-6">
                      <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded">Draft</span>
                      <span>•</span>
                      <span>Last edited by Sarah 2 mins ago</span>
                    </div>

                    <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
                      We&apos;re entering a pivotal phase for Project Phoenix. This document outlines our strategic objectives, key deliverables, and team allocations for the upcoming quarter.
                    </p>

                    <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)] mt-8 mb-4">1. Core Objectives</h2>
                    <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-2 text-base md:text-lg">
                      <li>Launch the real-time collaboration engine <span className="bg-emerald-500/20 text-emerald-500 text-xs px-2 py-0.5 rounded ml-2">High Priority</span></li>
                      <li>Implement end-to-end encryption for all document payloads</li>
                      <li>Redesign the user dashboard for optimal workflow</li>
                    </ul>

                    {/* Fake Cursor */}
                    <div className="absolute top-[320px] md:top-[340px] left-[220px] md:left-[350px] animate-pulse">
                      <div className="relative">
                        <div className="w-[2px] h-5 md:h-6 bg-blue-500" />
                        <div className="absolute top-full left-0 mt-1 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow-sm z-10">
                          Jason
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Marquee */}
      <section className="py-12 border-y border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden">
        <div className="animate-marquee flex gap-12 items-center pr-12">
          {[
            "Next.js 16", "TypeScript", "Yjs CRDTs", "Tiptap", "PostgreSQL",
            "Tailwind CSS v4", "Auth.js", "Vercel AI SDK", "WebSockets", "Drizzle ORM",
            "Next.js 16", "TypeScript", "Yjs CRDTs", "Tiptap", "PostgreSQL",
            "Tailwind CSS v4", "Auth.js", "Vercel AI SDK", "WebSockets", "Drizzle ORM"
          ].map((tech, i) => (
            <span key={i} className="text-xl md:text-2xl font-bold text-[var(--text-tertiary)] whitespace-nowrap opacity-50">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Bento Box Features */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[var(--text-primary)] mb-6 tracking-tight">
              Built for speed and reliability.
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto leading-relaxed">
              Everything you need to write and collaborate, without the clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Local-First (Spans 2 columns) */}
            <div className="md:col-span-2 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-500)] transition-colors flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-primary-500)] mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="z-10 relative">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Local-First Architecture</h3>
                <p className="text-[var(--text-secondary)] text-lg max-w-md leading-relaxed">
                  Zero loading spinners. Your documents load instantly from IndexedDB. Edit entirely offline, and we&apos;ll invisibly sync when you reconnect.
                </p>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-500)] transition-colors flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-primary-500)] mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="z-10 relative">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI Copilot</h3>
                <p className="text-[var(--text-secondary)]">
                  Brainstorm, rewrite, or summarize instantly powered by Vercel AI SDK.
                </p>
              </div>
            </div>

            {/* CRDT Engine */}
            <div className="p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-500)] transition-colors flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-primary-500)] mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="z-10 relative">
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Yjs CRDTs</h3>
                <p className="text-[var(--text-secondary)]">
                  Deterministic merging. No merge conflicts. Ever. Real-time collaboration built natively.
                </p>
              </div>
            </div>

            {/* Security & Access (Spans 2 columns) */}
            <div className="md:col-span-2 p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-500)] transition-colors flex flex-col justify-between">
              <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--color-primary-500)] mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="z-10 relative">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Enterprise-Grade Security</h3>
                <p className="text-[var(--text-secondary)] text-lg max-w-lg leading-relaxed">
                  Strict JWT authentication via Auth.js, granular role-based access control (Owner, Editor, Viewer), and robust payload size limits on our WebSockets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
