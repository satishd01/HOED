import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="glass fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary-500)] to-purple-500 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-xl gradient-text">SyncScribe</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              id="hero-cta-register"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all shadow-lg shadow-[var(--color-primary-500)]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary-500)]/10 border border-[var(--color-primary-500)]/20 text-sm font-medium text-[var(--color-primary-500)] mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-500)] animate-pulse" />
            Local-First · Real-Time · AI-Powered
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
            Write Together,{" "}
            <span className="gradient-text">Anywhere</span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "200ms" }}>
            A collaborative document editor that works offline, syncs automatically,
            and never loses your changes. Powered by CRDTs and AI.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-2xl text-base font-semibold text-white bg-gradient-to-r from-[var(--color-primary-500)] to-purple-500 hover:from-[var(--color-primary-600)] hover:to-purple-600 transition-all shadow-xl shadow-[var(--color-primary-500)]/30 hover-lift"
            >
              Start Writing — It&apos;s Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-2xl text-base font-medium text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-400)]/50 transition-all hover-lift"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-4">
            Built for the Modern Writer
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-16 max-w-xl mx-auto">
            Every feature designed to keep you in flow, whether you&apos;re online or off.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "📡",
                title: "Offline-First",
                description:
                  "Your documents load instantly from local storage. No spinner, no waiting. Edit without internet — changes sync when you reconnect.",
              },
              {
                icon: "🔄",
                title: "CRDT Sync Engine",
                description:
                  "Powered by Yjs CRDTs with the YATA algorithm. Concurrent edits merge deterministically — no conflicts, no data loss.",
              },
              {
                icon: "👥",
                title: "Real-Time Collaboration",
                description:
                  "See other users' cursors in real-time. Share documents with granular roles: Owner, Editor, or Viewer.",
              },
              {
                icon: "⏳",
                title: "Version Time Travel",
                description:
                  "Capture snapshots of your document at any point. Browse the timeline and restore previous versions safely.",
              },
              {
                icon: "✨",
                title: "AI Writing Assistant",
                description:
                  "Summarize, continue writing, improve grammar, translate, and brainstorm — all powered by AI right in the editor.",
              },
              {
                icon: "🔒",
                title: "Enterprise Security",
                description:
                  "JWT authentication, role-based access control, payload size limits, and strict input validation at every layer.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--color-primary-400)]/30 transition-all duration-300 hover-lift animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center text-2xl mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-20 px-6 border-t border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-8">
            Built With Modern Tech
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Next.js 16",
              "TypeScript",
              "Yjs CRDTs",
              "Tiptap",
              "PostgreSQL",
              "Tailwind CSS",
              "Auth.js",
              "Vercel AI SDK",
              "WebSockets",
              "Drizzle ORM",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[var(--color-primary-500)] to-purple-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold gradient-text">SyncScribe</span>
          </div>
          <div className="text-sm text-[var(--text-tertiary)] text-center">
            Built by{" "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary-500)] hover:underline font-medium"
            >
              Developer
            </a>
            {" · "}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              GitHub
            </a>
            {" · "}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              LinkedIn
            </a>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            © {new Date().getFullYear()} SyncScribe. House of Edtech Assignment.
          </p>
        </div>
      </footer>
    </div>
  );
}
