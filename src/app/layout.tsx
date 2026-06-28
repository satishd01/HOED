import type { Metadata } from "next";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "SyncScribe — Collaborative Document Editor",
  description:
    "A local-first, collaborative document editor with offline synchronization, deterministic conflict resolution, and granular version control.",
  keywords: [
    "document editor",
    "collaboration",
    "offline",
    "CRDT",
    "real-time",
    "version control",
  ],
  authors: [{ name: "SyncScribe" }],
  openGraph: {
    title: "SyncScribe — Collaborative Document Editor",
    description:
      "Edit documents together in real-time. Works offline. Never lose your changes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
