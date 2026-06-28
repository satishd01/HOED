"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "sonner";

/**
 * Root providers wrapper — combines session, theme, and toast providers.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)",
            },
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
