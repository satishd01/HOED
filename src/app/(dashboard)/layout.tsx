"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { logoutUser } from "@/features/auth/actions/auth-actions";
import { useTheme } from "@/components/providers/theme-provider";
import { toast } from "sonner";
import OfflineBanner from "@/components/ui/offline-banner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();

  const handleLogout = async () => {
    await logoutUser();
    toast.success("Signed out successfully");
    router.push("/login");
    router.refresh();
  };

  const isEditorPage = pathname.match(/^\/documents\/[^/]+(?:\/versions)?$/);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <OfflineBanner />
      
      {/* Conditionally render Top Navigation for Dashboard (hide in Editor) */}
      {!isEditorPage && (
        <header className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] flex items-center justify-between px-6 shrink-0 fixed top-0 w-full z-40">
          {/* Left: Logo */}
          <Link href="/documents" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-500)] flex items-center justify-center shadow-sm">
              <svg className="w-4.5 h-4.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-[var(--text-primary)] tracking-tight">SyncForge</span>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
              title="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" /></svg>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary-400)] to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors ml-2"
            >
              Sign out
            </button>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className={`flex-1 flex flex-col ${!isEditorPage ? "pt-16" : ""}`}>
        {children}
      </main>
    </div>
  );
}
