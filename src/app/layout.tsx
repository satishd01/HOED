import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SyncForge — Collaborative Document Editor",
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
  authors: [{ name: "SyncForge" }],
  openGraph: {
    title: "SyncForge — Collaborative Document Editor",
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
      <body className={`min-h-screen antialiased ${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
