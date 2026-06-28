import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden relative">
      {/* Background Abstract Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-[var(--color-primary-500)]/20 to-purple-500/20 rounded-full blur-[100px] animate-float" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-purple-600/10 to-[var(--color-primary-600)]/10 rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s', animationDelay: '2s' }} />

      {/* Navigation */}
      <nav className="backdrop-blur-xl bg-[var(--bg-primary)]/70 border-b border-[var(--border-color)] fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-purple-500 flex items-center justify-center shadow-lg shadow-[var(--color-primary-500)]/30">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-tight text-[var(--text-primary)]">SyncScribe</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 text-sm font-medium text-[var(--color-primary-500)] mb-8 animate-fade-in shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse shadow-[0_0_8px_var(--color-primary-500)]" />
            Next-Gen Collaborative Editor
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-6 animate-fade-in tracking-tight text-[var(--text-primary)]" style={{ animationDelay: "100ms" }}>
            Write Together, <br />
            <span className="gradient-text">Beautifully Simple.</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in leading-relaxed" style={{ animationDelay: "200ms" }}>
            A stunning, local-first document editor powered by CRDTs. Works seamlessly offline, syncs instantly online, and never loses a single keystroke.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="px-8 py-4 rounded-2xl text-base font-semibold text-white bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] transition-colors w-full sm:w-auto shadow-xl hover-lift"
            >
              Start Writing for Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-2xl text-base font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-colors w-full sm:w-auto hover-lift"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-5xl mx-auto mt-20 relative animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="relative rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-[var(--bg-secondary)] p-2">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent z-10 pointer-events-none h-full w-full opacity-80" />
            <div className="bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] h-64 md:h-96 w-full flex flex-col overflow-hidden">
              <div className="h-12 border-b border-[var(--border-color)] flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 h-6 w-48 bg-[var(--bg-tertiary)] rounded-md animate-pulse" />
              </div>
              <div className="flex-1 p-6 flex gap-6">
                <div className="hidden md:block w-48 h-full space-y-4">
                  <div className="h-4 w-full bg-[var(--bg-tertiary)] rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                  <div className="h-4 w-5/6 bg-[var(--bg-tertiary)] rounded animate-pulse" />
                </div>
                <div className="flex-1 space-y-6">
                  <div className="h-8 w-3/4 bg-[var(--text-primary)]/10 rounded-lg animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-3 w-full bg-[var(--bg-tertiary)] rounded animate-pulse" />
                    <div className="h-3 w-full bg-[var(--bg-tertiary)] rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                    <div className="h-3 w-4/5 bg-[var(--bg-tertiary)] rounded animate-pulse" style={{ animationDelay: '200ms' }} />
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
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
              A masterclass in modern editing.
            </h2>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
              Every interaction is thoughtfully designed to keep you in flow, powered by an architecture that never misses a beat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
            {/* Offline-First (Spans 2 columns) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-tertiary)] border border-[var(--border-color)] hover:border-[var(--color-primary-500)]/50 transition-all duration-300 hover-lift group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary-500)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[var(--color-primary-500)]/10 transition-colors" />
              <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] shadow-sm flex items-center justify-center text-3xl z-10">
                📡
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Local-First Architecture</h3>
                <p className="text-[var(--text-secondary)] max-w-md">
                  Zero loading spinners. Your documents load instantly from IndexedDB. Edit entirely offline, and we'll invisibly sync when you reconnect.
                </p>
              </div>
            </div>

            {/* AI Assistant */}
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/50 transition-all duration-300 hover-lift group flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-3xl text-purple-500">
                ✨
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">AI Copilot</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Brainstorm, rewrite, or summarize instantly powered by Vercel AI SDK.
                </p>
              </div>
            </div>

            {/* CRDT Engine */}
            <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-blue-500/50 transition-all duration-300 hover-lift flex flex-col justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-3xl">
                🔄
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Yjs CRDTs</h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Deterministic merging. No merge conflicts. Ever.
                </p>
              </div>
            </div>

            {/* Security & Access (Spans 2 columns) */}
            <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--text-primary)] transition-all duration-300 hover-lift flex flex-col justify-between overflow-hidden relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-3xl text-emerald-500 z-10">
                🔒
              </div>
              <div className="z-10">
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Enterprise-Grade Security</h3>
                <p className="text-[var(--text-secondary)] max-w-md">
                  Strict JWT authentication via Auth.js, granular role-based access control (Owner, Editor, Viewer), and robust payload size limits on our WebSockets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--text-primary)] flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-[var(--bg-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">SyncScribe</span>
          </div>
          <div className="text-sm text-[var(--text-secondary)] font-medium flex gap-6">
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Twitter</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">GitHub</span>
            <span className="hover:text-[var(--text-primary)] transition-colors cursor-pointer">Documentation</span>
          </div>
          <p className="text-sm text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} SyncScribe. Assignment 2.
          </p>
        </div>
      </footer>
    </div>
  );
}
